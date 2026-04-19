import os
import re
import warnings
import numpy as np
import pandas as pd
from tqdm import tqdm

warnings.filterwarnings("ignore")

# =========================
# 路径配置
# =========================
DATA_PATH = r"data"
OUTPUT_FILE = r"train_features_final.csv"

# =========================
# 启用表
# =========================
KEEP_TABLES = {
    "学生基本信息",
    "本科生综合测评",
    "上网统计",
    "图书馆打卡记录",
    "门禁数据",
    "跑步打卡",
    "日常锻炼",
    "体测数据",
    "四六级成绩",
    "奖学金获奖",
    "社团活动",
    "学科竞赛",
    "课堂任务参与",
    "学生作业提交记录",
}

# =========================
# 主键映射
# =========================
ID_MAP = {
    "学生基本信息": ["XH"],
    "本科生综合测评": ["XH"],
    "上网统计": ["XSBH"],
    "图书馆打卡记录": ["cardId", "cardld"],
    "门禁数据": ["IDSERTAL"],
    "跑步打卡": ["USERNUM"],
    "日常锻炼": ["XH"],
    "体测数据": ["XH", "XM"],
    "四六级成绩": ["KS_XH"],
    "奖学金获奖": ["XSBH"],
    "社团活动": ["XSBH"],
    "学科竞赛": ["XHHGH"],
    "课堂任务参与": ["LOGIN_NAME"],
    "学生作业提交记录": ["CREATER_LOGIN_NAME"],
}

BASE_RENAME = {
    "XB": "性别",
    "MZMC": "民族",
    "ZZMMMC": "政治面貌",
    "CSRQ": "出生日期",
    "JG": "籍贯",
    "XSM": "学院",
    "ZYM": "专业",
}

# =========================
# 工具函数
# =========================
def clean_cols(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [
        str(c).strip().replace("\n", "").replace("\t", "").replace("\ufeff", "")
        for c in df.columns
    ]
    return df


def normalize_student_id(series: pd.Series) -> pd.Series:
    s = series.astype(str).str.strip().str.lower()
    s = s.str.replace(r"\.0$", "", regex=True)
    s = s.str.replace(r"\s+", "", regex=True)
    s = s.replace({"nan": np.nan, "none": np.nan, "": np.nan})
    return s


def find_col_by_candidates(df: pd.DataFrame, candidates):
    cols = {str(c).strip().lower(): c for c in df.columns}
    for cand in candidates:
        key = cand.strip().lower()
        if key in cols:
            return cols[key]
    return None


def to_numeric(df: pd.DataFrame, cols):
    for c in cols:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce")
    return df


def parse_datetime_safe(series: pd.Series):
    return pd.to_datetime(series, errors="coerce")


def parse_bmi_value(x):
    if pd.isna(x):
        return np.nan
    s = str(x).strip()

    try:
        v = float(s)
        if 5 <= v <= 60:
            return v
        return np.nan
    except Exception:
        pass

    m = re.match(r"^\s*(\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?)\s*$", s)
    if m:
        h = float(m.group(1))
        w = float(m.group(2))
        if h > 0 and w > 0:
            return w / ((h / 100) ** 2)
    return np.nan


def drop_all_empty_columns(df: pd.DataFrame, table_name: str):
    keep_cols = []
    dropped_cols = []

    for col in df.columns:
        s = df[col]
        if pd.api.types.is_numeric_dtype(s):
            valid = s.notna().sum()
        else:
            ss = s.astype(str).str.strip().str.lower()
            valid = ((s.notna()) & (ss != "") & (ss != "nan") & (ss != "none")).sum()

        if valid > 0:
            keep_cols.append(col)
        else:
            dropped_cols.append(col)

    if dropped_cols:
        print(f"🧹 {table_name} 删除全空列: {dropped_cols}")

    return df[keep_cols].copy()


def drop_all_zero_numeric_columns(df: pd.DataFrame):
    drop_cols = []
    for col in df.columns:
        if col == "student_id":
            continue
        if pd.api.types.is_numeric_dtype(df[col]):
            if (df[col].fillna(0) == 0).all():
                drop_cols.append(col)

    if drop_cols:
        print(f"🗑 删除全0数值列: {drop_cols}")
        df = df.drop(columns=drop_cols)

    return df


def drop_sparse_numeric_columns(df: pd.DataFrame, zero_threshold=0.98, keep_cols=None):
    if keep_cols is None:
        keep_cols = set()
    else:
        keep_cols = set(keep_cols)

    drop_cols = []
    for col in df.columns:
        if col == "student_id" or col in keep_cols:
            continue
        if pd.api.types.is_numeric_dtype(df[col]):
            zero_rate = (df[col].fillna(0) == 0).mean()
            if zero_rate >= zero_threshold:
                drop_cols.append(col)

    if drop_cols:
        print(f"🗑 删除高零值列(>= {zero_threshold:.0%}): {drop_cols}")
        df = df.drop(columns=drop_cols)

    return df


def maybe_read_file(path):
    if path.lower().endswith(".csv"):
        return pd.read_csv(path)
    if path.lower().endswith(".xlsx") or path.lower().endswith(".xls"):
        return pd.read_excel(path)
    return None


def safe_group_merge(base_df: pd.DataFrame, feat_df: pd.DataFrame, cols_to_merge):
    if feat_df is None or feat_df.empty:
        return base_df
    merged = base_df.merge(feat_df[["student_id"] + cols_to_merge], on="student_id", how="left")
    for col in cols_to_merge:
        hit_rate = merged[col].notna().mean()
        print(f"🔗 融合特征 {col} -> 命中率: {hit_rate:.2%}")
    return merged


def print_missing_report(df: pd.DataFrame):
    print("\n========== 缺失率检查 ==========")
    rows = []
    for c in df.columns:
        miss_rate = df[c].isna().mean()
        zero_rate = (df[c] == 0).mean() if pd.api.types.is_numeric_dtype(df[c]) else np.nan
        rows.append([c, miss_rate, zero_rate])
    rep = pd.DataFrame(rows, columns=["字段", "缺失率", "零值率"])
    print(rep.sort_values(["缺失率", "零值率"], ascending=[False, False]).to_string(index=False))


def get_col(df: pd.DataFrame, name: str, default=0.0):
    if name in df.columns:
        return df[name].fillna(default)
    return pd.Series(default, index=df.index)


def add_ratio_feature(df: pd.DataFrame, new_col: str, num_col: str, den_col: str, add_one=True):
    num = get_col(df, num_col, 0)
    den = get_col(df, den_col, 0)
    if add_one:
        df[new_col] = num / (den + 1)
    else:
        den = den.replace(0, np.nan)
        df[new_col] = num / den
        df[new_col] = df[new_col].fillna(0)
    return df


def safe_std(x):
    x = pd.to_numeric(x, errors="coerce").dropna()
    if len(x) <= 1:
        return np.nan
    return x.std()


def safe_cv(x):
    x = pd.to_numeric(x, errors="coerce").dropna()
    if len(x) <= 1:
        return np.nan
    mean = x.mean()
    if mean == 0 or pd.isna(mean):
        return np.nan
    return x.std() / mean


def add_recent_count_features(df, time_col, prefix, windows=(30, 60, 90)):
    if time_col not in df.columns:
        return None
    tmp = df.copy()
    tmp[time_col] = parse_datetime_safe(tmp[time_col])
    tmp = tmp[tmp[time_col].notna()].copy()
    if tmp.empty:
        return None

    max_time = tmp[time_col].max()
    out = pd.DataFrame({"student_id": tmp["student_id"].drop_duplicates().sort_values()})

    for w in windows:
        start = max_time - pd.Timedelta(days=w)
        sub = tmp[tmp[time_col] >= start]
        agg = sub.groupby("student_id").size().rename(f"最近{w}天{prefix}次数").reset_index()
        out = out.merge(agg, on="student_id", how="left")
    return out


def add_recent_mean_features(df, time_col, value_cols, prefix="", windows=(30, 60, 90)):
    if time_col not in df.columns:
        return None
    tmp = df.copy()
    tmp[time_col] = parse_datetime_safe(tmp[time_col])
    tmp = tmp[tmp[time_col].notna()].copy()
    if tmp.empty:
        return None

    for c in value_cols:
        if c in tmp.columns:
            tmp[c] = pd.to_numeric(tmp[c], errors="coerce")

    max_time = tmp[time_col].max()
    out = pd.DataFrame({"student_id": tmp["student_id"].drop_duplicates().sort_values()})

    for w in windows:
        start = max_time - pd.Timedelta(days=w)
        sub = tmp[tmp[time_col] >= start]
        for c in value_cols:
            if c in sub.columns:
                agg = sub.groupby("student_id")[c].mean().rename(f"最近{w}天{prefix}{c}均值").reset_index()
                out = out.merge(agg, on="student_id", how="left")
    return out

# =========================
# 读取数据
# =========================
df_dict = {}

print("========== 开始读取启用表 ==========")
for f in tqdm(os.listdir(DATA_PATH), desc="读取文件"):
    table_name = os.path.splitext(f)[0]
    if table_name not in KEEP_TABLES:
        continue

    path = os.path.join(DATA_PATH, f)
    try:
        df = maybe_read_file(path)
        if df is None:
            continue
    except Exception as e:
        print(f"❌ 读取失败: {table_name} -> {e}")
        continue

    df = clean_cols(df)
    df = drop_all_empty_columns(df, table_name)

    id_col = find_col_by_candidates(df, ID_MAP.get(table_name, []))
    if not id_col:
        print(f"⚠️ 跳过 {table_name}（未识别关键列） -> {list(df.columns)}")
        continue

    df = df.rename(columns={id_col: "student_id"})
    df["student_id"] = normalize_student_id(df["student_id"])

    before = len(df)
    df = df[df["student_id"].notna()]
    unique_cnt = df["student_id"].nunique()
    print(f"✅ {table_name} -> 关键列: student_id | 原始行数: {before} | 有效行数: {len(df)} | 唯一学生数: {unique_cnt}")

    df_dict[table_name] = df

# =========================
# 主表
# =========================
if "学生基本信息" not in df_dict:
    raise ValueError("缺少主表：学生基本信息")

base = df_dict["学生基本信息"].copy()
feature_df = base[["student_id"]].drop_duplicates().copy()
print(f"\n🎯 主表学生数: {len(feature_df)}")

# =========================
# 基础画像
# =========================
basic_cols = [c for c in ["XB", "MZMC", "ZZMMMC", "CSRQ", "JG", "XSM", "ZYM"] if c in base.columns]
if basic_cols:
    base_info = base[["student_id"] + basic_cols].drop_duplicates("student_id").copy()
    base_info = base_info.rename(columns=BASE_RENAME)
    feature_df = feature_df.merge(base_info, on="student_id", how="left")
    print(f"✅ 基础画像字段保留: {list(BASE_RENAME.values())}")

# =========================
# 1. 上网统计
# =========================
if "上网统计" in df_dict:
    df = df_dict["上网统计"].copy()
    df = to_numeric(df, ["SWLJSC", "XXPJZ"])

    agg = df.groupby("student_id", as_index=False).agg(
        上网时长=("SWLJSC", "sum"),
        月均上网时长=("SWLJSC", "mean"),
        上网波动=("SWLJSC", "std"),
        上网变异系数=("SWLJSC", safe_cv),
    )
    feature_df = safe_group_merge(feature_df, agg, [c for c in agg.columns if c != "student_id"])

# =========================
# 2. 门禁数据
# =========================
if "门禁数据" in df_dict:
    df = df_dict["门禁数据"].copy()

    if "LOGINTIME" in df.columns:
        df["LOGINTIME"] = parse_datetime_safe(df["LOGINTIME"])
        df["hour"] = df["LOGINTIME"].dt.hour
        df["date"] = df["LOGINTIME"].dt.date
        df["weekday"] = df["LOGINTIME"].dt.dayofweek
        df["夜间标记"] = df["hour"].apply(lambda x: 1 if pd.notna(x) and (x >= 22 or x <= 6) else 0)
        df["周末标记"] = df["weekday"].apply(lambda x: 1 if pd.notna(x) and x >= 5 else 0)
        df["白天标记"] = df["hour"].apply(lambda x: 1 if pd.notna(x) and 8 <= x < 18 else 0)
    else:
        df["夜间标记"] = 0
        df["周末标记"] = 0
        df["白天标记"] = 0
        df["date"] = np.nan

    if "LOGINSIGN" in df.columns:
        sign = pd.to_numeric(df["LOGINSIGN"], errors="coerce")
        df["进门标记"] = (sign == 0).astype(int)
        df["出门标记"] = (sign == 1).astype(int)
    else:
        df["进门标记"] = 0
        df["出门标记"] = 0

    agg = df.groupby("student_id", as_index=False).agg(
        门禁次数=("student_id", "size"),
        进门次数=("进门标记", "sum"),
        出门次数=("出门标记", "sum"),
        夜间次数=("夜间标记", "sum"),
        周末门禁次数=("周末标记", "sum"),
        白天门禁次数=("白天标记", "sum"),
        门禁活跃天数=("date", "nunique"),
    )
    feature_df = safe_group_merge(feature_df, agg, [c for c in agg.columns if c != "student_id"])

# =========================
# 3. 图书馆打卡
# =========================
if "图书馆打卡记录" in df_dict:
    df = df_dict["图书馆打卡记录"].copy()

    if "visittime" in df.columns:
        df["visittime"] = parse_datetime_safe(df["visittime"])
        df["date"] = df["visittime"].dt.date
        df["hour"] = df["visittime"].dt.hour
        df["weekday"] = df["visittime"].dt.dayofweek
        df["晚间到馆"] = df["hour"].apply(lambda x: 1 if pd.notna(x) and x >= 18 else 0)
        df["周末到馆"] = df["weekday"].apply(lambda x: 1 if pd.notna(x) and x >= 5 else 0)
        df["白天到馆"] = df["hour"].apply(lambda x: 1 if pd.notna(x) and 8 <= x < 18 else 0)
    else:
        df["date"] = np.nan
        df["晚间到馆"] = 0
        df["周末到馆"] = 0
        df["白天到馆"] = 0

    if "direction" in df.columns:
        dd = pd.to_numeric(df["direction"], errors="coerce")
        df["进馆标记"] = (dd == 1).astype(int)
        df["出馆标记"] = (dd == 2).astype(int)
    else:
        df["进馆标记"] = 0
        df["出馆标记"] = 0

    agg = df.groupby("student_id", as_index=False).agg(
        图书馆次数=("student_id", "size"),
        进馆次数=("进馆标记", "sum"),
        出馆次数=("出馆标记", "sum"),
        图书馆活跃天数=("date", "nunique"),
        晚间到馆次数=("晚间到馆", "sum"),
        周末到馆次数=("周末到馆", "sum"),
        白天到馆次数=("白天到馆", "sum"),
    )
    feature_df = safe_group_merge(feature_df, agg, [c for c in agg.columns if c != "student_id"])

# =========================
# 4. 跑步打卡
# =========================
if "跑步打卡" in df_dict:
    df = df_dict["跑步打卡"].copy()
    if "PUNCH_DAY" in df.columns:
        df["PUNCH_DAY"] = parse_datetime_safe(df["PUNCH_DAY"])
        df["run_date"] = df["PUNCH_DAY"].dt.date

    agg = df.groupby("student_id", as_index=False).agg(
        跑步次数=("student_id", "size"),
        跑步活跃天数=("run_date", "nunique") if "run_date" in df.columns else ("student_id", "size"),
        跑步学期数=("TERM_ID", "nunique") if "TERM_ID" in df.columns else ("student_id", "size"),
    )

    if "PUNCH_DAY" in df.columns:
        recent_cnt = add_recent_count_features(df, "PUNCH_DAY", "跑步", windows=(30, 60, 90))
        if recent_cnt is not None:
            agg = agg.merge(recent_cnt, on="student_id", how="left")

    feature_df = safe_group_merge(feature_df, agg, [c for c in agg.columns if c != "student_id"])

# =========================
# 5. 日常锻炼
# =========================
if "日常锻炼" in df_dict:
    df = df_dict["日常锻炼"].copy()
    df = to_numeric(df, ["DKCS"])

    agg = df.groupby("student_id", as_index=False).agg(
        锻炼次数=("DKCS", "sum"),
        锻炼均次=("DKCS", "mean"),
        锻炼波动=("DKCS", safe_std),
        锻炼变异系数=("DKCS", safe_cv),
        锻炼周数=("ZC", "nunique") if "ZC" in df.columns else ("student_id", "size"),
        锻炼学期数=("XQ", "nunique") if "XQ" in df.columns else ("student_id", "size"),
    )
    feature_df = safe_group_merge(feature_df, agg, [c for c in agg.columns if c != "student_id"])

# =========================
# 6. 体测数据
# =========================
if "体测数据" in df_dict:
    df = df_dict["体测数据"].copy()
    if "BMI" in df.columns:
        df["BMI"] = df["BMI"].apply(parse_bmi_value)

    num_cols = ["ZF", "FHL", "BMI", "WS", "LDTY", "ZWTQQ", "BB", "YQ", "YWQZ", "YTXS"]
    df = to_numeric(df, num_cols)

    agg_items = {}
    if "ZF" in df.columns:
        agg_items["体测分"] = ("ZF", "mean")
    if "FHL" in df.columns:
        agg_items["肺活量"] = ("FHL", "mean")
    if "BMI" in df.columns:
        agg_items["BMI"] = ("BMI", "mean")
    if "WS" in df.columns:
        agg_items["50米"] = ("WS", "mean")
    if "LDTY" in df.columns:
        agg_items["立定跳远"] = ("LDTY", "mean")
    if "ZWTQQ" in df.columns:
        agg_items["坐位体前屈"] = ("ZWTQQ", "mean")
    if "BB" in df.columns:
        agg_items["800米"] = ("BB", "mean")
    if "YQ" in df.columns:
        agg_items["1000米"] = ("YQ", "mean")
    if "YWQZ" in df.columns:
        agg_items["仰卧起坐"] = ("YWQZ", "mean")
    if "YTXS" in df.columns:
        agg_items["引体向上"] = ("YTXS", "mean")

    if agg_items:
        agg = df.groupby("student_id", as_index=False).agg(**agg_items)

        if "BMI" in agg.columns:
            agg["BMI偏低"] = (agg["BMI"] < 18.5).astype(float)
            agg["BMI偏高"] = (agg["BMI"] > 24).astype(float)

        feature_df = safe_group_merge(feature_df, agg, [c for c in agg.columns if c != "student_id"])

# =========================
# 7. 四六级
# =========================
if "四六级成绩" in df_dict:
    df = df_dict["四六级成绩"].copy()
    df = to_numeric(df, ["KS_CJ"])

    agg = df.groupby("student_id", as_index=False).agg(
        英语成绩=("KS_CJ", "max"),
        英语平均分=("KS_CJ", "mean"),
        英语考试次数=("KS_CJ", "count"),
        英语成绩波动=("KS_CJ", safe_std),
    )
    feature_df = safe_group_merge(feature_df, agg, [c for c in agg.columns if c != "student_id"])

# =========================
# 8. 奖学金
# =========================
if "奖学金获奖" in df_dict:
    df = df_dict["奖学金获奖"].copy()
    df = to_numeric(df, ["FFJE"])

    agg = df.groupby("student_id", as_index=False).agg(
        奖学金金额=("FFJE", "sum"),
        奖学金次数=("student_id", "size"),
    )
    feature_df = safe_group_merge(feature_df, agg, [c for c in agg.columns if c != "student_id"])

# =========================
# 9. 社团活动
# =========================
if "社团活动" in df_dict:
    df = df_dict["社团活动"].copy()
    agg = df.groupby("student_id", as_index=False).agg(
        社团次数=("student_id", "size"),
        社团活跃天数=("HDRQ", "nunique") if "HDRQ" in df.columns else ("student_id", "size"),
    )
    feature_df = safe_group_merge(feature_df, agg, [c for c in agg.columns if c != "student_id"])

# =========================
# 10. 学科竞赛
# =========================
if "学科竞赛" in df_dict:
    df = df_dict["学科竞赛"].copy()
    agg = df.groupby("student_id", as_index=False).agg(
        竞赛次数=("student_id", "size"),
    )
    feature_df = safe_group_merge(feature_df, agg, [c for c in agg.columns if c != "student_id"])

# =========================
# 11. 本科生综合测评
# =========================
if "本科生综合测评" in df_dict:
    df = df_dict["本科生综合测评"].copy()

    use_cols = {
        "综合成绩": "ZCJ",
        "成绩分": "CJF",
        "素质分": "SZF",
        "能力分": "NLF",
        "德育分": "DYF",
        "智育分": "ZYF",
        "体育分": "TYF",
    }

    real_cols = {}
    print("\n📊 综合测评字段最终审查：")
    for new_col, old_col in use_cols.items():
        if old_col in df.columns:
            tmp = pd.to_numeric(df[old_col], errors="coerce")
            nonnull = int(tmp.notna().sum())
            print(f"{new_col} -> {old_col} | 非空数: {nonnull}")
            if nonnull > 0:
                df[old_col] = tmp
                real_cols[new_col] = old_col
        else:
            print(f"{new_col} -> {old_col} | 不存在")

    if real_cols:
        agg_dict = {new_col: (old_col, "mean") for new_col, old_col in real_cols.items()}
        agg = df.groupby("student_id", as_index=False).agg(**agg_dict)
        feature_df = safe_group_merge(feature_df, agg, [c for c in agg.columns if c != "student_id"])

# =========================
# 12. 课堂任务参与
# =========================
has_online_features = False

if "课堂任务参与" in df_dict:
    df = df_dict["课堂任务参与"].copy()
    num_cols = [
        "JOB_NUM", "JOB_RATE", "VIDEOJOB_NUM", "VIDEOJOB_RATE", "VIDEOJOB_TIME",
        "TEST_NUM", "TEST_RATE", "TEST_AVGSCORE", "WORK_NUM", "WORK_RATE",
        "WORK_AVGSCORE", "EXAM_NUM", "EXAM_RATE", "EXAM_AVGSCORE", "PV",
        "SIGN_NUM", "SIGN_RATE", "COURSE_LIVE_TIME", "SPECIAL_TIME",
        "BBS_NUM", "TOPIC_NUM", "REPLY_NUM", "POINTS", "PAPER_NUM", "PAPER_RATE",
        "PICK_NUM", "ANSWER_NUM", "MARKSCORE_NUM", "MARKSCORE_RATE",
        "TASK_NUM", "TASK_RATE"
    ]
    df = to_numeric(df, num_cols)

    agg = df.groupby("student_id", as_index=False).agg(
        任务点完成率=("JOB_RATE", "mean") if "JOB_RATE" in df.columns else ("student_id", "size"),
        视频任务完成率=("VIDEOJOB_RATE", "mean") if "VIDEOJOB_RATE" in df.columns else ("student_id", "size"),
        视频学习时长=("VIDEOJOB_TIME", "sum") if "VIDEOJOB_TIME" in df.columns else ("student_id", "size"),
        视频学习时长均值=("VIDEOJOB_TIME", "mean") if "VIDEOJOB_TIME" in df.columns else ("student_id", "size"),
        视频学习时长波动=("VIDEOJOB_TIME", safe_std) if "VIDEOJOB_TIME" in df.columns else ("student_id", "size"),
        测验平均分=("TEST_AVGSCORE", "mean") if "TEST_AVGSCORE" in df.columns else ("student_id", "size"),
        测验分波动=("TEST_AVGSCORE", safe_std) if "TEST_AVGSCORE" in df.columns else ("student_id", "size"),
        作业完成率=("WORK_RATE", "mean") if "WORK_RATE" in df.columns else ("student_id", "size"),
        作业平均分_课堂任务=("WORK_AVGSCORE", "mean") if "WORK_AVGSCORE" in df.columns else ("student_id", "size"),
        课堂作业分波动=("WORK_AVGSCORE", safe_std) if "WORK_AVGSCORE" in df.columns else ("student_id", "size"),
        考试完成率=("EXAM_RATE", "mean") if "EXAM_RATE" in df.columns else ("student_id", "size"),
        考试平均分=("EXAM_AVGSCORE", "mean") if "EXAM_AVGSCORE" in df.columns else ("student_id", "size"),
        考试分波动=("EXAM_AVGSCORE", safe_std) if "EXAM_AVGSCORE" in df.columns else ("student_id", "size"),
        线上访问量=("PV", "sum") if "PV" in df.columns else ("student_id", "size"),
        线上访问量均值=("PV", "mean") if "PV" in df.columns else ("student_id", "size"),
        课程签到率=("SIGN_RATE", "mean") if "SIGN_RATE" in df.columns else ("student_id", "size"),
        讨论数=("BBS_NUM", "sum") if "BBS_NUM" in df.columns else ("student_id", "size"),
        发帖数=("TOPIC_NUM", "sum") if "TOPIC_NUM" in df.columns else ("student_id", "size"),
        回帖数=("REPLY_NUM", "sum") if "REPLY_NUM" in df.columns else ("student_id", "size"),
        课程积分=("POINTS", "sum") if "POINTS" in df.columns else ("student_id", "size"),
        小组任务参与率=("TASK_RATE", "mean") if "TASK_RATE" in df.columns else ("student_id", "size"),
        直播学习时长=("COURSE_LIVE_TIME", "sum") if "COURSE_LIVE_TIME" in df.columns else ("student_id", "size"),
        拓展学习时长=("SPECIAL_TIME", "sum") if "SPECIAL_TIME" in df.columns else ("student_id", "size"),
        试卷参与次数=("PAPER_NUM", "sum") if "PAPER_NUM" in df.columns else ("student_id", "size"),
        问答参与次数=("ANSWER_NUM", "sum") if "ANSWER_NUM" in df.columns else ("student_id", "size"),
        互评分次数=("MARKSCORE_NUM", "sum") if "MARKSCORE_NUM" in df.columns else ("student_id", "size"),
    )
    feature_df = safe_group_merge(feature_df, agg, [c for c in agg.columns if c != "student_id"])
    has_online_features = True

# =========================
# 13. 学生作业提交记录
# =========================
if "学生作业提交记录" in df_dict:
    df = df_dict["学生作业提交记录"].copy()
    df = to_numeric(df, ["SCORE", "FULLMARKS", "STATUS"])

    if "CREATER_TIME" in df.columns:
        df["CREATER_TIME"] = parse_datetime_safe(df["CREATER_TIME"])
    if "ANSWER_TIME" in df.columns:
        df["ANSWER_TIME"] = parse_datetime_safe(df["ANSWER_TIME"])
    if "REVIEW_TIME" in df.columns:
        df["REVIEW_TIME"] = parse_datetime_safe(df["REVIEW_TIME"])

    if "CREATER_TIME" in df.columns and "ANSWER_TIME" in df.columns:
        df["提交延迟小时"] = (df["ANSWER_TIME"] - df["CREATER_TIME"]).dt.total_seconds() / 3600
    else:
        df["提交延迟小时"] = np.nan

    if "ANSWER_TIME" in df.columns and "REVIEW_TIME" in df.columns:
        df["批阅延迟小时"] = (df["REVIEW_TIME"] - df["ANSWER_TIME"]).dt.total_seconds() / 3600
    else:
        df["批阅延迟小时"] = np.nan

    if "STATUS" in df.columns:
        df["已完成作业"] = df["STATUS"].isin([3, 4]).astype(int)
        df["未完成作业"] = df["STATUS"].isin([0, 1]).astype(int)
    else:
        df["已完成作业"] = 0
        df["未完成作业"] = 0

    agg = df.groupby("student_id", as_index=False).agg(
        作业提交次数=("student_id", "size"),
        作业完成次数=("已完成作业", "sum"),
        作业未完成次数=("未完成作业", "sum"),
        作业平均分=("SCORE", "mean") if "SCORE" in df.columns else ("student_id", "size"),
        作业分数波动=("SCORE", safe_std) if "SCORE" in df.columns else ("student_id", "size"),
        平均提交延迟小时=("提交延迟小时", "mean"),
        平均批阅延迟小时=("批阅延迟小时", "mean"),
    )
    feature_df = safe_group_merge(feature_df, agg, [c for c in agg.columns if c != "student_id"])
    has_online_features = True

# =========================
# 融合特征
# =========================
for c in feature_df.columns:
    if c == "student_id":
        continue
    if pd.api.types.is_numeric_dtype(feature_df[c]):
        feature_df[c] = feature_df[c].astype(float)

feature_df = add_ratio_feature(feature_df, "上网_图书馆比", "上网时长", "图书馆次数", add_one=True)
feature_df = add_ratio_feature(feature_df, "上网_跑步比", "上网时长", "跑步次数", add_one=True)
feature_df = add_ratio_feature(feature_df, "夜间占比", "夜间次数", "门禁次数", add_one=True)
feature_df = add_ratio_feature(feature_df, "图书馆_门禁活跃比", "图书馆活跃天数", "门禁活跃天数", add_one=True)
feature_df = add_ratio_feature(feature_df, "锻炼_体测比", "锻炼次数", "体测分", add_one=True)
feature_df = add_ratio_feature(feature_df, "出入比", "出门次数", "进门次数", add_one=True)
feature_df = add_ratio_feature(feature_df, "图书馆进出平衡", "进馆次数", "出馆次数", add_one=True)
feature_df = add_ratio_feature(feature_df, "作业完成_课堂任务比", "作业完成次数", "任务点完成率", add_one=True)

feature_df["线上互动率"] = get_col(feature_df, "回帖数") / (get_col(feature_df, "讨论数") + 1)
feature_df["作业完成率_显式"] = get_col(feature_df, "作业完成次数") / (get_col(feature_df, "作业提交次数") + 1)

feature_df["学习娱乐平衡指数"] = (
    get_col(feature_df, "视频学习时长") + get_col(feature_df, "图书馆次数") * 10 + get_col(feature_df, "作业提交次数") * 5
) / (get_col(feature_df, "上网时长") + 1)

feature_df["投入产出平衡指数"] = (
    get_col(feature_df, "测验平均分") + get_col(feature_df, "考试平均分") + get_col(feature_df, "作业平均分")
) / (get_col(feature_df, "视频学习时长") / 10 + 1)

feature_df["耐力项目成绩"] = get_col(feature_df, "800米").replace(0, np.nan)
feature_df["耐力项目成绩"] = feature_df["耐力项目成绩"].fillna(
    get_col(feature_df, "1000米").replace(0, np.nan)
).fillna(0)

feature_df["力量项目成绩"] = get_col(feature_df, "仰卧起坐").replace(0, np.nan)
feature_df["力量项目成绩"] = feature_df["力量项目成绩"].fillna(
    get_col(feature_df, "引体向上").replace(0, np.nan)
).fillna(0)

feature_df["学习指数"] = (
    get_col(feature_df, "图书馆次数") * 1.2 +
    get_col(feature_df, "英语成绩") / 100 * 1.0 +
    get_col(feature_df, "综合成绩") / 10 * 1.0 +
    get_col(feature_df, "任务点完成率") * 10 +
    get_col(feature_df, "测验平均分") / 10
)

feature_df["自律指数"] = (
    get_col(feature_df, "跑步次数") * 0.2 +
    get_col(feature_df, "锻炼次数") * 0.2 +
    get_col(feature_df, "图书馆活跃天数") * 0.5 -
    get_col(feature_df, "夜间次数") * 0.15 +
    get_col(feature_df, "课程签到率") * 5
)

feature_df["健康指数"] = (
    get_col(feature_df, "体测分") * 0.5 +
    get_col(feature_df, "肺活量") / 1000 * 0.2 +
    get_col(feature_df, "跑步活跃天数") * 0.2 +
    get_col(feature_df, "锻炼周数") * 0.1
)

feature_df["风险指数"] = (
    get_col(feature_df, "上网时长") / (get_col(feature_df, "图书馆次数") + 1) +
    get_col(feature_df, "夜间次数") * 0.5 +
    get_col(feature_df, "作业未完成次数") * 2
)

feature_df["社交指数"] = (
    get_col(feature_df, "社团次数") * 0.7 +
    get_col(feature_df, "竞赛次数") * 1.0 +
    get_col(feature_df, "社团活跃天数") * 0.1 +
    get_col(feature_df, "讨论数") * 0.2 +
    get_col(feature_df, "发帖数") * 0.2 +
    get_col(feature_df, "回帖数") * 0.2
)

feature_df["学业潜力指数"] = (
    get_col(feature_df, "综合成绩") * 0.5 +
    get_col(feature_df, "英语成绩") * 0.2 +
    get_col(feature_df, "奖学金次数") * 3 +
    get_col(feature_df, "竞赛次数") * 2 +
    get_col(feature_df, "作业平均分") * 0.2
)

feature_df["生活规律指数"] = (
    get_col(feature_df, "门禁活跃天数") * 0.5 +
    get_col(feature_df, "图书馆活跃天数") * 0.5 -
    get_col(feature_df, "夜间次数") * 0.3 +
    get_col(feature_df, "跑步活跃天数") * 0.2
)

if has_online_features:
    feature_df["线上积极性指数"] = (
        get_col(feature_df, "任务点完成率") * 10 +
        get_col(feature_df, "视频任务完成率") * 10 +
        get_col(feature_df, "课程签到率") * 10 +
        get_col(feature_df, "小组任务参与率") * 10 +
        get_col(feature_df, "线上访问量") / 100
    )

    feature_df["作业执行力指数"] = (
        get_col(feature_df, "作业完成次数") * 0.5 +
        get_col(feature_df, "作业平均分") * 0.2 -
        get_col(feature_df, "作业未完成次数") * 1.0 -
        get_col(feature_df, "平均提交延迟小时") * 0.02
    )

    feature_df["线上学习质量指数"] = (
        get_col(feature_df, "测验平均分") * 0.3 +
        get_col(feature_df, "作业平均分_课堂任务") * 0.3 +
        get_col(feature_df, "考试平均分") * 0.4
    )

feature_df["综合发展指数"] = (
    get_col(feature_df, "综合成绩") * 0.4 +
    get_col(feature_df, "奖学金次数") * 2 +
    get_col(feature_df, "竞赛次数") * 2 +
    get_col(feature_df, "社团次数") * 0.3
)

feature_df["高耗时低产出指数"] = (
    get_col(feature_df, "上网时长") /
    (get_col(feature_df, "综合成绩") + get_col(feature_df, "英语成绩") + 1)
)

feature_df["夜间活跃学习失衡指数"] = (
    get_col(feature_df, "夜间次数") /
    (get_col(feature_df, "图书馆次数") + get_col(feature_df, "任务点完成率") + 1)
)

feature_df["运动学习平衡指数"] = (
    get_col(feature_df, "跑步次数") +
    get_col(feature_df, "锻炼次数") +
    get_col(feature_df, "图书馆次数")
) / (
    get_col(feature_df, "上网时长") / 100 + 1
)

feature_df["学习持续性指数"] = (
    get_col(feature_df, "图书馆活跃天数") * 0.4 +
    get_col(feature_df, "门禁活跃天数") * 0.2 +
    get_col(feature_df, "锻炼周数") * 0.2 +
    get_col(feature_df, "英语考试次数") * 0.2
)

feature_df["学习稳定性指数"] = (
    - get_col(feature_df, "作业分数波动") * 0.4
    - get_col(feature_df, "测验分波动") * 0.3
    - get_col(feature_df, "考试分波动") * 0.3
)

feature_df["成绩变化代理指数"] = (
    get_col(feature_df, "线上学习质量指数") - get_col(feature_df, "综合成绩")
)

# =========================
# 缺失值填充
# =========================
num_cols = feature_df.select_dtypes(include=["number"]).columns
feature_df[num_cols] = feature_df[num_cols].fillna(0)

# =========================
# 删除全0数值列
# =========================
feature_df = drop_all_zero_numeric_columns(feature_df)

# =========================
# 方案 B：手动删除当前时间范围下明显失效/极稀疏的列
# =========================
manual_drop_cols = [
    "最近30天门禁次数",
    "最近60天门禁次数",
    "最近90天门禁次数",
    "最近30天图书馆次数",
    "最近60天图书馆次数",
    "最近90天图书馆次数",
    "平均提交延迟小时",
]
manual_drop_cols = [c for c in manual_drop_cols if c in feature_df.columns]
if manual_drop_cols:
    print(f"🗑 手动删除极稀疏/当前时间范围不适配列: {manual_drop_cols}")
    feature_df = feature_df.drop(columns=manual_drop_cols)

# =========================
# 删除高零值列，但保留有业务意义的稀疏列
# =========================
sparse_keep_cols = [
    "门禁次数", "进门次数", "出门次数", "夜间次数", "周末门禁次数", "门禁活跃天数", "出入比",
    "图书馆次数", "进馆次数", "出馆次数", "图书馆活跃天数", "晚间到馆次数", "周末到馆次数", "图书馆进出平衡",
    "竞赛次数", "奖学金金额", "奖学金次数",
]

feature_df = drop_sparse_numeric_columns(
    feature_df,
    zero_threshold=0.98,
    keep_cols=sparse_keep_cols
)

# =========================
# 质量检查
# =========================
print_missing_report(feature_df)

print("\n========== 关键字段样例检查 ==========")
show_cols = [c for c in [
    "student_id",
    "性别", "民族", "政治面貌", "出生日期", "籍贯", "学院", "专业",
    "上网时长", "月均上网时长", "上网波动",
    "门禁次数", "进门次数", "出门次数", "夜间次数",
    "图书馆次数", "进馆次数", "出馆次数",
    "跑步次数", "锻炼次数", "体测分", "肺活量", "BMI", "英语成绩",
    "奖学金金额", "社团次数", "竞赛次数", "综合成绩",
    "视频学习时长", "测验平均分", "作业平均分_课堂任务", "考试平均分",
    "作业提交次数", "作业完成次数", "作业平均分",
    "学习指数", "自律指数", "健康指数", "风险指数", "社交指数",
    "学业潜力指数", "生活规律指数", "线上积极性指数", "作业执行力指数", "线上学习质量指数",
    "综合发展指数", "学习稳定性指数", "成绩变化代理指数"
] if c in feature_df.columns]
print(feature_df[show_cols].head(10).to_string(index=False))

# =========================
# 输出
# =========================
feature_df.to_csv(OUTPUT_FILE, index=False, encoding="utf-8-sig")

print("\n✅ 数据处理完成")
print("📊 最终维度:", feature_df.shape)
print("📁 输出文件:", os.path.abspath(OUTPUT_FILE))
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Callable

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "our project" / "data"
TRAIN_FEATURES_PATH = ROOT / "our project" / "train_features_final.csv"
OUTPUT_DIR = ROOT / "docs" / "data_audit"
SUMMARY_PATH = OUTPUT_DIR / "basic_feature_audit_summary.csv"
DETAIL_PATH = OUTPUT_DIR / "basic_feature_audit_detail.csv"
JSON_PATH = OUTPUT_DIR / "basic_feature_audit_summary.json"


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
    return s.replace({"nan": np.nan, "none": np.nan, "": np.nan})


def to_numeric(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
    for col in cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    return df


def parse_datetime_safe(series: pd.Series) -> pd.Series:
    return pd.to_datetime(series, errors="coerce")


def safe_std(x: pd.Series):
    x = pd.to_numeric(x, errors="coerce").dropna()
    if len(x) <= 1:
        return np.nan
    return x.std()


def safe_cv(x: pd.Series):
    x = pd.to_numeric(x, errors="coerce").dropna()
    if len(x) <= 1:
        return np.nan
    mean = x.mean()
    if mean == 0 or pd.isna(mean):
        return np.nan
    return x.std() / mean


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

    match = re.match(r"^\s*(\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?)\s*$", s)
    if match:
        h = float(match.group(1))
        w = float(match.group(2))
        if h > 0 and w > 0:
            return w / ((h / 100) ** 2)
    return np.nan


def load_excel(name: str) -> pd.DataFrame:
    df = pd.read_excel(DATA_DIR / f"{name}.xlsx")
    df = clean_cols(df)
    return df


def find_col_by_candidates(df: pd.DataFrame, candidates: list[str]) -> str:
    cols = {str(c).strip().lower(): c for c in df.columns}
    for candidate in candidates:
        key = candidate.strip().lower()
        if key in cols:
            return cols[key]
    raise KeyError(f"student id column not found from candidates: {candidates}")


def with_student_id(df: pd.DataFrame, column: str | list[str]) -> pd.DataFrame:
    actual = find_col_by_candidates(df, column if isinstance(column, list) else [column])
    df = df.rename(columns={actual: "student_id"}).copy()
    df["student_id"] = normalize_student_id(df["student_id"])
    return df[df["student_id"].notna()].copy()


def build_basic_feature_frame() -> pd.DataFrame:
    frames: list[pd.DataFrame] = []

    basic = with_student_id(load_excel("学生基本信息"), "XH")
    base_cols = [c for c in ["XB", "MZMC", "ZZMMMC", "CSRQ", "JG", "XSM", "ZYM"] if c in basic.columns]
    base = basic[["student_id"] + base_cols].drop_duplicates("student_id").rename(
        columns={
            "XB": "性别",
            "MZMC": "民族",
            "ZZMMMC": "政治面貌",
            "CSRQ": "出生日期",
            "JG": "籍贯",
            "XSM": "学院",
            "ZYM": "专业",
        }
    )
    frames.append(base)

    internet = with_student_id(load_excel("上网统计"), "XSBH")
    internet = to_numeric(internet, ["SWLJSC", "XXPJZ"])
    internet_agg = internet.groupby("student_id", as_index=False).agg(
        上网时长=("SWLJSC", "sum"),
        月均上网时长=("SWLJSC", "mean"),
    )
    frames.append(internet_agg)

    running = with_student_id(load_excel("跑步打卡"), "USERNUM")
    if "PUNCH_DAY" in running.columns:
        running["PUNCH_DAY"] = parse_datetime_safe(running["PUNCH_DAY"])
        running["run_date"] = running["PUNCH_DAY"].dt.date
    running_agg = running.groupby("student_id", as_index=False).agg(
        跑步次数=("student_id", "size"),
        跑步活跃天数=("run_date", "nunique") if "run_date" in running.columns else ("student_id", "size"),
        跑步学期数=("TERM_ID", "nunique") if "TERM_ID" in running.columns else ("student_id", "size"),
    )
    if "PUNCH_DAY" in running.columns and running["PUNCH_DAY"].notna().any():
        max_time = running["PUNCH_DAY"].max()
        for days, label in [(30, "最近30天跑步次数"), (60, "最近60天跑步次数"), (90, "最近90天跑步次数")]:
            start = max_time - pd.Timedelta(days=days)
            sub = running[running["PUNCH_DAY"] >= start]
            recent = sub.groupby("student_id").size().rename(label).reset_index()
            running_agg = running_agg.merge(recent, on="student_id", how="left")
    frames.append(running_agg)

    workout = with_student_id(load_excel("日常锻炼"), "XH")
    workout = to_numeric(workout, ["DKCS"])
    workout_agg = workout.groupby("student_id", as_index=False).agg(
        锻炼次数=("DKCS", "sum"),
        锻炼均次=("DKCS", "mean"),
        锻炼周数=("ZC", "nunique") if "ZC" in workout.columns else ("student_id", "size"),
        锻炼学期数=("XQ", "nunique") if "XQ" in workout.columns else ("student_id", "size"),
    )
    frames.append(workout_agg)

    body = with_student_id(load_excel("体测数据"), "XH")
    if "BMI" in body.columns:
        body["BMI"] = body["BMI"].apply(parse_bmi_value)
    body = to_numeric(body, ["ZF", "FHL", "BMI", "WS", "LDTY", "ZWTQQ", "BB", "YQ", "YWQZ", "YTXS"])
    body_agg = body.groupby("student_id", as_index=False).agg(
        体测分=("ZF", "mean"),
        BMI=("BMI", "mean"),
        肺活量=("FHL", "mean"),
        **{"50米": ("WS", "mean")},
        立定跳远=("LDTY", "mean"),
        坐位体前屈=("ZWTQQ", "mean"),
        **{"800米": ("BB", "mean")},
        **{"1000米": ("YQ", "mean")},
        仰卧起坐=("YWQZ", "mean"),
        引体向上=("YTXS", "mean"),
    )
    frames.append(body_agg)

    classroom = with_student_id(load_excel("课堂任务参与"), "LOGIN_NAME")
    classroom = to_numeric(
        classroom,
        [
            "VIDEOJOB_TIME", "TEST_AVGSCORE", "WORK_AVGSCORE", "EXAM_AVGSCORE",
            "BBS_NUM", "REPLY_NUM", "PV", "COURSE_LIVE_TIME", "SPECIAL_TIME",
            "PAPER_NUM", "ANSWER_NUM", "MARKSCORE_NUM"
        ],
    )
    classroom_agg = classroom.groupby("student_id", as_index=False).agg(
        视频学习时长=("VIDEOJOB_TIME", "sum"),
        视频学习时长均值=("VIDEOJOB_TIME", "mean"),
        测验平均分=("TEST_AVGSCORE", "mean"),
        作业平均分_课堂任务=("WORK_AVGSCORE", "mean"),
        考试平均分=("EXAM_AVGSCORE", "mean"),
        讨论数=("BBS_NUM", "sum"),
        回帖数=("REPLY_NUM", "sum"),
        线上访问量=("PV", "sum"),
        线上访问量均值=("PV", "mean"),
        直播学习时长=("COURSE_LIVE_TIME", "sum"),
        拓展学习时长=("SPECIAL_TIME", "sum"),
        试卷参与次数=("PAPER_NUM", "sum"),
        问答参与次数=("ANSWER_NUM", "sum"),
        互评分次数=("MARKSCORE_NUM", "sum"),
    )
    frames.append(classroom_agg)

    assignment = with_student_id(load_excel("学生作业提交记录"), "CREATER_LOGIN_NAME")
    assignment = to_numeric(assignment, ["SCORE", "STATUS"])
    if "STATUS" in assignment.columns:
        assignment["已完成作业"] = assignment["STATUS"].isin([3, 4]).astype(int)
    else:
        assignment["已完成作业"] = 0
    assignment_agg = assignment.groupby("student_id", as_index=False).agg(
        作业提交次数=("student_id", "size"),
        作业完成次数=("已完成作业", "sum"),
        作业平均分=("SCORE", "mean"),
    )
    frames.append(assignment_agg)

    library = with_student_id(load_excel("图书馆打卡记录"), ["cardId", "cardld"])
    if "visittime" in library.columns:
        library["visittime"] = parse_datetime_safe(library["visittime"])
        library["date"] = library["visittime"].dt.date
        library["hour"] = library["visittime"].dt.hour
        library["weekday"] = library["visittime"].dt.dayofweek
        library["晚间到馆"] = library["hour"].apply(lambda x: 1 if pd.notna(x) and x >= 18 else 0)
        library["周末到馆"] = library["weekday"].apply(lambda x: 1 if pd.notna(x) and x >= 5 else 0)
        library["白天到馆"] = library["hour"].apply(lambda x: 1 if pd.notna(x) and 8 <= x < 18 else 0)
    else:
        library["date"] = np.nan
        library["晚间到馆"] = 0
        library["周末到馆"] = 0
        library["白天到馆"] = 0
    if "direction" in library.columns:
        direction = pd.to_numeric(library["direction"], errors="coerce")
        library["进馆"] = (direction == 1).astype(int)
        library["出馆"] = (direction == 2).astype(int)
    else:
        library["进馆"] = 0
        library["出馆"] = 0
    library_agg = library.groupby("student_id", as_index=False).agg(
        图书馆次数=("student_id", "size"),
        进馆次数=("进馆", "sum"),
        出馆次数=("出馆", "sum"),
        图书馆活跃天数=("date", "nunique"),
        晚间到馆次数=("晚间到馆", "sum"),
        周末到馆次数=("周末到馆", "sum"),
        白天到馆次数=("白天到馆", "sum"),
    )
    frames.append(library_agg)

    gate = with_student_id(load_excel("门禁数据"), "IDSERTAL")
    if "LOGINTIME" in gate.columns:
        gate["LOGINTIME"] = parse_datetime_safe(gate["LOGINTIME"])
        gate["date"] = gate["LOGINTIME"].dt.date
        gate["hour"] = gate["LOGINTIME"].dt.hour
        gate["weekday"] = gate["LOGINTIME"].dt.dayofweek
        gate["夜间次数_原"] = gate["hour"].apply(lambda x: 1 if pd.notna(x) and (x >= 22 or x <= 6) else 0)
        gate["周末门禁"] = gate["weekday"].apply(lambda x: 1 if pd.notna(x) and x >= 5 else 0)
        gate["白天门禁"] = gate["hour"].apply(lambda x: 1 if pd.notna(x) and 8 <= x < 18 else 0)
    else:
        gate["date"] = np.nan
        gate["夜间次数_原"] = 0
        gate["周末门禁"] = 0
        gate["白天门禁"] = 0
    if "LOGINSIGN" in gate.columns:
        sign = pd.to_numeric(gate["LOGINSIGN"], errors="coerce")
        gate["进门"] = (sign == 0).astype(int)
        gate["出门"] = (sign == 1).astype(int)
    else:
        gate["进门"] = 0
        gate["出门"] = 0
    gate_agg = gate.groupby("student_id", as_index=False).agg(
        门禁次数=("student_id", "size"),
        进门次数=("进门", "sum"),
        出门次数=("出门", "sum"),
        夜间次数=("夜间次数_原", "sum"),
        周末门禁次数=("周末门禁", "sum"),
        白天门禁次数=("白天门禁", "sum"),
        门禁活跃天数=("date", "nunique"),
    )
    frames.append(gate_agg)

    club = with_student_id(load_excel("社团活动"), "XSBH")
    club_agg = club.groupby("student_id", as_index=False).agg(
        社团次数=("student_id", "size"),
        社团活跃天数=("HDRQ", "nunique") if "HDRQ" in club.columns else ("student_id", "size"),
    )
    frames.append(club_agg)

    competition = with_student_id(load_excel("学科竞赛"), "XHHGH")
    competition_agg = competition.groupby("student_id", as_index=False).agg(
        竞赛次数=("student_id", "size"),
    )
    frames.append(competition_agg)

    english = with_student_id(load_excel("四六级成绩"), "KS_XH")
    english = to_numeric(english, ["KS_CJ"])
    english_agg = english.groupby("student_id", as_index=False).agg(
        英语成绩=("KS_CJ", "max"),
        英语平均分=("KS_CJ", "mean"),
        英语考试次数=("KS_CJ", "count"),
    )
    frames.append(english_agg)

    score = with_student_id(load_excel("本科生综合测评"), "XH")
    score = to_numeric(score, ["ZCJ"])
    score_agg = score.groupby("student_id", as_index=False).agg(
        综合成绩=("ZCJ", "mean"),
    )
    frames.append(score_agg)

    scholarship = with_student_id(load_excel("奖学金获奖"), "XSBH")
    scholarship = to_numeric(scholarship, ["FFJE"])
    scholarship_agg = scholarship.groupby("student_id", as_index=False).agg(
        奖学金次数=("student_id", "size"),
        奖学金金额=("FFJE", "sum"),
    )
    frames.append(scholarship_agg)

    feature_df = frames[0]
    for frame in frames[1:]:
        feature_df = feature_df.merge(frame, on="student_id", how="left")
    return feature_df


def compare_series(left: pd.Series, right: pd.Series) -> tuple[int, int, int]:
    compared = 0
    matches = 0
    mismatches = 0
    for lval, rval in zip(left, right):
        if (pd.isna(lval) or lval == "") and (pd.isna(rval) or rval == ""):
            continue
        compared += 1
        if pd.api.types.is_number(lval) and pd.api.types.is_number(rval):
            if pd.isna(lval) and pd.isna(rval):
                matches += 1
            elif pd.notna(lval) and pd.notna(rval) and np.isclose(float(lval), float(rval), atol=1e-6, equal_nan=True):
                matches += 1
            else:
                mismatches += 1
        else:
            if str(lval).strip() == str(rval).strip():
                matches += 1
            else:
                mismatches += 1
    return compared, matches, mismatches


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    train_df = pd.read_csv(TRAIN_FEATURES_PATH)
    train_df["student_id"] = normalize_student_id(train_df["student_id"])
    raw_df = build_basic_feature_frame()

    feature_columns = [column for column in raw_df.columns if column != "student_id" and column in train_df.columns]
    merged = train_df[["student_id"] + feature_columns].merge(
        raw_df[["student_id"] + feature_columns],
        on="student_id",
        how="outer",
        suffixes=("_train", "_raw"),
    )

    summary_rows = []
    detail_rows = []

    for column in feature_columns:
        left = merged[f"{column}_train"]
        right = merged[f"{column}_raw"]
        compared, matches, mismatches = compare_series(left, right)
        summary_rows.append(
            {
                "feature": column,
                "train_non_null": int(left.notna().sum()),
                "raw_non_null": int(right.notna().sum()),
                "compared_rows": compared,
                "match_count": matches,
                "mismatch_count": mismatches,
                "match_rate": round(matches / compared, 6) if compared else 1.0,
            }
        )

        mismatch_mask = []
        for lval, rval in zip(left, right):
            if (pd.isna(lval) or lval == "") and (pd.isna(rval) or rval == ""):
                mismatch_mask.append(False)
            elif pd.api.types.is_number(lval) and pd.api.types.is_number(rval):
                mismatch_mask.append(not np.isclose(float(lval), float(rval), atol=1e-6, equal_nan=True))
            else:
                mismatch_mask.append(str(lval).strip() != str(rval).strip())

        mismatched = merged.loc[mismatch_mask, ["student_id", f"{column}_train", f"{column}_raw"]].head(20)
        for _, row in mismatched.iterrows():
            detail_rows.append(
                {
                    "feature": column,
                    "student_id": row["student_id"],
                    "train_value": row[f"{column}_train"],
                    "raw_value": row[f"{column}_raw"],
                }
            )

    summary_df = pd.DataFrame(summary_rows).sort_values(["match_rate", "mismatch_count", "feature"], ascending=[True, False, True])
    detail_df = pd.DataFrame(detail_rows)

    summary_df.to_csv(SUMMARY_PATH, index=False, encoding="utf-8-sig")
    detail_df.to_csv(DETAIL_PATH, index=False, encoding="utf-8-sig")

    payload = {
        "total_features_checked": int(len(summary_df)),
        "perfect_match_features": int((summary_df["mismatch_count"] == 0).sum()),
        "imperfect_features": summary_df.loc[summary_df["mismatch_count"] > 0, ["feature", "mismatch_count", "match_rate"]].to_dict("records"),
    }
    JSON_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"checked_features={len(summary_df)}")
    print(f"perfect_match_features={(summary_df['mismatch_count'] == 0).sum()}")
    print(summary_df.head(20).to_string(index=False))


if __name__ == "__main__":
    main()

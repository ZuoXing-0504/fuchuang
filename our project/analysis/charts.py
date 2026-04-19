from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np

try:
    import pandas as pd
except ImportError as exc:
    raise ImportError("analysis/charts.py 依赖 pandas。") from exc

try:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
except ImportError as exc:
    raise ImportError("analysis/charts.py 依赖 matplotlib。") from exc

try:
    from .data_prepare import DEFAULT_MASTER_PATH, load_analysis_master
except ImportError:
    from data_prepare import DEFAULT_MASTER_PATH, load_analysis_master


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parent / "outputs" / "charts"
CORE_FEATURES = [
    "study_time",
    "library_count",
    "night_net_ratio",
    "study_index",
    "self_discipline_index",
    "health_index",
    "development_index",
]


def _configure_plot_style() -> None:
    plt.style.use("ggplot")
    plt.rcParams["font.sans-serif"] = [
        "Microsoft YaHei",
        "SimHei",
        "Noto Sans CJK SC",
        "Arial Unicode MS",
        "DejaVu Sans",
    ]
    plt.rcParams["axes.unicode_minus"] = False
    plt.rcParams["figure.dpi"] = 120


def _prepare_output_dir(output_dir: str | Path) -> Path:
    target = Path(output_dir)
    if not target.is_absolute():
        target = PROJECT_ROOT / target
    target.mkdir(parents=True, exist_ok=True)
    return target


def _save_placeholder_chart(path: Path, title: str, message: str) -> Path:
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.axis("off")
    ax.text(0.5, 0.6, title, ha="center", va="center", fontsize=16, fontweight="bold")
    ax.text(0.5, 0.4, message, ha="center", va="center", fontsize=12)
    fig.tight_layout()
    fig.savefig(path, bbox_inches="tight")
    plt.close(fig)
    return path


def _clean_numeric_series(frame: pd.DataFrame, column: str) -> pd.Series:
    if column not in frame.columns:
        return pd.Series(dtype=float)
    return pd.to_numeric(frame[column], errors="coerce").dropna()


def _resolve_hist_bins(series: pd.Series, max_bins: int = 20) -> int:
    return min(max_bins, max(8, int(np.sqrt(len(series)) * 2)))


def _clip_series_to_quantile(series: pd.Series, quantile: float = 0.99) -> tuple[pd.Series, float | None, int]:
    if series.empty:
        return series, None, 0
    upper = float(series.quantile(quantile))
    if not np.isfinite(upper):
        return series, None, 0
    clipped = series[series <= upper]
    clipped_count = int((series > upper).sum())
    return clipped, upper, clipped_count


def _save_zero_inflated_histogram(
    series: pd.Series,
    output_path: Path,
    title: str,
    x_label: str,
    color: str,
) -> Path:
    zero_count = int((series == 0).sum())
    positive = series[series > 0]
    positive_clipped, upper, clipped_count = _clip_series_to_quantile(positive, quantile=0.99)

    fig, axes = plt.subplots(1, 2, figsize=(11.5, 5), gridspec_kw={"width_ratios": [1, 2]})
    fig.suptitle(title, fontsize=16, fontweight="bold")

    bars = axes[0].bar(["0值", ">0"], [zero_count, len(positive)], color=["#94a3b8", color], edgecolor="white")
    axes[0].set_title("零值占比")
    axes[0].set_ylabel("学生人数")
    axes[0].bar_label(bars, padding=3, fontsize=10)

    hist_source = positive_clipped if not positive_clipped.empty else positive
    if hist_source.empty:
        axes[1].axis("off")
        axes[1].text(0.5, 0.5, "没有大于 0 的样本", ha="center", va="center", fontsize=12)
    else:
        axes[1].hist(hist_source, bins=_resolve_hist_bins(hist_source), color=color, edgecolor="white")
        axes[1].set_title("非零样本分布")
        axes[1].set_xlabel(f"{x_label}（>0 样本）")
        axes[1].set_ylabel("学生人数")
        summary_parts = [f"0值占比 {zero_count / len(series):.1%}"]
        if upper is not None and clipped_count > 0:
            summary_parts.append(f"P99={upper:.3g}，截断 {clipped_count} 个极端值")
        axes[1].text(
            0.98,
            0.95,
            "\n".join(summary_parts),
            transform=axes[1].transAxes,
            ha="right",
            va="top",
            fontsize=10,
            bbox={"facecolor": "white", "alpha": 0.85, "edgecolor": "#d0d7de"},
        )

    fig.tight_layout(rect=[0, 0, 1, 0.95])
    fig.savefig(output_path, bbox_inches="tight")
    plt.close(fig)
    return output_path


def _save_long_tail_histogram(
    series: pd.Series,
    output_path: Path,
    title: str,
    x_label: str,
    color: str,
) -> Path:
    clipped_series, upper, clipped_count = _clip_series_to_quantile(series, quantile=0.99)
    body = clipped_series if not clipped_series.empty else series
    log_series = np.log1p(series[series >= 0])

    fig, axes = plt.subplots(1, 2, figsize=(11.5, 5))
    fig.suptitle(title, fontsize=16, fontweight="bold")

    axes[0].hist(body, bins=_resolve_hist_bins(body), color=color, edgecolor="white")
    axes[0].set_title("主体分布")
    axes[0].set_xlabel(x_label)
    axes[0].set_ylabel("学生人数")
    if upper is not None and clipped_count > 0:
        axes[0].text(
            0.98,
            0.95,
            f"P99={upper:.3g}\n截断 {clipped_count} 个极端值",
            transform=axes[0].transAxes,
            ha="right",
            va="top",
            fontsize=10,
            bbox={"facecolor": "white", "alpha": 0.85, "edgecolor": "#d0d7de"},
        )

    axes[1].hist(log_series, bins=_resolve_hist_bins(log_series), color=color, edgecolor="white")
    axes[1].set_title("log1p 变换后")
    axes[1].set_xlabel(f"log1p({x_label})")
    axes[1].set_ylabel("学生人数")

    fig.tight_layout(rect=[0, 0, 1, 0.95])
    fig.savefig(output_path, bbox_inches="tight")
    plt.close(fig)
    return output_path


def _save_histogram(
    frame: pd.DataFrame,
    output_dir: Path,
    column: str,
    title: str,
    x_label: str,
    file_name: str,
    *,
    bins: int = 20,
    color: str = "#2f6bff",
) -> Path:
    output_path = output_dir / file_name
    series = _clean_numeric_series(frame, column)
    if series.empty:
        return _save_placeholder_chart(output_path, title, f"{column} 数据缺失，暂无法绘图。")

    zero_ratio = float((series == 0).mean())
    positive = series[series > 0]
    p99 = float(series.quantile(0.99)) if not series.empty else 0.0
    max_value = float(series.max()) if not series.empty else 0.0
    long_tail_ratio = max_value / max(p99, 1e-9) if p99 > 0 else float("inf")

    if zero_ratio >= 0.6 and len(positive) >= 20:
        return _save_zero_inflated_histogram(series, output_path, title, x_label, color)

    if long_tail_ratio >= 5 and series.nunique() > 20:
        return _save_long_tail_histogram(series, output_path, title, x_label, color)

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.hist(series, bins=_resolve_hist_bins(series, max_bins=bins), color=color, edgecolor="white")
    ax.set_title(title)
    ax.set_xlabel(x_label)
    ax.set_ylabel("学生人数")
    fig.tight_layout()
    fig.savefig(output_path, bbox_inches="tight")
    plt.close(fig)
    return output_path


def _save_scatter(
    frame: pd.DataFrame,
    output_dir: Path,
    x_column: str,
    y_column: str,
    title: str,
    x_label: str,
    y_label: str,
    file_name: str,
    *,
    color: str = "#ff7a45",
) -> Path:
    output_path = output_dir / file_name
    scatter_frame = frame[[x_column, y_column]].copy()
    scatter_frame[x_column] = pd.to_numeric(scatter_frame[x_column], errors="coerce")
    scatter_frame[y_column] = pd.to_numeric(scatter_frame[y_column], errors="coerce")
    scatter_frame = scatter_frame.dropna()

    if scatter_frame.empty:
        return _save_placeholder_chart(output_path, title, f"{x_column} 或 {y_column} 数据缺失。")

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.scatter(scatter_frame[x_column], scatter_frame[y_column], alpha=0.55, color=color, edgecolors="none")

    if scatter_frame[x_column].nunique() > 1:
        coefficients = np.polyfit(scatter_frame[x_column], scatter_frame[y_column], deg=1)
        line_x = np.linspace(scatter_frame[x_column].min(), scatter_frame[x_column].max(), 100)
        line_y = coefficients[0] * line_x + coefficients[1]
        ax.plot(line_x, line_y, color="#111111", linewidth=1.8, linestyle="--")

    ax.set_title(title)
    ax.set_xlabel(x_label)
    ax.set_ylabel(y_label)
    fig.tight_layout()
    fig.savefig(output_path, bbox_inches="tight")
    plt.close(fig)
    return output_path


def _sort_cluster_frame(cluster_frame: pd.DataFrame) -> pd.DataFrame:
    if cluster_frame.empty:
        return cluster_frame
    try:
        return cluster_frame.assign(_sort_key=pd.to_numeric(cluster_frame["cluster"], errors="coerce")).sort_values(
            by=["_sort_key", "cluster"], na_position="last"
        ).drop(columns="_sort_key")
    except Exception:
        return cluster_frame.sort_values("cluster")


def _save_cluster_distribution(frame: pd.DataFrame, output_dir: Path, file_name: str = "07_cluster_distribution.png") -> Path:
    output_path = output_dir / file_name
    cluster_series = frame["cluster"].dropna() if "cluster" in frame.columns else pd.Series(dtype=object)
    if cluster_series.empty:
        return _save_placeholder_chart(output_path, "各聚类类别人数分布", "cluster 数据缺失，暂无法绘图。")

    cluster_count = (
        cluster_series.astype(str)
        .value_counts()
        .rename_axis("cluster")
        .reset_index(name="count")
    )
    cluster_count = _sort_cluster_frame(cluster_count)

    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar(cluster_count["cluster"], cluster_count["count"], color="#00a88f")
    ax.set_title("各聚类类别人数分布")
    ax.set_xlabel("聚类类别")
    ax.set_ylabel("学生人数")
    ax.bar_label(bars, padding=3, fontsize=10)
    fig.tight_layout()
    fig.savefig(output_path, bbox_inches="tight")
    plt.close(fig)
    return output_path


def _save_cluster_feature_heatmap(
    frame: pd.DataFrame,
    output_dir: Path,
    file_name: str = "08_cluster_core_feature_means.png",
) -> Path:
    output_path = output_dir / file_name
    if "cluster" not in frame.columns or frame["cluster"].dropna().empty:
        return _save_placeholder_chart(output_path, "不同聚类的核心特征均值对比图", "cluster 数据缺失，暂无法绘图。")

    available_features = [
        column for column in CORE_FEATURES if column in frame.columns and pd.to_numeric(frame[column], errors="coerce").notna().any()
    ]
    if not available_features:
        return _save_placeholder_chart(output_path, "不同聚类的核心特征均值对比图", "核心特征数据不足。")

    numeric = frame[["cluster"] + available_features].copy()
    for column in available_features:
        numeric[column] = pd.to_numeric(numeric[column], errors="coerce")
    cluster_means = numeric.dropna(subset=["cluster"]).groupby("cluster")[available_features].mean()
    if cluster_means.empty:
        return _save_placeholder_chart(output_path, "不同聚类的核心特征均值对比图", "聚类均值无法计算。")

    cluster_means = cluster_means.reset_index()
    cluster_means["cluster"] = cluster_means["cluster"].astype(str)
    cluster_means = _sort_cluster_frame(cluster_means).set_index("cluster")

    normalized = cluster_means.copy()
    for column in normalized.columns:
        col_min = normalized[column].min()
        col_max = normalized[column].max()
        if pd.isna(col_min) or pd.isna(col_max):
            normalized[column] = 0
        elif float(col_max) == float(col_min):
            normalized[column] = 0.5
        else:
            normalized[column] = (normalized[column] - col_min) / (col_max - col_min)

    fig, ax = plt.subplots(figsize=(10, 5.5))
    image = ax.imshow(normalized.values, cmap="YlGnBu", aspect="auto", vmin=0, vmax=1)
    ax.set_title("不同聚类的核心特征均值对比图")
    ax.set_xlabel("核心特征")
    ax.set_ylabel("聚类类别")
    ax.set_xticks(range(len(normalized.columns)))
    ax.set_xticklabels(normalized.columns, rotation=20, ha="right")
    ax.set_yticks(range(len(normalized.index)))
    ax.set_yticklabels(normalized.index.tolist())

    for row_idx, cluster_name in enumerate(cluster_means.index):
        for col_idx, column in enumerate(cluster_means.columns):
            value = cluster_means.loc[cluster_name, column]
            text = f"{value:.2f}" if pd.notna(value) else "NA"
            ax.text(col_idx, row_idx, text, ha="center", va="center", fontsize=9, color="#111111")

    fig.colorbar(image, ax=ax, shrink=0.88, label="标准化均值")
    fig.tight_layout()
    fig.savefig(output_path, bbox_inches="tight")
    plt.close(fig)
    return output_path


def generate_all_charts(
    master_path: str | Path = DEFAULT_MASTER_PATH,
    output_dir: str | Path = DEFAULT_OUTPUT_DIR,
) -> dict[str, str]:
    _configure_plot_style()
    output_base = _prepare_output_dir(output_dir)
    data = load_analysis_master(master_path=master_path, rebuild_if_missing=True)

    chart_paths = {
        "study_time_distribution": _save_histogram(
            data,
            output_base,
            "study_time",
            "学习时长分布图",
            "学习时长",
            "01_study_time_distribution.png",
            color="#2f6bff",
        ),
        "library_count_distribution": _save_histogram(
            data,
            output_base,
            "library_count",
            "图书馆访问次数分布图",
            "图书馆访问次数",
            "02_library_count_distribution.png",
            color="#36b37e",
        ),
        "health_index_distribution": _save_histogram(
            data,
            output_base,
            "health_index",
            "健康指数分布图",
            "健康指数",
            "03_health_index_distribution.png",
            color="#ff9f1a",
        ),
        "night_net_ratio_distribution": _save_histogram(
            data,
            output_base,
            "night_net_ratio",
            "夜间上网比例分布图",
            "夜间上网比例",
            "04_night_net_ratio_distribution.png",
            color="#9b51e0",
        ),
        "study_time_vs_risk_prob": _save_scatter(
            data,
            output_base,
            "study_time",
            "risk_prob",
            "学习时长 vs 风险概率",
            "学习时长",
            "风险概率",
            "05_study_time_vs_risk_prob.png",
            color="#f05d5e",
        ),
        "library_count_vs_risk_prob": _save_scatter(
            data,
            output_base,
            "library_count",
            "risk_prob",
            "图书馆访问 vs 风险概率",
            "图书馆访问次数",
            "风险概率",
            "06_library_count_vs_risk_prob.png",
            color="#00a8cc",
        ),
        "cluster_distribution": _save_cluster_distribution(data, output_base),
        "cluster_core_feature_means": _save_cluster_feature_heatmap(data, output_base),
    }

    return {key: str(path.resolve()) for key, path in chart_paths.items()}


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="基于 analysis_master.csv 生成静态分析图。")
    parser.add_argument(
        "--master-path",
        default=str(DEFAULT_MASTER_PATH),
        help="analysis_master.csv 路径",
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help="图表输出目录",
    )
    return parser


def main() -> None:
    args = _build_parser().parse_args()
    chart_paths = generate_all_charts(master_path=args.master_path, output_dir=args.output_dir)
    print(f"图表生成完成，共 {len(chart_paths)} 张。")
    for name, path in chart_paths.items():
        print(f"{name}: {path}")


if __name__ == "__main__":
    main()

from __future__ import annotations

import json
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent
OUTPUTS = ROOT / "outputs"
FINAL = ROOT / "final_package"
TEAM_INFO = ROOT / "TEAM_INFO.json"


FILE_MAP = {
    "01_项目概要介绍.pdf": "项目概要介绍.pdf",
    "02_项目简介PPT_20页_精修版.pptx": "项目简介PPT.pptx",
    "03_项目详细方案.pdf": "项目详细方案.pdf",
    "04_项目演示视频脚本.pdf": "项目演示视频脚本.pdf",
    "05_困难与解决过程.pdf": "困难与解决过程.pdf",
    "06_可运行Demo说明.pdf": "可运行Demo说明.pdf",
}


def load_team_info():
    if not TEAM_INFO.exists():
        raise SystemExit(
            "missing TEAM_INFO.json, please copy TEAM_INFO.template.json and fill it first"
        )
    return json.loads(TEAM_INFO.read_text(encoding="utf-8"))


def ensure_outputs():
    missing = [name for name in FILE_MAP if not (OUTPUTS / name).exists()]
    if missing:
        raise SystemExit(f"missing generated files: {missing}")


def main():
    info = load_team_info()
    ensure_outputs()

    prefix = f"{info['team_id']}-{info['team_name']}-{info['track_id']}{info['track_name']}"
    FINAL.mkdir(parents=True, exist_ok=True)

    for src_name, target_name in FILE_MAP.items():
        src = OUTPUTS / src_name
        dst = FINAL / f"{prefix}-{target_name}"
        shutil.copy2(src, dst)

    readme = FINAL / f"{prefix}-提交说明.txt"
    readme.write_text(
        "\n".join(
            [
                f"项目名称：{info['project_name']}",
                f"团队编号：{info['team_id']}",
                f"团队名称：{info['team_name']}",
                f"赛题编号：{info['track_id']}",
                f"赛题名称：{info['track_name']}",
                "",
                "请将最终录制的 MP4 视频与可选知识产权证明一并放入本目录后，再统一压缩提交。",
            ]
        ),
        encoding="utf-8",
    )

    print(f"[ok] final package prepared at: {FINAL}")
    for path in sorted(FINAL.iterdir()):
        print(path.name)


if __name__ == "__main__":
    main()


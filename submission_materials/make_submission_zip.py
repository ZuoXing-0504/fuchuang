from __future__ import annotations

import json
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent
TEAM_INFO = ROOT / "TEAM_INFO.json"
FINAL = ROOT / "final_package"


def load_team_info():
    if not TEAM_INFO.exists():
        raise SystemExit("missing TEAM_INFO.json")
    return json.loads(TEAM_INFO.read_text(encoding="utf-8"))


def main():
    info = load_team_info()
    if not FINAL.exists():
        raise SystemExit("missing final_package directory, run build_final_package.py first")

    zip_name = f"{info['team_id']}-{info['team_name']}-{info['track_id']}{info['track_name']}.zip"
    zip_path = ROOT / zip_name

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(FINAL.iterdir()):
            if path.is_file():
                zf.write(path, arcname=path.name)

    size_mb = zip_path.stat().st_size / 1024 / 1024
    print(f"[ok] zip created: {zip_path}")
    print(f"[ok] size: {size_mb:.2f} MB")


if __name__ == "__main__":
    main()


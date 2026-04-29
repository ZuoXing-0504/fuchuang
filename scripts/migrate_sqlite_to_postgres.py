import os
import sqlite3
from pathlib import Path

from sqlalchemy import create_engine, text


BASE_DIR = Path(__file__).resolve().parents[1]
DEFAULT_SQLITE = BASE_DIR / "student_behavior.db"
TABLES = [
    "students",
    "student_features",
    "predictions",
    "clusters",
    "user_accounts",
    "audit_logs",
]


def load_sqlite_rows(sqlite_path: Path, table_name: str):
    with sqlite3.connect(sqlite_path) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(f'SELECT * FROM "{table_name}"').fetchall()
        if not rows:
            return [], []
        columns = rows[0].keys()
        return list(columns), [dict(row) for row in rows]


def migrate_table(target_engine, sqlite_path: Path, table_name: str):
    columns, rows = load_sqlite_rows(sqlite_path, table_name)
    if not columns:
        print(f"[skip] {table_name}: no rows")
        return

    quoted_columns = ", ".join(f'"{column}"' for column in columns)
    value_tokens = ", ".join(f":{column}" for column in columns)

    with target_engine.begin() as connection:
        connection.execute(text(f'TRUNCATE TABLE "{table_name}" RESTART IDENTITY CASCADE'))
        connection.execute(
            text(f'INSERT INTO "{table_name}" ({quoted_columns}) VALUES ({value_tokens})'),
            rows,
        )

    print(f"[ok] {table_name}: migrated {len(rows)} rows")


def main():
    sqlite_path = Path(os.getenv("SOURCE_SQLITE_PATH", str(DEFAULT_SQLITE))).resolve()
    target_url = os.getenv("TARGET_DATABASE_URL", "").strip()

    if not sqlite_path.exists():
        raise SystemExit(f"source sqlite db not found: {sqlite_path}")
    if not target_url:
        raise SystemExit("TARGET_DATABASE_URL is required")

    engine = create_engine(target_url)
    for table in TABLES:
        migrate_table(engine, sqlite_path, table)


if __name__ == "__main__":
    main()

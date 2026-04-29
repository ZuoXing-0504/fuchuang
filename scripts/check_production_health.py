from __future__ import annotations

import json
import sys
from urllib.error import URLError, HTTPError
from urllib.request import urlopen


def fetch_json(url: str):
    with urlopen(url, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


def main():
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1"
    health_url = f"{base_url.rstrip('/')}/healthz"
    try:
        data = fetch_json(health_url)
    except (URLError, HTTPError) as exc:
        print(f"[fail] health check failed: {exc}")
        raise SystemExit(1)

    status = data.get("data", {}).get("status")
    database = data.get("data", {}).get("database")
    if data.get("code") != 200 or status != "healthy":
        print(f"[fail] unhealthy response: {data}")
        raise SystemExit(1)

    print(f"[ok] status={status}, database={database}")


if __name__ == "__main__":
    main()


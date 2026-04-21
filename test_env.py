import os
from pathlib import Path

def _load_env_file() -> None:
    env_path = Path(__file__).resolve().with_name('.env')
    print(f"Looking for .env file at: {env_path}")
    print(f"File exists: {env_path.exists()}")
    
    if not env_path.exists():
        return
    
    for raw_line in env_path.read_text(encoding='utf-8').splitlines():
        line = raw_line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            print(f"Setting {key} = {value[:20]}...")
            os.environ.setdefault(key, value)

_load_env_file()

print(f"\nQWEN_API_KEY loaded: {os.getenv('QWEN_API_KEY', 'Not found')}")

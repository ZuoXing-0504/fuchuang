import os

from app import app


if __name__ == "__main__":
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", "5000"))
    debug = str(os.getenv("FLASK_DEBUG", "")).strip().lower() in {"1", "true", "yes", "on"}
    app.run(host=host, port=port, debug=debug, use_reloader=False, threaded=True)

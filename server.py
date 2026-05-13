import os
from src.app import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    print(f"Server listening on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
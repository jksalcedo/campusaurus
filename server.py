import os
from flask import Flask
from src.app import app

# Serve static files from the public directory
app.static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public')
app.static_url_path = '/'

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))
    print(f"Server listening on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
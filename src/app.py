import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from .announcements_store import (
    list_announcements,
    create_announcement,
    get_announcement,
    update_announcement,
    delete_announcement
)
from .posts_store import (
    list_posts,
    create_post,
    get_post,
    update_post,
    delete_post
)
from .database import init_db

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
public_path = os.path.join(project_root, "public")

app = Flask(__name__, static_folder=public_path, static_url_path="")
print(f"!!! FLASK STATIC FOLDER IS: {public_path} !!!")
CORS(app)

# Initialize database
init_db(app)

def as_non_empty_string(v):
    return v.strip() if isinstance(v, str) and v.strip() else ""

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

@app.route("/")
def index():
    return app.send_static_file("index/index.html")

@app.errorhandler(404)
def not_found(error):
    return app.send_static_file("index/index.html")

# Announcements routes
@app.route("/api/announcements", methods=["GET"])
def list_announcements_route():
    try:
        announcements = list_announcements()
        return jsonify({"announcements": announcements})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/announcements", methods=["POST"])
def create_announcement_route():
    title = as_non_empty_string(request.json.get("title", ""))
    body = as_non_empty_string(request.json.get("body", ""))

    if not title or not body:
        return jsonify({"error": "title and body are required"}), 400

    try:
        item = create_announcement({"title": title, "body": body})
        return jsonify(item), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/announcements/<announcement_id>", methods=["GET"])
def get_announcement_route(announcement_id):
    try:
        item = get_announcement(announcement_id)
        if not item:
            return jsonify({"error": "not found"}), 404
        return jsonify(item)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/announcements/<announcement_id>", methods=["PATCH"])
def update_announcement_route(announcement_id):
    patch = {}

    if "title" in request.json:
        title = as_non_empty_string(request.json["title"])
        if not title:
            return jsonify({"error": "title cannot be empty"}), 400
        patch["title"] = title

    if "body" in request.json:
        body = as_non_empty_string(request.json["body"])
        if not body:
            return jsonify({"error": "body cannot be empty"}), 400
        patch["body"] = body

    try:
        updated = update_announcement(announcement_id, patch)
        if not updated:
            return jsonify({"error": "not found"}), 404
        return jsonify(updated)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/announcements/<announcement_id>", methods=["DELETE"])
def delete_announcement_route(announcement_id):
    try:
        delete_announcement(announcement_id)
        return "", 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Posts routes
@app.route("/api/posts", methods=["GET"])
def list_posts_route():
    try:
        posts = list_posts()
        return jsonify({"posts": posts})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/posts", methods=["POST"])
def create_post_route():
    category_id = as_non_empty_string(request.json.get("categoryId", ""))
    title = as_non_empty_string(request.json.get("title", ""))
    content = as_non_empty_string(request.json.get("content", ""))

    if not category_id or not title:
        return jsonify({"error": "categoryId and title are required"}), 400

    try:
        item = create_post({"categoryId": category_id, "title": title, "content": content})
        return jsonify(item), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/posts/<post_id>", methods=["GET"])
def get_post_route(post_id):
    try:
        item = get_post(post_id)
        if not item:
            return jsonify({"error": "not found"}), 404
        return jsonify(item)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/posts/<post_id>", methods=["PATCH"])
def update_post_route(post_id):
    patch = {}

    if "categoryId" in request.json:
        category_id = as_non_empty_string(request.json["categoryId"])
        if not category_id:
            return jsonify({"error": "categoryId cannot be empty"}), 400
        patch["categoryId"] = category_id

    if "title" in request.json:
        title = as_non_empty_string(request.json["title"])
        if not title:
            return jsonify({"error": "title cannot be empty"}), 400
        patch["title"] = title

    if "content" in request.json:
        patch["content"] = as_non_empty_string(request.json["content"])

    try:
        updated = update_post(post_id, patch)
        if not updated:
            return jsonify({"error": "not found"}), 404
        return jsonify(updated)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/posts/<post_id>", methods=["DELETE"])
def delete_post_route(post_id):
    try:
        delete_post(post_id)
        return "", 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Stub routes
def create_not_implemented_handler(feature_name):
    def handler():
        return jsonify({
            "error": "not_implemented",
            "feature": feature_name,
            "path": request.path,
            "message": f"Backend for '{feature_name}' isn't implemented yet."
        }), 501
    return handler

app.add_url_rule("/api/me", "me_stub", create_not_implemented_handler("me"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
app.add_url_rule("/api/me/<path:path>", "me_stub_path", create_not_implemented_handler("me"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])

app.add_url_rule("/api/auth", "auth_stub", create_not_implemented_handler("auth"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
app.add_url_rule("/api/auth/<path:path>", "auth_stub_path", create_not_implemented_handler("auth"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])

app.add_url_rule("/api/categories", "categories_stub", create_not_implemented_handler("categories"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
app.add_url_rule("/api/categories/<path:path>", "categories_stub_path", create_not_implemented_handler("categories"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])

app.add_url_rule("/api/profile", "profile_stub", create_not_implemented_handler("profile"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
app.add_url_rule("/api/profile/<path:path>", "profile_stub_path", create_not_implemented_handler("profile"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])

app.add_url_rule("/api/users", "users_stub", create_not_implemented_handler("users"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
app.add_url_rule("/api/users/<path:path>", "users_stub_path", create_not_implemented_handler("users"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])

app.add_url_rule("/api/wordle", "wordle_stub", create_not_implemented_handler("wordle"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
app.add_url_rule("/api/wordle/<path:path>", "wordle_stub_path", create_not_implemented_handler("wordle"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
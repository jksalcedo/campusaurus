import os
import traceback
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
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
from .database import db, init_db
from .models import User
from .nests_store import (
    list_nests,
    create_nest,
    update_nest,
    delete_nest,
    get_island_stats
)

from .chat_store import get_recent_messages, create_message

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
public_path = os.path.join(project_root, "public")

app = Flask(__name__, static_folder=public_path, static_url_path="")
app.secret_key = os.getenv("SECRET_KEY", "campusaurus-secure-key-2026")
print(f"!!! FLASK STATIC FOLDER IS: {public_path} !!!")
CORS(app, supports_credentials=True)

# Initialize database
init_db(app)

def as_non_empty_string(v):
    return v.strip() if isinstance(v, str) and v.strip() else ""

# --- ADDED: Smart User Fallback (Crash Protected) ---
def get_current_user_id():
    """Returns the logged-in user, or safely falls back if not logged in."""
    uid = session.get("user_id")
    if uid: 
        return uid
    
    # Safety Net: If the users table has an issue, this prevents Flask from crashing
    try:
        first_user = User.query.first()
        return first_user.id if first_user else "student1"
    except Exception as e:
        print(f"\n⚠️ WARNING: Could not connect to the Users table. Error: {e}\n")
        return "student1"

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

@app.route("/")
def index():
    return app.send_static_file("index/index.html")

@app.route("/<path:path>")
def serve_static_or_index(path):
    # If the path has a file extension, serve it as a static file
    if "." in path.split("/")[-1]:
        try:
            return app.send_static_file(path)
        except:
            return app.send_static_file("index/index.html"), 404
    
    # Otherwise, try to serve index.html from that directory
    if path.endswith('/'):
        path = path.rstrip('/')
    index_path = os.path.join(path, "index.html")
    try:
        return app.send_static_file(index_path)
    except:
        return app.send_static_file("index/index.html"), 404

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
        # ADDED: Pass the authorId
        item = create_announcement({
            "title": title, 
            "body": body,
            "authorId": get_current_user_id()
        })
        return jsonify(item), 201
    except Exception as e:
        traceback.print_exc()
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
        # ADDED: Grab categoryId from URL to make nests filter correctly
        category_id = request.args.get("categoryId")
        posts = list_posts(category_id)
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
        # ADDED: Inject dynamic authorId
        item = create_post({
            "categoryId": category_id, 
            "title": title, 
            "content": content,
            "authorId": get_current_user_id()
        })
        return jsonify(item), 201
    except Exception as e:
        traceback.print_exc()
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

# Auth and Profile routes
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json
    username = as_non_empty_string(data.get("username"))
    email = as_non_empty_string(data.get("email"))
    password = as_non_empty_string(data.get("password"))
    
    # Extra fields
    age = data.get("age")
    gender = as_non_empty_string(data.get("gender"))
    dept = as_non_empty_string(data.get("dept"))
    year_level = as_non_empty_string(data.get("yearLevel") or data.get("year_level"))
    avatar_url = as_non_empty_string(data.get("avatarUrl") or data.get("avatar_url"))

    if not username or not email or not password:
        return jsonify({"error": "username, email and password are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "username already exists"}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already exists"}), 400

    user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password),
        age=age,
        gender=gender,
        dept=dept,
        year_level=year_level,
        avatar_url=avatar_url
    )
    db.session.add(user)
    db.session.commit()
    session["user_id"] = user.id
    return jsonify(user.to_dict()), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    email = as_non_empty_string(data.get("email"))
    password = as_non_empty_string(data.get("password"))

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "invalid email or password"}), 401

    session["user_id"] = user.id
    return jsonify(user.to_dict())

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return "", 204

@app.route("/api/me", methods=["GET"])
def get_me():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "not logged in"}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "user not found"}), 404
    
    return jsonify(user.to_dict())

@app.route("/api/profile", methods=["GET", "PATCH"])
def profile():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "not logged in"}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "user not found"}), 404

    if request.method == "GET":
        return jsonify(user.to_dict())
    
    data = request.json
    if "username" in data:
        user.username = as_non_empty_string(data["username"])
    if "avatarUrl" in data:
        user.avatar_url = as_non_empty_string(data["avatarUrl"])
    if "bio" in data:
        user.bio = as_non_empty_string(data["bio"])
    if "age" in data:
        user.age = data["age"]
    if "gender" in data:
        user.gender = as_non_empty_string(data["gender"])
    if "dept" in data:
        user.dept = as_non_empty_string(data["dept"])
    if "yearLevel" in data or "year_level" in data:
        user.year_level = as_non_empty_string(data.get("yearLevel") or data.get("year_level"))
    
    db.session.commit()
    return jsonify(user.to_dict())

# Remaining Stub routes
def create_not_implemented_handler(feature_name):
    def handler():
        return jsonify({
            "error": "not_implemented",
            "feature": feature_name,
            "path": request.path,
            "message": f"Backend for '{feature_name}' isn't implemented yet."
        }), 501
    return handler

# ==========================================
# NESTS ROUTES
# ==========================================
@app.route("/api/nests", methods=["GET"])
def list_nests_route():
    try:
        island_id = request.args.get("island")
        nests = list_nests(island_id)
        return jsonify({"nests": nests})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/islands/<island_id>/nests", methods=["GET"])
def list_island_nests_route(island_id):
    try:
        nests = list_nests(island_id)
        return jsonify({"nests": nests})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/nests", methods=["POST"])
@app.route("/api/islands/nests", methods=["POST"])
def create_nest_route():
    island_id = as_non_empty_string(request.json.get("islandId", ""))
    name = as_non_empty_string(request.json.get("name", ""))
    description = as_non_empty_string(request.json.get("description", ""))

    if not island_id or not name:
        return jsonify({"error": "islandId and name are required"}), 400

    try:
        # ADDED: Inject dynamic creatorId
        item = create_nest({
            "islandId": island_id, 
            "name": name, 
            "description": description,
            "creatorId": get_current_user_id()
        })
        return jsonify(item), 201
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/nests/<nest_id>", methods=["PATCH"])
def update_nest_route(nest_id):
    try:
        description = as_non_empty_string(request.json.get("description", ""))
        updated = update_nest(nest_id, {"description": description})
        if not updated:
            return jsonify({"error": "not found"}), 404
        return jsonify(updated)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/nests/<nest_id>", methods=["DELETE"])
def delete_nest_route(nest_id):
    try:
        success = delete_nest(nest_id)
        if not success:
            return jsonify({"error": "not found"}), 404
        return "", 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# ISLANDS ROUTES
# ==========================================
@app.route("/api/islands/stats", methods=["GET"])
def get_islands_stats_route():
    try:
        stats = get_island_stats()
        return jsonify({"stats": stats})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# LIVE CHAT ROUTES
# ==========================================
@app.route("/api/chat", methods=["GET"])
def get_chat_route():
    try:
        messages = get_recent_messages()
        return jsonify({"messages": messages})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/chat", methods=["POST"])
def post_chat_route():
    msg_text = as_non_empty_string(request.json.get("message", ""))
    
    if not msg_text:
        return jsonify({"error": "Message cannot be empty"}), 400

    try:
        # ADDED: Inject dynamic userId
        item = create_message({
            "message": msg_text,
            "userId": get_current_user_id()
        })
        return jsonify(item), 201
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

app.add_url_rule("/api/categories", "categories_stub", create_not_implemented_handler("categories"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
app.add_url_rule("/api/categories/<path:path>", "categories_stub_path", create_not_implemented_handler("categories"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])

app.add_url_rule("/api/users", "users_stub", create_not_implemented_handler("users"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
app.add_url_rule("/api/users/<path:path>", "users_stub_path", create_not_implemented_handler("users"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])

app.add_url_rule("/api/wordle", "wordle_stub", create_not_implemented_handler("wordle"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
app.add_url_rule("/api/wordle/<path:path>", "wordle_stub_path", create_not_implemented_handler("wordle"), methods=["GET", "POST", "PUT", "DELETE", "PATCH"])

if __name__ == "__main__":
    app.run(port=8080, debug=True)
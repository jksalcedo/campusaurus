import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from .database import db, init_db
from .models import User

# Import your stores
from .announcements_store import list_announcements, create_announcement, get_announcement, update_announcement, delete_announcement
from .posts_store import list_posts, create_post, get_post, update_post, delete_post
from .nests_store import list_nests, create_nest, update_nest, delete_nest
from .chat_store import get_recent_messages, create_message

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
public_path = os.path.join(project_root, "public")

app = Flask(__name__, static_folder=public_path, static_url_path="")
app.secret_key = os.getenv("SECRET_KEY", "campusaurus-secure-key-2026")
CORS(app, supports_credentials=True)

# Initialize database
init_db(app)

def as_non_empty_string(v):
    return v.strip() if isinstance(v, str) and v.strip() else ""

# --- SMART USER FALLBACK ---
def get_current_user_id():
    """Returns the logged-in user, or the first user in the database if testing."""
    uid = session.get("user_id")
    if uid: 
        return uid
    # Fallback to prevent crashes during testing
    first_user = User.query.first()
    return first_user.id if first_user else "Kurt"

# ==========================================
# SYSTEM ROUTES
# ==========================================
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

@app.route("/")
def index():
    return app.send_static_file("index/index.html")

@app.route("/<path:path>")
def serve_static_or_index(path):
    if "." in path.split("/")[-1]:
        try:
            return app.send_static_file(path)
        except:
            return app.send_static_file("index/index.html"), 404
    
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

# ==========================================
# AUTHENTICATION & PROFILE ROUTES
# ==========================================
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json
    username = as_non_empty_string(data.get("username"))
    email = as_non_empty_string(data.get("email"))
    password = as_non_empty_string(data.get("password"))

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password)
    )
    db.session.add(user)
    db.session.commit()
    
    # Auto-login after registering
    session["user_id"] = user.id
    return jsonify(user.to_dict()), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    email = as_non_empty_string(data.get("email"))
    password = as_non_empty_string(data.get("password"))

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

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
        return jsonify({"error": "Not logged in"}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(user.to_dict())

@app.route("/api/profile", methods=["GET", "PATCH"])
def profile():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if request.method == "GET":
        return jsonify(user.to_dict())
    
    data = request.json
    if "username" in data:
        user.username = as_non_empty_string(data["username"])
    if "avatarUrl" in data:
        user.avatar_url = as_non_empty_string(data["avatarUrl"])
    if "bio" in data:
        user.bio = as_non_empty_string(data["bio"])
    
    db.session.commit()
    return jsonify(user.to_dict())

# ==========================================
# POSTS ROUTES
# ==========================================
@app.route("/api/posts", methods=["GET"])
def list_posts_route():
    try:
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
        item = create_post({
            "categoryId": category_id, 
            "title": title, 
            "content": content,
            "authorId": get_current_user_id()
        })
        return jsonify(item), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/posts/<post_id>", methods=["PATCH"])
def update_post_route(post_id):
    try:
        patch = {}
        if "content" in request.json:
            patch["content"] = as_non_empty_string(request.json["content"])
        
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

@app.route("/api/nests", methods=["POST"])
def create_nest_route():
    island_id = as_non_empty_string(request.json.get("islandId", ""))
    name = as_non_empty_string(request.json.get("name", ""))
    description = as_non_empty_string(request.json.get("description", ""))

    if not island_id or not name:
        return jsonify({"error": "islandId and name are required"}), 400

    try:
        item = create_nest({
            "islandId": island_id, 
            "name": name, 
            "description": description,
            "creatorId": get_current_user_id()
        })
        return jsonify(item), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/nests/<nest_id>", methods=["PATCH", "DELETE"])
def update_or_delete_nest_route(nest_id):
    try:
        if request.method == "PATCH":
            description = as_non_empty_string(request.json.get("description", ""))
            updated = update_nest(nest_id, {"description": description})
            return jsonify(updated) if updated else (jsonify({"error": "not found"}), 404)
        else: # DELETE
            success = delete_nest(nest_id)
            return ("", 204) if success else (jsonify({"error": "not found"}), 404)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# LIVE CHAT ROUTES
# ==========================================
@app.route("/api/chat", methods=["GET"])
def get_chat_route():
    try:
        return jsonify({"messages": get_recent_messages()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/chat", methods=["POST"])
def post_chat_route():
    msg_text = as_non_empty_string(request.json.get("message", ""))
    if not msg_text:
        return jsonify({"error": "Message cannot be empty"}), 400
    try:
        item = create_message({"message": msg_text, "userId": get_current_user_id()})
        return jsonify(item), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# ANNOUNCEMENTS ROUTES
# ==========================================
@app.route("/api/announcements", methods=["GET"])
def list_announcements_route():
    try:
        return jsonify({"announcements": list_announcements()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/announcements", methods=["POST"])
def create_announcement_route():
    title = as_non_empty_string(request.json.get("title", ""))
    body = as_non_empty_string(request.json.get("body", ""))
    if not title or not body:
        return jsonify({"error": "title and body are required"}), 400
    try:
        item = create_announcement({"title": title, "body": body, "authorId": get_current_user_id()})
        return jsonify(item), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
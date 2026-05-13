from .models import Post, db
from typing import Optional, Dict, Any, List

def list_posts() -> List[Dict[str, Any]]:
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return [post.to_dict() for post in posts]

def create_post(data: Dict[str, Any]) -> Dict[str, Any]:
    category_id = data.get("categoryId")
    title = data.get("title")
    content = data.get("content")
    author_id = data.get("authorId", "Kurt")

    post = Post(category_id=category_id, title=title, content=content, author_id=author_id)
    db.session.add(post)
    db.session.commit()
    return post.to_dict()

def get_post(post_id: str) -> Optional[Dict[str, Any]]:
    post = Post.query.get(post_id)
    return post.to_dict() if post else None

def update_post(post_id: str, patch: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    post = Post.query.get(post_id)
    if not post:
        return None

    if "categoryId" in patch:
        post.category_id = patch["categoryId"]
    if "title" in patch:
        post.title = patch["title"]
    if "content" in patch:
        post.content = patch["content"]

    db.session.commit()
    return post.to_dict()

def delete_post(post_id: str) -> bool:
    post = Post.query.get(post_id)
    if not post:
        return False

    db.session.delete(post)
    db.session.commit()
    return True
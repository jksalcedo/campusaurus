from .models import Announcement, db
from typing import Optional, Dict, Any, List

def list_announcements() -> List[Dict[str, Any]]:
    announcements = Announcement.query.order_by(Announcement.created_at.desc()).all()
    return [announcement.to_dict() for announcement in announcements]

def create_announcement(data: Dict[str, Any]) -> Dict[str, Any]:
    title = data.get("title")
    body = data.get("body")
    author_id = data.get("authorId")

    announcement = Announcement(title=title, body=body, author_id=author_id)
    db.session.add(announcement)
    db.session.commit()
    return announcement.to_dict()

def get_announcement(announcement_id: str) -> Optional[Dict[str, Any]]:
    announcement = Announcement.query.get(announcement_id)
    return announcement.to_dict() if announcement else None

def update_announcement(announcement_id: str, patch: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    announcement = Announcement.query.get(announcement_id)
    if not announcement:
        return None

    if "title" in patch:
        announcement.title = patch["title"]
    if "body" in patch:
        announcement.body = patch["body"]

    db.session.commit()
    return announcement.to_dict()

def delete_announcement(announcement_id: str) -> bool:
    announcement = Announcement.query.get(announcement_id)
    if not announcement:
        return False

    db.session.delete(announcement)
    db.session.commit()
    return True
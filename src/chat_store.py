from .models import ChatMessage, Nest, db
from typing import Dict, Any, List
import uuid

def get_recent_messages(limit=50) -> List[Dict[str, Any]]:
    # Get the latest 50 messages
    messages = ChatMessage.query.order_by(ChatMessage.created_at.desc()).limit(limit).all()
    # Reverse them so the newest is at the bottom of the chat box
    return [msg.to_dict() for msg in reversed(messages)]

def create_message(data: Dict[str, Any]) -> Dict[str, Any]:
    msg = ChatMessage(
        id=str(uuid.uuid4()),
        user_id="student1", # Hardcoded user until login is built
        message=data.get("message", "")
    )
    db.session.add(msg)
    db.session.commit()
    return msg.to_dict()
def create_message(data: Dict[str, Any]) -> Dict[str, Any]:
    msg = ChatMessage(
        id=str(uuid.uuid4()),
        # Removed "student1", now uses the passed ID
        user_id=data.get("userId"), 
        message=data.get("message", "")
    )
    db.session.add(msg)
    db.session.commit()
    return msg.to_dict()
from .database import db
from datetime import datetime
import uuid

class Announcement(db.Model):
    __tablename__ = 'announcements'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'body': self.body,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category_id = db.Column(db.String(255), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=True)
    author_id = db.Column(db.String(255), nullable=False, default='Kurt')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)
    comments = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'categoryId': self.category_id,
            'title': self.title,
            'content': self.content,
            'authorId': self.author_id,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'likes': self.likes,
            'comments': self.comments
        }
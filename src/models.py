from .database import db
from datetime import datetime
import uuid

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    avatar_url = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'avatarUrl': self.avatar_url,
            'bio': self.bio,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

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

class Nest(db.Model):
    __tablename__ = 'nests'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    island_id = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    creator_id = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'islandId': self.island_id,
            'name': self.name,
            'description': self.description,
            'creatorId': self.creator_id,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
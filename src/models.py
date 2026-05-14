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
    age = db.Column(db.Integer, nullable=True)
    gender = db.Column(db.String(50), nullable=True)
    dept = db.Column(db.String(255), nullable=True)
    year_level = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    posts = db.relationship('Post', backref='author', lazy=True)
    announcements = db.relationship('Announcement', backref='author', lazy=True)
    nests = db.relationship('Nest', backref='creator', lazy=True)
    chat_messages = db.relationship('ChatMessage', backref='user', lazy=True)

    def is_admin(self):
        try:
            return Admin.query.filter_by(email=self.email).first() is not None
        except:
            return False

    def to_dict(self):
        is_admin_flag = self.is_admin()
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'avatar_url': self.avatar_url,
            'avatarUrl': self.avatar_url,
            'bio': self.bio,
            'age': self.age,
            'gender': self.gender,
            'dept': self.dept,
            'yearLevel': self.year_level,
            'year_level': self.year_level,
            'is_admin': is_admin_flag,
            'isAdmin': is_admin_flag,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class Admin(db.Model):
    __tablename__ = 'admins'
    email = db.Column(db.String(255), primary_key=True)

    def to_dict(self):
        return {
            'email': self.email
        }

class Announcement(db.Model):
    __tablename__ = 'announcements'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.String(255), db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'body': self.body,
            'author_id': self.author_id,
            'authorId': self.author_id,
            'author_username': self.author.username if self.author else "Admin",
            'authorUsername': self.author.username if self.author else "Admin",
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category_id = db.Column(db.String(255), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=True)
    author_id = db.Column(db.String(255), db.ForeignKey('users.id'), nullable=False, default='Kurt')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)
    comments = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'category_id': self.category_id,
            'categoryId': self.category_id,
            'title': self.title,
            'content': self.content,
            'author_id': self.author_id,
            'authorId': self.author_id,
            'author_username': self.author.username if self.author else "Explorer",
            'authorUsername': self.author.username if self.author else "Explorer",
            'created_at': self.created_at.isoformat() if self.created_at else None,
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
    creator_id = db.Column(db.String(255), db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'island_id': self.island_id,
            'islandId': self.island_id,
            'name': self.name,
            'description': self.description,
            'creator_id': self.creator_id,
            'creatorId': self.creator_id,
            'creator_username': self.creator.username if self.creator else "Student",
            'creatorUsername': self.creator.username if self.creator else "Student",
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False, default='student1')
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "userId": self.user_id,
            "username": self.user.username if self.user else "Student",
            "message": self.message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }

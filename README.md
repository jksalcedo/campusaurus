# Campusaurus 🦖

A campus community platform with announcements, island nests, discussion posts, comments, live chat, and a daily Wordle — built with Flask and MySQL.

## Setup

### 1. Install XAMPP

Download and install XAMPP from https://www.apachefriends.org/

### 2. Start XAMPP Services

Open the XAMPP Control Panel and start **Apache** and **MySQL**.

### 3. Create the Database

- Open phpMyAdmin at http://localhost/phpmyadmin
- Create a database named `campusaurus`
- Import `schema.sql` to create all tables and seed sample data

### 4. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=campusaurus
SECRET_KEY=your-secret-key
```

### 6. Run the Application

```bash
python server.py
```

Available at **http://localhost:8080**

---

## API Reference

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (username, email, password) |
| POST | `/api/auth/login` | Login (email, password) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/me` | Get current session user |
| GET | `/api/profile` | Get current user profile |
| PATCH | `/api/profile` | Update profile (username, avatarUrl, bio, etc.) |

### Announcements
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/announcements` | List all announcements |
| POST | `/api/announcements` | Create announcement |
| GET | `/api/announcements/<id>` | Get announcement |
| PATCH | `/api/announcements/<id>` | Update announcement |
| DELETE | `/api/announcements/<id>` | Delete announcement |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List posts (filter: `?categoryId=`) |
| POST | `/api/posts` | Create post |
| GET | `/api/posts/<id>` | Get post |
| PATCH | `/api/posts/<id>` | Update post (author/admin only) |
| DELETE | `/api/posts/<id>` | Delete post (author/admin only) |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts/<id>/comments` | List comments for a post |
| POST | `/api/posts/<id>/comments` | Add a comment (login required) |

### Islands & Nests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/islands/stats` | Island member/post stats |
| GET | `/api/islands/<id>/nests` | List nests for an island |
| POST | `/api/islands/nests` | Create a nest |
| GET | `/api/nests` | List all nests (filter: `?island=`) |
| POST | `/api/nests` | Create a nest |
| PATCH | `/api/nests/<id>` | Update nest description |
| DELETE | `/api/nests/<id>` | Delete nest |

### Live Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat` | Get recent messages |
| POST | `/api/chat` | Send a message |

---

## Database Schema

| Table | Columns |
|-------|---------|
| `users` | id, username, email, password_hash, avatar_url, bio, age, gender, dept, year_level, created_at |
| `admins` | email |
| `announcements` | id, title, body, author_id, created_at |
| `posts` | id, category_id, title, content, author_id, likes, comments, created_at |
| `comments` | id, post_id, author_id, content, created_at |
| `nests` | id, island_id, name, description, creator_id, created_at |
| `chat_messages` | id, user_id, message, created_at |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Base Camp — post feed with search, island filter, live chat |
| `/announcements/` | Campus announcements board |
| `/islands/` | Island overview with stats |
| `/nest/?island=<id>` | Nests for a specific island |
| `/create/` | Log a new discovery (create post) |
| `/profile/` | User profile |
| `/login/` | Login |
| `/register/` | Register |
| `/wordle/` | Daily Wordle mini-game |

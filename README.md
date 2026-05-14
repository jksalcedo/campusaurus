# Campusaurus - Flask Backend with XAMPP MySQL

A campus announcement and discussion platform with Flask backend and MySQL database.

## Setup Instructions

### 1. Install XAMPP

Download and install XAMPP from https://www.apachefriends.org/

### 2. Start XAMPP Services

- Open XAMPP Control Panel
- Start Apache and MySQL services

### 3. Create Database

- Open phpMyAdmin (http://localhost/phpmyadmin)
- Create a new database named `campusaurus`
- Import the `schema.sql` file to create tables and sample data

### 4. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

- Create a `.env` file from `.env.example` if you do not already have one
- Update `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` as needed
- Make sure MySQL is running in XAMPP and listening on the configured port

### 6. Run the Application

```bash
python server.py
```

The application will be available at http://localhost:8080

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/announcements` - List announcements
- `POST /api/announcements` - Create announcement
- `GET /api/announcements/<id>` - Get announcement
- `PATCH /api/announcements/<id>` - Update announcement
- `DELETE /api/announcements/<id>` - Delete announcement
- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `GET /api/posts/<id>` - Get post
- `PATCH /api/posts/<id>` - Update post
- `DELETE /api/posts/<id>` - Delete post

## Authentication Endpoints

- `POST /api/auth/register` - Register a new user (email, password, username)
- `POST /api/auth/login` - Login and start a session (email, password)
- `POST /api/auth/logout` - Logout and end session
- `GET /api/me` - Get current logged-in user info
- `PATCH /api/profile` - Update current user profile (username, avatarUrl, bio)

## Database Schema

- **users**: id, username, email, password_hash, avatar_url, bio, created_at
- **announcements**: id, title, body, author_id, created_at
- **posts**: id, category_id, title, content, author_id, created_at, likes, comments

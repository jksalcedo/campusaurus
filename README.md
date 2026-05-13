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

- The `.env` file is already configured with default XAMPP settings
- Update if you have custom MySQL credentials

### 6. Run the Application

```bash
python server.py
```

The application will be available at http://localhost:3000

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

## Database Schema

- **announcements**: id, title, body, author_id, created_at
- **posts**: id, category_id, title, content, author_id, created_at, likes, comments

## Migration from Supabase

This project has been migrated from Supabase to local XAMPP MySQL:

- Removed all Supabase dependencies
- Converted to SQLAlchemy ORM
- Added database schema file
- Updated to use local MySQL database

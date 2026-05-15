-- Database schema for Campusaurus

CREATE DATABASE IF NOT EXISTS campusaurus;
USE campusaurus;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    bio TEXT,
    age INT,
    gender VARCHAR(50),
    dept VARCHAR(255),
    year_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admins table (Privilege Registry)
CREATE TABLE IF NOT EXISTS admins (
    email VARCHAR(255) PRIMARY KEY
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    author_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    author_id VARCHAR(255) NOT NULL DEFAULT 'Kurt',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0
);

-- Nests table
CREATE TABLE IF NOT EXISTS nests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    island_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(50) NOT NULL DEFAULT 'student1',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    post_id VARCHAR(36) NOT NULL,
    author_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Verify rows exist in each table
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users;
SELECT 'admins' AS table_name, COUNT(*) AS row_count FROM admins;
SELECT 'announcements' AS table_name, COUNT(*) AS row_count FROM announcements;
SELECT 'posts' AS table_name, COUNT(*) AS row_count FROM posts;
SELECT 'nests' AS table_name, COUNT(*) AS row_count FROM nests;
SELECT 'chat_messages' AS table_name, COUNT(*) AS row_count FROM chat_messages;

-- Database schema for Campusaurus
-- Run this in phpMyAdmin or MySQL command line

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

-- Insert Admin Whitelist
INSERT INTO admins (email) VALUES ('kurtaquino49@gmail.com');

-- Insert sample users
INSERT INTO users (id, username, email, password_hash, avatar_url, bio, age, gender, dept, year_level) VALUES
('11111111-1111-1111-1111-111111111111', 'student1', 'student1@example.com', 'hashed_pw_1', NULL, 'CS freshman.', 18, 'M', 'CCS', '1'),
('22222222-2222-2222-2222-222222222222', 'student2', 'student2@example.com', 'hashed_pw_2', NULL, 'Likes group study.', 19, 'F', 'CCS', '2'),
('33333333-3333-3333-3333-333333333333', 'admin', 'admin@example.com', 'hashed_pw_3', NULL, 'Campus admin.', 30, 'N/A', 'ADMIN', 'N/A');

-- Insert sample announcements
INSERT INTO announcements (id, title, body, author_id) VALUES
('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Welcome to Campusaurus!', 'This is your campus announcement system.', '33333333-3333-3333-3333-333333333333'),
('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'First Day of Classes', 'Classes begin tomorrow. Don\'t be late!', '33333333-3333-3333-3333-333333333333');

-- Insert sample nests
INSERT INTO nests (id, island_id, name, description, creator_id) VALUES
('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'ccs', 'n/ProjectDino', 'Project discussion nest.', '11111111-1111-1111-1111-111111111111'),
('bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'cea', 'n/BridgeBuilders', 'CEA collaboration nest.', '22222222-2222-2222-2222-222222222222');

-- Insert sample posts
INSERT INTO posts (id, category_id, title, content, author_id) VALUES
('ccccccc1-cccc-cccc-cccc-ccccccccccc1', 'general', 'Hello World', 'This is my first post!', '11111111-1111-1111-1111-111111111111'),
('ccccccc2-cccc-cccc-cccc-ccccccccccc2', 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'Nest Update', 'Posting inside ProjectDino nest.', '22222222-2222-2222-2222-222222222222');

-- Insert sample chat messages
INSERT INTO chat_messages (id, user_id, message) VALUES
('ddddddd1-dddd-dddd-dddd-dddddddddd1', '11111111-1111-1111-1111-111111111111', 'Roar! Anyone here?'),
('ddddddd2-dddd-dddd-dddd-dddddddddd2', '22222222-2222-2222-2222-222222222222', 'Hello! Welcome to the chat.');

-- Verify rows exist in each table
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users;
SELECT 'admins' AS table_name, COUNT(*) AS row_count FROM admins;
SELECT 'announcements' AS table_name, COUNT(*) AS row_count FROM announcements;
SELECT 'posts' AS table_name, COUNT(*) AS row_count FROM posts;
SELECT 'nests' AS table_name, COUNT(*) AS row_count FROM nests;
SELECT 'chat_messages' AS table_name, COUNT(*) AS row_count FROM chat_messages;

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

-- Insert Admin Whitelist
INSERT INTO admins (email) VALUES ('kurtaquino49@gmail.com');

-- Insert some sample data
INSERT INTO announcements (title, body, author_id) VALUES
('Welcome to Campusaurus!', 'This is your campus announcement system.', 'admin'),
('First Day of Classes', 'Classes begin tomorrow. Don\'t be late!', 'admin');

INSERT INTO posts (category_id, title, content, author_id) VALUES
('general', 'Hello World', 'This is my first post!', 'student1'),
('study', 'Study Group', 'Looking for study partners for CS101.', 'student2');

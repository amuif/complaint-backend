-- Initialize database with proper settings
SET NAMES utf8mb4;
SET character_set_client = utf8mb4;

-- Create database if not exists (already created by MYSQL_DATABASE env var)
-- But ensure proper charset and collation
ALTER DATABASE office_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant all privileges to the office_user
GRANT ALL PRIVILEGES ON office_management.* TO 'office_user'@'%';
FLUSH PRIVILEGES;

-- Set proper timezone
SET time_zone = '+00:00'; 
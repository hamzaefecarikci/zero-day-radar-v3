-- Zero-Day Radar veritabani semasi
-- Ilk kurulumda calistirilir: mysql -u root -p < db/init.sql

CREATE DATABASE IF NOT EXISTS zero_day_radar
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE zero_day_radar;

-- users tablosu (PROJE-YAPISI.md sozlesmesinden genisletildi)
CREATE TABLE IF NOT EXISTS users (
    userid INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(190) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL DEFAULT '',
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Sonraki adimlarda eklenecek tablolar (anc, vulnerabilities, gallery, ip_visits) icin
-- yer tutucudur; simdilik sadece users yeterli.

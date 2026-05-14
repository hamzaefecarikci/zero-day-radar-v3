-- Zero-Day Radar veritabani semasi
-- Ilk kurulumda calistirilir: mysql -u root -p < db/init.sql

CREATE DATABASE IF NOT EXISTS zero_day_radar_v3
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE zero_day_radar_v3;

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

-- CVE / zafiyet kayitlari
CREATE TABLE IF NOT EXISTS vulnerabilities (
    vulnerabilityid INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(190) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    cve_id VARCHAR(40) DEFAULT NULL,
    severity ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
    affected_systems TEXT,
    patch_status ENUM('Unpatched', 'Patched', 'In Progress', 'Unknown') NOT NULL DEFAULT 'Unknown',
    summary TEXT,
    description MEDIUMTEXT,
    published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vuln_severity (severity),
    INDEX idx_vuln_published (published_at),
    FOREIGN KEY (created_by) REFERENCES users(userid)
) ENGINE=InnoDB;

-- Duyuru / haber kayitlari
CREATE TABLE IF NOT EXISTS announcements (
    announcementid INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(190) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    body MEDIUMTEXT,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_anc_active (is_active, created_at),
    FOREIGN KEY (created_by) REFERENCES users(userid)
) ENGINE=InnoDB;

-- Galeri (resim) kayitlari
CREATE TABLE IF NOT EXISTS gallery (
    galleryid INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(190) NOT NULL,
    original_name VARCHAR(255),
    mime VARCHAR(80) NOT NULL,
    size_bytes INT NOT NULL,
    caption VARCHAR(255),
    uploaded_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_gallery_filename (filename),
    FOREIGN KEY (uploaded_by) REFERENCES users(userid)
) ENGINE=InnoDB;

-- Ziyaretci sayaci - IP basina gunde 1 kayit
CREATE TABLE IF NOT EXISTS ip_visits (
    ip VARCHAR(45) NOT NULL,
    visit_date DATE NOT NULL,
    first_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ip, visit_date),
    INDEX idx_visit_date (visit_date)
) ENGINE=InnoDB;

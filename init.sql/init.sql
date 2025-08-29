-- =====================================================
-- INITIALISATION DE LA BASE DE DONNÉES ESPACE COMÉDIE
-- =====================================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS espace_comedie;
USE espace_comedie;

-- =====================================================
-- TABLE UTILISATEURS
-- =====================================================
CREATE TABLE user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  civility VARCHAR(100) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  dateNaissance DATE NOT NULL,
  role VARCHAR(20) DEFAULT 'utilisateur' COMMENT 'admin | utilisateur',
  isActive BOOLEAN DEFAULT TRUE COMMENT 'Indique si le compte utilisateur est actif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL COMMENT 'Date et heure de la dernière connexion'
);

-- =====================================================
-- TABLE NEWSLETTER SUBSCRIBERS
-- =====================================================
CREATE TABLE newsletter_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_subscribed_at (subscribed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE ARTISTES
-- =====================================================
CREATE TABLE artiste (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  biographie TEXT NOT NULL,
  photo VARCHAR(255) NOT NULL,
  photo_featured VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE SPECTACLES
-- =====================================================
CREATE TABLE spectacle (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  img VARCHAR(999) NOT NULL,
  description TEXT NOT NULL,
  date_spectacle DATE NOT NULL,
  heure_spectacle TIME NOT NULL,
  prix INT NOT NULL,
  lieu VARCHAR(255) NOT NULL COMMENT "L'espace comédie",
  artiste_id INT NOT NULL,
  places_disponibles INT NOT NULL DEFAULT 100 COMMENT 'Nombre total de places disponibles pour ce spectacle'
);

-- =====================================================
-- TABLE RÉSERVATIONS
-- =====================================================
CREATE TABLE reservation (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  spectacle_id INT NOT NULL,
  nb_places INT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE TICKETS (1 ticket par personne)
-- =====================================================
CREATE TABLE ticket (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reservation_id INT NOT NULL,
  qr_code_path VARCHAR(255) NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reservation_id (reservation_id),
  INDEX idx_ticket_used (used),
  INDEX idx_ticket_used_at (used_at)
);

-- =====================================================
-- TABLE PAIEMENTS
-- =====================================================
CREATE TABLE paiement (
  id INT PRIMARY KEY AUTO_INCREMENT,
  montant INT NOT NULL,
  statut BOOLEAN NOT NULL,
  session_id VARCHAR(255),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE LIAISON PAIEMENTS-RÉSERVATIONS
-- =====================================================
CREATE TABLE paiement_reservation (
  paiement_id INT NOT NULL,
  reservation_id INT NOT NULL,
  montant INT NOT NULL,
  PRIMARY KEY (paiement_id, reservation_id)
);

-- =====================================================
-- TABLE AVIS
-- =====================================================
CREATE TABLE avis (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  spectacle_id INT NOT NULL,
  message TEXT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE LIEU (Images de la galerie)
-- =====================================================
CREATE TABLE lieu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_path VARCHAR(512) NOT NULL,
  image_detail_path VARCHAR(512),
  is_main BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- TABLE CODES PROMO
-- =====================================================
CREATE TABLE promo_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('percentage', 'fixed', 'free_ticket') NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  max_uses INT DEFAULT NULL,
  current_uses INT DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE PARAMETRES (SETTINGS)
-- =====================================================
CREATE TABLE settings (
  `key` VARCHAR(100) PRIMARY KEY,
  `value` TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- CLÉS ÉTRANGÈRES
-- =====================================================

-- Clés étrangères pour les spectacles
ALTER TABLE spectacle ADD FOREIGN KEY (artiste_id) REFERENCES artiste(id);

-- Clés étrangères pour les réservations
ALTER TABLE reservation ADD FOREIGN KEY (user_id) REFERENCES user(id);
ALTER TABLE reservation ADD FOREIGN KEY (spectacle_id) REFERENCES spectacle(id);

-- Clés étrangères pour les tickets
ALTER TABLE ticket ADD FOREIGN KEY (reservation_id) REFERENCES reservation(id);

-- Clés étrangères pour les paiements
ALTER TABLE paiement_reservation ADD FOREIGN KEY (paiement_id) REFERENCES paiement(id);
ALTER TABLE paiement_reservation ADD FOREIGN KEY (reservation_id) REFERENCES reservation(id);

-- Clés étrangères pour les avis
ALTER TABLE avis ADD FOREIGN KEY (user_id) REFERENCES user(id);
ALTER TABLE avis ADD FOREIGN KEY (spectacle_id) REFERENCES spectacle(id);

-- =====================================================
-- INDEX POUR OPTIMISATION
-- =====================================================

-- Index pour les codes promo
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX idx_promo_codes_validity ON promo_codes(valid_from, valid_until);

-- Index pour les spectacles
CREATE INDEX idx_spectacle_date ON spectacle(date_spectacle);
CREATE INDEX idx_spectacle_artiste ON spectacle(artiste_id);

-- Index pour les réservations
CREATE INDEX idx_reservation_user ON reservation(user_id);
CREATE INDEX idx_reservation_spectacle ON reservation(spectacle_id);
CREATE INDEX idx_reservation_date ON reservation(date);

-- Index pour les paiements
CREATE INDEX idx_paiement_session ON paiement(session_id);
CREATE INDEX idx_paiement_date ON paiement(date);

-- Index pour les avis
CREATE INDEX idx_avis_user ON avis(user_id);
CREATE INDEX idx_avis_spectacle ON avis(spectacle_id);

-- =====================================================
-- DONNÉES DE TEST
-- =====================================================

-- 1. Utilisateur de test (admin)
-- Mot de passe: "password123" (hash bcrypt)
INSERT INTO user (id, civility, nom, prenom, email, password, dateNaissance, role, isActive) VALUES
(1, 'M.', 'Test', 'Jean', 'jean.test@example.com', '$2a$10$k.M7bXp9jJ8G5Qz.cO9dZ.D9uWwYqO/PzM4jG1xRn2qO7m.m.z0qC', '1990-01-01', 'utilisateur', TRUE);

-- 2. Artiste de test
INSERT INTO artiste (id, name, biographie, photo, photo_featured) VALUES
(1, 'Gad Elmaleh', 'Un humoriste célèbre.', 'pikach_artiste.webp', 'pikach_feature.webp');

-- 3. Spectacles de test
INSERT INTO spectacle (id, title, img, description, date_spectacle, heure_spectacle, prix, lieu, artiste_id, places_disponibles) VALUES
(1, 'D''ailleurs', 'spectacles_pikach.webp', 'Le nouveau spectacle de Gad Elmaleh.', '2025-12-25', '20:30:00', 45, 'L''espace comedie', 1, 50),
(2, 'L''autre, c''est moi', 'spectacles_pikach.webp', 'Un classique de Gad Elmaleh.', '2025-11-15', '21:00:00', 40, 'L''espace comedie', 1, 50);

-- 4. Avis de test
INSERT INTO avis (user_id, spectacle_id, message) VALUES
(1, 1, 'Excellent spectacle !'),
(1, 2, 'Très drôle, je recommande !');

-- 5. Réservations de test
INSERT INTO reservation (user_id, spectacle_id, nb_places) VALUES
(1, 1, 2),
(1, 2, 1);

-- 6. Paiements de test
INSERT INTO paiement (montant, statut) VALUES
(90, TRUE),  -- 2 places à 45€
(40, TRUE);  -- 1 place à 40€

-- 7. Liaison paiements-réservations
INSERT INTO paiement_reservation (paiement_id, reservation_id, montant) VALUES
(1, 1, 90),
(2, 2, 40);

-- 8. Images du lieu de test
INSERT INTO lieu (image_path, is_main) VALUES
('bar.webp', TRUE),
('bar1.webp', FALSE),
('bar2.webp', FALSE);

-- 9. Codes promo de test
INSERT INTO promo_codes (code, type, value, description, is_active, max_uses, valid_from, valid_until) VALUES
('WELCOME10', 'percentage', 10.00, 'Reduction de 10% pour les nouveaux clients', TRUE, 100, '2025-01-01', '2025-12-31'),
('FREETICKET', 'free_ticket', 1.00, 'Un ticket gratuit pour tout achat', TRUE, 50, '2025-01-01', '2025-12-31'),
('DISCOUNT5', 'fixed', 5.00, 'Reduction fixe de 5€', TRUE, 200, '2025-01-01', '2025-12-31');

-- 10. Paramètres par défaut
INSERT INTO settings (`key`, `value`) VALUES
('contact_recipient_email', 'contact@espacecomedia.fr')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- =====================================================
-- FIN D'INITIALISATION
-- =====================================================

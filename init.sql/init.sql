-- =====================================================
-- INITIALISATION DE LA BASE DE DONNÉES ESPACE COMÉDIE
-- =====================================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS espace_comedie CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE espace_comedie;

-- Forcer l'encodage UTF-8
SET NAMES utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;
SET character_set_server = utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;
SET collation_server = utf8mb4_unicode_ci;

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
  photo VARCHAR(255) NOT NULL,
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
  pitch_description TEXT NULL,
  date_spectacle DATE NOT NULL,
  heure_spectacle TIME NOT NULL,
  lieu VARCHAR(255) NOT NULL COMMENT "L'espace comédie",
  lien_spectacle VARCHAR(500) NULL COMMENT 'Lien vers la billetterie pour ce spectacle'
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
  is_main BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- TABLE PHOTOS ADDITIONNELS POUR LES SPECTACLES
-- =====================================================
CREATE TABLE photo_addictionnel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_path VARCHAR(512) NOT NULL,
    sort_order INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DONNEES PHOTOS ADDITIONNELLES
-- =====================================================
INSERT INTO photo_addictionnel (image_path, sort_order) VALUES
('/assets/img/photo_additionnel/Ado 234.JPEG', 1),
('/assets/img/photo_additionnel/Ado 1356.JPEG', 2),
('/assets/img/photo_additionnel/Ado 123.JPEG', 3);

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

-- Clés étrangères pour les avis
ALTER TABLE avis ADD FOREIGN KEY (user_id) REFERENCES user(id);
ALTER TABLE avis ADD FOREIGN KEY (spectacle_id) REFERENCES spectacle(id);

-- =====================================================
-- INDEX POUR OPTIMISATION
-- =====================================================


-- Index pour les spectacles
CREATE INDEX idx_spectacle_date ON spectacle(date_spectacle);
CREATE INDEX idx_spectacle_date_heure ON spectacle(date_spectacle, heure_spectacle);


-- Index pour les avis
CREATE INDEX idx_avis_user ON avis(user_id);
CREATE INDEX idx_avis_spectacle ON avis(spectacle_id);

CREATE INDEX idx_artiste_created ON artiste(created_at);
CREATE INDEX idx_user_email ON user(email);

-- =====================================================
-- DONNÉES DE TEST
-- =====================================================

-- 1. Utilisateur de test (admin)
-- Mot de passe: "password123" (hash bcrypt)
INSERT INTO user (id, civility, nom, prenom, email, password, dateNaissance, role, isActive) VALUES
(8, 'M.', 'Test', 'Jean', 'jean.test@example.com', '$2a$10$k.M7bXp9jJ8G5Qz.cO9dZ.D9uWwYqO/PzM4jG1xRn2qO7m.m.z0qC', '1990-01-01', 'utilisateur', TRUE);

-- 2. Artistes
INSERT INTO artiste (id, name, photo) VALUES
(1, 'Ilyes', 'TCC ILYES DDD.JPEG'),
(2, 'Paul', 'TCC paul mi.JPEG'),
(3, 'Tom', 'TCC TOM BOUBOU.JPEG');

-- 3. Spectacles de test


-- 8. Images du lieu de test
INSERT INTO lieu (image_path, is_main) VALUES
('bar.webp', TRUE),
('bar1.webp', FALSE),
('bar2.webp', FALSE),
('bar3.webp', FALSE),
('bar4.webp', FALSE),
('bar5.webp', FALSE),
('bar6.webp', FALSE);



-- 10. Paramètres par défaut
INSERT INTO settings (`key`, `value`) VALUES
('contact_recipient_email', 'contact@espacecomedia.fr')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);


-- 4. Avis de test (déplacés après les spectacles)
-- Spectacles Tchatcheur Comedy Club
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES
(1, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-09-15', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(2, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-09-16', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(3, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-09-17', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(4, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-09-19', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(5, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-09-20', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(6, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-09-20', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(7, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-09-20', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(8, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-09-22', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(9, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-09-23', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(10, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-09-24', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(11, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-09-26', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(12, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-09-27', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(13, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-09-27', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(14, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-09-27', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(15, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-09-29', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(16, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-09-30', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(17, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-01', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(18, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-03', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(19, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-04', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(20, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-04', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(21, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-04', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(22, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-06', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(23, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-07', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(24, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-08', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(25, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-10', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(26, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-11', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(27, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-11', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(28, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-11', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(29, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-13', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(30, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-14', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(31, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-15', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(32, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-17', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(33, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-18', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(34, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-18', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(35, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-18', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(36, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-20', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(37, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-21', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(38, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-22', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(39, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-24', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(40, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-25', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(41, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-25', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(42, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-25', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(43, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-27', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(44, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-28', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(45, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-29', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(46, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-10-31', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(47, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-01', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(48, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-01', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(49, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-01', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(50, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-03', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(51, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-04', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(52, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-05', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(53, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-07', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(54, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-08', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(55, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-08', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(56, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-08', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(57, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-10', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(58, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-11', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(59, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-12', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(60, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-14', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(61, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-15', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(62, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-15', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(63, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-15', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(64, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-17', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(65, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-18', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(66, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-19', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(67, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-21', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(68, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-22', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(69, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-22', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(70, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-22', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(71, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-24', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(72, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-25', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(73, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-26', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(74, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-28', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(75, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-29', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(76, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-29', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(77, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-11-29', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(78, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-01', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(79, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-02', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(80, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-03', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(81, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-05', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(82, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-06', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(83, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-06', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(84, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-06', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(85, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-08', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(86, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-09', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(87, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-10', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(88, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-12', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(89, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-13', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(90, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-13', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(91, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-13', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(92, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-15', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(93, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-16', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(94, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-17', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(95, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-19', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(96, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-20', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(97, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-20', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(98, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-20', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(99, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-22', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(100, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-23', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(101, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-24', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(102, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-26', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(103, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-27', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(104, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-27', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(105, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-27', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(106, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-29', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(107, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-30', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(108, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2025-12-31', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(109, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-02', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(110, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-03', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(111, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-03', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(112, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-03', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(113, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-05', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(114, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-06', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(115, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-07', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(116, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-09', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(117, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-10', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(118, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-10', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(119, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-10', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(120, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-12', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(121, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-13', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(122, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-14', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(123, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-16', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(124, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-17', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(125, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-17', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(126, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-17', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(127, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-19', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(128, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-20', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(129, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-21', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(130, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-23', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(131, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-24', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(132, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-24', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(133, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-24', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(134, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-26', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(135, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-27', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(136, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-28', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(137, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-30', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(138, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-31', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(139, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-31', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(140, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-01-31', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(141, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-02', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(142, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-03', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(143, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-04', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(144, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-06', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(145, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-07', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(146, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-07', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(147, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-07', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(148, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-09', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(149, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-10', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(150, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-11', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(151, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-13', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(152, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-14', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(153, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-14', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(154, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-14', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(155, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-16', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(156, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-17', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(157, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-18', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(158, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-20', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(159, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-21', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(160, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-21', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(161, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-21', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(162, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-23', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(163, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-24', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(164, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-25', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(165, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-27', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(166, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-28', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(167, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-28', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(168, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-02-28', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(169, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-02', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(170, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-03', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(171, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-04', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(172, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-06', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(173, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-07', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(174, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-07', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(175, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-07', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(176, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-09', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(177, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-10', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(178, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-11', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(179, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-13', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(180, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-14', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(181, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-14', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(182, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-14', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(183, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-16', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(184, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-17', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(185, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-18', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(186, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-20', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(187, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-21', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(188, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-21', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(189, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-21', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(190, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-23', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(191, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-24', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(192, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-25', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(193, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-27', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(194, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-28', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(195, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-28', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(196, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-28', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(197, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-30', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(198, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-03-31', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(199, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-01', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(200, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-03', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(201, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-04', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(202, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-04', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(203, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-04', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(204, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-06', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(205, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-07', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(206, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-08', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(207, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-10', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(208, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-11', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(209, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-11', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(210, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-11', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(211, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-13', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(212, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-14', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(213, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-15', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(214, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-17', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(215, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-18', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(216, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-18', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(217, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-18', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(218, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-20', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(219, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-21', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(220, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-22', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(221, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-24', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(222, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-25', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(223, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-25', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(224, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-25', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(225, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-27', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(226, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-28', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(227, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-04-29', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(228, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-01', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(229, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-02', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(230, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-02', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(231, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-02', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(232, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-04', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(233, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-05', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(234, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-06', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(235, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-08', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(236, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-09', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(237, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-09', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(238, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-09', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(239, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-11', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(240, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-12', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(241, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-13', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(242, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-15', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(243, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-16', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(244, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-16', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(245, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-16', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(246, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-18', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(247, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-19', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(248, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-20', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(249, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-22', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(250, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-23', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(251, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-23', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(252, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-23', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(253, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-25', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(254, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-26', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(255, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-27', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(256, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-29', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(257, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-30', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(258, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-30', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(259, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-05-30', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(260, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-01', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(261, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-02', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(262, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-03', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(263, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-05', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(264, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-06', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(265, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-06', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(266, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-06', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(267, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-08', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(268, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-09', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(269, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-10', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(270, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-12', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(271, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-13', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(272, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-13', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(273, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-13', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(274, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-15', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(275, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-16', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(276, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-17', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(277, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-19', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(278, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-20', '17:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(279, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-20', '19:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(280, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-20', '20:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(281, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-22', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(282, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-23', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(283, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-24', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942'),
(284, 'Tchatcheur Comedy Club', 'Tchatcheur comedy club.webp', 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet... 

Véritable révélateur de talents, depuis sa création en 2017, le Tchatcheur Comedy Club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. À chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats ! 

À savoir : toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle. Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J. 

Les plateaux du Tchatcheur comedy club sont déconseillés (mais pas interdits) aux enfants ! La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Premier Comedy Club de stand-up à Lille', '2026-06-26', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/spectacle/tchatcheur-comedy-club-338942');

-- 4. Avis de test
INSERT INTO avis (user_id, spectacle_id, message) VALUES
(8, 1, 'Excellent spectacle !'),
(8, 2, 'Très drôle, je recommande !');
-- Génération automatique des liens de billetterie dynamiques
UPDATE spectacle SET lien_spectacle = CONCAT('https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=338942&date=', DATE_FORMAT(date_spectacle, '%Y-%m-%d'), 'T', TIME_FORMAT(heure_spectacle, '%H:%i:%s'), '%3A00');
-- Spectacles Un ado peut en cacher un autre
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES
(285, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2025-09-21', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2025-09-21T17:00:00%3A00'),
(286, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2025-09-28', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2025-09-28T17:00:00%3A00'),
(287, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2025-10-05', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2025-10-05T17:00:00%3A00'),
(288, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2025-10-12', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2025-10-12T17:00:00%3A00'),
(289, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2025-10-19', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2025-10-19T17:00:00%3A00'),
(290, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2025-10-26', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2025-10-26T17:00:00%3A00'),
(291, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2025-11-02', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2025-11-02T17:00:00%3A00'),
(292, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2025-11-09', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2025-11-09T17:00:00%3A00'),
(293, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2025-11-16', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2025-11-16T17:00:00%3A00'),
(294, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2025-11-23', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2025-11-23T17:00:00%3A00'),
(295, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2025-11-30', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2025-11-30T17:00:00%3A00'),
(296, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2025-12-07', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2025-12-07T17:00:00%3A00'),
(297, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2025-12-14', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2025-12-14T17:00:00%3A00'),
(298, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2025-12-21', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2025-12-21T17:00:00%3A00'),
(299, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2025-12-28', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2025-12-28T17:00:00%3A00'),
(300, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-01-04', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-01-04T17:00:00%3A00'),
(301, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-01-11', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-01-11T17:00:00%3A00'),
(302, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-01-18', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-01-18T17:00:00%3A00'),
(303, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-01-25', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-01-25T17:00:00%3A00'),
(304, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-02-01', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-02-01T17:00:00%3A00'),
(305, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-02-08', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-02-08T17:00:00%3A00'),
(306, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-02-15', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-02-15T17:00:00%3A00'),
(307, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-02-22', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-02-22T17:00:00%3A00'),
(308, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-03-01', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-03-01T17:00:00%3A00'),
(309, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-03-08', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-03-08T17:00:00%3A00'),
(310, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-03-15', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-03-15T17:00:00%3A00'),
(311, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-03-22', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-03-22T17:00:00%3A00'),
(312, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-03-29', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-03-29T17:00:00%3A00'),
(313, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-04-05', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-04-05T17:00:00%3A00'),
(314, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-04-12', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-04-12T17:00:00%3A00'),
(315, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-04-19', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-04-19T17:00:00%3A00'),
(316, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-04-26', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-04-26T17:00:00%3A00'),
(317, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-05-03', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-05-03T17:00:00%3A00'),
(318, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-05-10', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-05-10T17:00:00%3A00'),
(319, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-05-17', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-05-17T17:00:00%3A00'),
(320, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-05-24', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-05-24T17:00:00%3A00'),
(321, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-05-31', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-05-31T17:00:00%3A00'),
(322, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-06-07', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-06-07T17:00:00%3A00'),
(323, 'Un ado peut en cacher un autre', 'Un Ado peut en cacher un autre.webp', 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.

Marina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...

Sauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait... 

Attention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.', 'Marina vit seule avec son fils Sandro qui entre dans l\'adolescence', '2026-06-14', '17:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetreduc.com/v2/purchasetunnel#/SeatsSelection?eventId=341464&date=2026-06-14T17:00:00%3A00');
-- Spectacles Chéri je t'ai trompé (et c'est pas ça le pire...)
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES
(324, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2025-09-21', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(325, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2025-09-28', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(326, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2025-10-05', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(327, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2025-10-12', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(328, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2025-10-19', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(329, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2025-10-26', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(330, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2025-11-02', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(331, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2025-11-09', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(332, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2025-11-16', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(333, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2025-11-23', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(334, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2025-11-30', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(335, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2025-12-07', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(336, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2025-12-14', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(337, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2025-12-21', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(338, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2025-12-28', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(339, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-01-04', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(340, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-01-11', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(341, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-01-18', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(342, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-01-25', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(343, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-02-01', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(344, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-02-08', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(345, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-02-15', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(346, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-02-22', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(347, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-03-01', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(348, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-03-08', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(349, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-03-15', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(350, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-03-22', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(351, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-03-29', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(352, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-04-05', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(353, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-04-12', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(354, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-04-19', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(355, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-04-26', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(356, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-05-03', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(357, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-05-10', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(358, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-05-17', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(359, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-05-24', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(360, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-05-31', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(361, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-06-07', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(362, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-06-14', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'),
(363, 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)', 'Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers… 

Éric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. 

Résultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables.

Le saviez-vous ?
Une comédie qui a déjà cumulé plus de 500 000 spectateurs. 
Chéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. 
Grand succès au Festival d\'Avignon.

A savoir : 
- Durée du spectacle : 75 minutes 
- A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.
- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.', 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie', '2026-06-21', '18:30:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2');

-- =====================================================
-- SPECTACLE KACI DANS LA CONNERIE HUMAINE
-- =====================================================
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (404, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2025-09-21', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (405, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2025-09-28', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (406, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2025-10-05', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (407, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2025-10-12', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (408, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2025-10-19', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (409, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2025-10-26', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (410, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2025-11-02', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (411, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2025-11-09', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (412, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2025-11-16', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (413, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2025-11-23', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (414, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2025-11-30', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (415, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2025-12-07', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (416, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2025-12-14', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (417, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2025-12-21', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (418, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2025-12-28', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (419, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-01-04', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (420, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-01-11', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (421, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-01-18', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (422, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-01-25', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (423, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-02-01', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (424, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-02-08', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (425, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-02-15', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (426, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-02-22', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (427, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-03-01', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (428, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-03-08', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (429, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-03-15', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (430, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-03-22', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (431, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-03-29', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (432, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-04-05', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (433, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-04-12', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (434, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-04-19', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (435, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-04-26', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (436, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-05-03', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (437, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-05-10', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (438, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-05-17', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (439, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-05-24', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (440, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-05-31', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (441, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-06-07', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (442, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-06-14', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');
INSERT INTO spectacle (id, title, img, description, pitch_description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (443, 'Kaci dans La connerie humaine', 'Kaci dans La connerie humaine.webp', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle. Avec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue. Renversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !', 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.', '2026-06-21', '20:00:00', 'L\'Espace comédie - Salle 1', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine');

-- =====================================================
-- Overrides des liens de billetterie (persistance post down -v)
-- =====================================================
-- Tchatcheur Comedy Club → Billetweb
UPDATE spectacle
SET lien_spectacle = 'https://www.billetweb.fr/tchatcheur-comedy-club1'
WHERE title = 'Tchatcheur Comedy Club';

-- Un ado peut en cacher un autre → Billetweb
UPDATE spectacle
SET lien_spectacle = 'https://www.billetweb.fr/un-ado-peut-en-cacher-un-autre18'
WHERE title = 'Un ado peut en cacher un autre';

-- Kaci dans La connerie humaine → corriger le nom de fichier image (sensible à la casse en prod)
UPDATE spectacle
SET img = 'Kaci dans la connerie humaine.webp'
WHERE title = 'Kaci dans La connerie humaine';

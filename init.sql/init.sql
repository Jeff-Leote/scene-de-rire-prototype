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
  date_spectacle DATE NOT NULL,
  heure_spectacle TIME NOT NULL,
  lieu VARCHAR(255) NOT NULL COMMENT "L'espace comédie",
  lien_spectacle VARCHAR(500) NULL COMMENT 'Lien vers la billetterie pour ce spectacle',
  category_id INT NULL
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
    category_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TEMPLATES PHOTOS ADDITIONNELLES PAR CATEGORIE
-- =====================================================
-- Table catégorie spectacle (référentiel)
CREATE TABLE category_spectacle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    label VARCHAR(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DONNEES PHOTOS ADDITIONNELLES
-- =====================================================
-- Catégories de base
INSERT INTO category_spectacle (id, code, label) VALUES
(1, '1', 'Tchatcheur Comedy Club'),
(2, '2', 'Un ado peut en cacher un autre'),
(3, '3', 'Chéri je t\'ai trompé'),
(4, '4', 'Kaci dans La connerie humaine');

-- Modèles par catégorie (utiliser category_id plutôt que spectacle_id)
-- ADO (exemple avec tes 3 images Ado ...)
INSERT INTO photo_addictionnel (image_path, category_id)
SELECT '/assets/img/photo_additionnel/Ado 234.webp', id FROM category_spectacle WHERE code = '2';
INSERT INTO photo_addictionnel (image_path, category_id)
SELECT '/assets/img/photo_additionnel/Ado 1356.webp', id FROM category_spectacle WHERE code = '2';
INSERT INTO photo_addictionnel (image_path, category_id)
SELECT '/assets/img/photo_additionnel/Ado 123.webp', id FROM category_spectacle WHERE code = '2';

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
ALTER TABLE spectacle ADD FOREIGN KEY (category_id) REFERENCES category_spectacle(id);
ALTER TABLE photo_addictionnel ADD FOREIGN KEY (category_id) REFERENCES category_spectacle(id) ON DELETE CASCADE;
CREATE INDEX idx_spectacle_category ON spectacle(category_id);

-- =====================================================
-- INDEX POUR OPTIMISATION
-- =====================================================


-- Index pour les spectacles
CREATE INDEX idx_spectacle_date ON spectacle(date_spectacle);
CREATE INDEX idx_spectacle_date_heure ON spectacle(date_spectacle, heure_spectacle);


-- Index pour les avis
CREATE INDEX idx_avis_user ON avis(user_id);
CREATE INDEX idx_avis_spectacle ON avis(spectacle_id);
-- Index photo_addictionnel par catégorie
CREATE INDEX idx_photo_addictionnel_category ON photo_addictionnel(category_id, id);
-- Plus de table template; index sur catégories
CREATE INDEX idx_category_spectacle_code ON category_spectacle(code);

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
INSERT INTO artiste (name, photo) VALUES
('Ilyes', 'TCC ILYES DDD.webp'),
('Paul', 'TCC paul mi.webp'),
('Edouard Delognon', 'edouard delognon photo.webp');

-- Artistes additionnels
INSERT INTO artiste (name, photo) VALUES
('Nordine Ganso', 'nordine ganso lphoto.webp'),
('Tom', 'TCC TOM BOUBOU.webp'),
('Mahé', 'mahe photo.webp');

-- Artistes supplémentaires (images présentes dans /assets/img/photo_artiste)
INSERT INTO artiste (name, photo) VALUES
('Fanny Ruwet', 'fanny-ruwet-affiche-concert-olympia-paris.webp'),
('Roman Doduik', 'roman doduik photo.webp'),
('Rodrigue', 'rodrigue photo.webp'),
('Alexandra Pizzagali', 'alexandra pizzagali photo.webp'),
('Julien Santini', 'julien santini photo.webp');

-- 3. Spectacles de test

-- Générateur de dates (0..999 jours) sans CTE, compatible MySQL/MariaDB plus anciens
-- u, t, h forment un compteur de 0 à 999 ; on limite à 365 jours
INSERT INTO spectacle (title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle, category_id)
SELECT 'Tchatcheur comedy club', '/assets/img/spectacles/Tchatcheur comedy club.webp',
  'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l''humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet...\n\nVéritable révélateur de talents, depuis sa création en 2017, le Tchatcheur comedy club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l''humour actuelles qui sont venues fouler notre scène. A chaque séance plusieurs humoristes se succèdent : certains sont connus, d''autres n''attendent qu''à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats !.\n\nIls ont déjà joué au Tchatcheur comedy club : Paul Mirabel, Inès Reg, Ilyes Djadel, Fanny Ruwet, David Voinson, Lilia Benchabane, Nordine Ganso, Tareek, Amine Radi, Mahé etc. .\n\nÀ savoir :\n- Le billet comporte une consommation incluse. \n- Durée du spectcale : 70 minutes. \n- Toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle.\n- Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J.\n- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.\n- Vous avez la possibilité de consommer des planches apéritives sur place, pendant, avant ou après le spectacle. ',
  DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY) AS d,
  '20:00:00', 'L''espace Comédie', 'https://www.billetweb.fr/tchatcheur-comedy-club1', cat.id
FROM (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) u
CROSS JOIN (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t
CROSS JOIN (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) h
JOIN category_spectacle cat ON cat.code = '1'
WHERE DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY) <= '2026-06-28'
  AND DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY)) IN (2,3,4,6);

INSERT INTO spectacle (title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle, category_id)
SELECT 'Tchatcheur comedy club', '/assets/img/spectacles/Tchatcheur comedy club.webp',
  'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l''humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet...\n\nVéritable révélateur de talents, depuis sa création en 2017, le Tchatcheur comedy club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l''humour actuelles qui sont venues fouler notre scène. A chaque séance plusieurs humoristes se succèdent : certains sont connus, d''autres n''attendent qu''à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats !.\n\nIls ont déjà joué au Tchatcheur comedy club : Paul Mirabel, Inès Reg, Ilyes Djadel, Fanny Ruwet, David Voinson, Lilia Benchabane, Nordine Ganso, Tareek, Amine Radi, Mahé etc. .\n\nÀ savoir :\n- Le billet comporte une consommation incluse. \n- Durée du spectcale : 70 minutes. \n- Toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle.\n- Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J.\n- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.\n- Vous avez la possibilité de consommer des planches apéritives sur place, pendant, avant ou après le spectacle. ',
  DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY) AS d,
  '17:30:00', 'L''espace Comédie', 'https://www.billetweb.fr/tchatcheur-comedy-club1', cat.id
FROM (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) u
CROSS JOIN (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t
CROSS JOIN (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) h
JOIN category_spectacle cat ON cat.code = '1'
WHERE DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY) <= '2026-06-28'
  AND DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY)) = 7;

-- Kaci dans La connerie humaine — dimanches 20:00 jusqu'au 28/06/2026
INSERT INTO spectacle (title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle, category_id)
SELECT 'Kaci dans La connerie humaine', '/assets/img/spectacles/Kaci dans la connerie humaine.webp',
  'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.\nAvec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n''est pas très moral de rire... À première vue.\n\nRenversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !\n\nLe Saviez-vous ?\nOn a pu apercevoir Kaci en première partie d''Ahmed Sylla. Kaci est actuellement en tournée dans toute la France et chaque année au festival d''Avignon.\n\nA savoir :\n.  Durée du spectcale : 70 minutes\n . A l''Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.\n\n',
  DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY) AS d,
  '20:00:00', 'L''espace Comédie', 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine', cat.id
FROM (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) u
CROSS JOIN (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t
CROSS JOIN (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) h
JOIN category_spectacle cat ON cat.code = '4'
WHERE DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY) <= '2026-06-28'
  AND DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY)) = 1;

-- Un Ado peut en cacher un autre — dimanches 17:00 sur 12 mois
INSERT INTO spectacle (title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle, category_id)
SELECT 'Un Ado peut en cacher un autre', '/assets/img/spectacles/Un Ado peut en cacher un autre.webp',
  'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l''adolescence.\nMarina a du mal avec ce gamin. Tout ce qu''il regarde, tout ce qu''il écoute, tout ce qui l''intéresse lui semble incohérent et sans intérêt. Les ados n''étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...\n\nSauf qu''un jour Sandro est projeté de l''autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d''être si raisonnable qu''elle le disait...\n\nAttention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.\n\nA savoir :\n . Durée du spectcale : 70 minutes\n . A l''Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.\n . La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.\n\n',
  DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY) AS d,
  '17:00:00', 'L''espace Comédie', 'https://www.billetweb.fr/un-ado-peut-en-cacher-un-autre18', cat.id
FROM (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) u
CROSS JOIN (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t
CROSS JOIN (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) h
JOIN category_spectacle cat ON cat.code = '2'
WHERE DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY) <= '2026-06-28'
  AND DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY)) = 1;

-- Chéri je t'ai trompé (et c'est pas ça le pire...) — dimanches 18:30 sur 12 mois
INSERT INTO spectacle (title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle, category_id)
SELECT 'Chéri je t''ai trompé (et c''est pas ça le pire...)', '/assets/img/spectacles/Chéri je t''ai trompé (et c''est pas ça le pire...).webp',
  'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers...\nÉric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu''il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. \n\nRésultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables. \n\nLe saviez-vous ?\nUne comédie qui a déjà cumulé plus de 500 000 spectateurs. \nChéri je t''ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. \nGrand succès au Festival d''Avignon.\n\nA savoir : \n. Durée du spectcale : 75 minutes \n. A l''Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.\n. La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.',
  DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY) AS d,
  '18:30:00', 'L''espace Comédie', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2', cat.id
FROM (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) u
CROSS JOIN (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t
CROSS JOIN (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) h
JOIN category_spectacle cat ON cat.code = '3'
WHERE DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY) <= '2026-06-28'
  AND DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY)) = 1;

INSERT INTO spectacle (title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle, category_id)
SELECT 'Tchatcheur comedy club', '/assets/img/spectacles/Tchatcheur comedy club.webp',
  'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l''humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet...\n\nVéritable révélateur de talents, depuis sa création en 2017, le Tchatcheur comedy club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l''humour actuelles qui sont venues fouler notre scène. A chaque séance plusieurs humoristes se succèdent : certains sont connus, d''autres n''attendent qu''à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats !.\n\nIls ont déjà joué au Tchatcheur comedy club : Paul Mirabel, Inès Reg, Ilyes Djadel, Fanny Ruwet, David Voinson, Lilia Benchabane, Nordine Ganso, Tareek, Amine Radi, Mahé etc. .\n\nÀ savoir :\n- Le billet comporte une consommation incluse. \n- Durée du spectcale : 70 minutes. \n- Toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle.\n- Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J.\n- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.\n- Vous avez la possibilité de consommer des planches apéritives sur place, pendant, avant ou après le spectacle. ',
  DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY) AS d,
  '19:00:00', 'L''espace Comédie', 'https://www.billetweb.fr/tchatcheur-comedy-club1', cat.id
FROM (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) u
CROSS JOIN (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t
CROSS JOIN (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) h
JOIN category_spectacle cat ON cat.code = '1'
WHERE DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY) <= '2026-06-28'
  AND DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY)) = 7;

INSERT INTO spectacle (title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle, category_id)
SELECT 'Tchatcheur comedy club', '/assets/img/spectacles/Tchatcheur comedy club.webp',
  'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l''humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet...\n\nVéritable révélateur de talents, depuis sa création en 2017, le Tchatcheur comedy club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l''humour actuelles qui sont venues fouler notre scène. A chaque séance plusieurs humoristes se succèdent : certains sont connus, d''autres n''attendent qu''à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats !.\n\nIls ont déjà joué au Tchatcheur comedy club : Paul Mirabel, Inès Reg, Ilyes Djadel, Fanny Ruwet, David Voinson, Lilia Benchabane, Nordine Ganso, Tareek, Amine Radi, Mahé etc. .\n\nÀ savoir :\n- Le billet comporte une consommation incluse. \n- Durée du spectcale : 70 minutes. \n- Toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle.\n- Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J.\n- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.\n- Vous avez la possibilité de consommer des planches apéritives sur place, pendant, avant ou après le spectacle. ',
  DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY) AS d,
  '20:30:00', 'L''espace Comédie', 'https://www.billetweb.fr/tchatcheur-comedy-club1', cat.id
FROM (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) u
CROSS JOIN (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t
CROSS JOIN (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) h
JOIN category_spectacle cat ON cat.code = '1'
WHERE DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY) <= '2026-06-28'
  AND DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL (u.n + t.n*10 + h.n*100) DAY)) = 7;

-- Spectacles exceptionnels du 31 décembre 2025
-- Un Ado peut en cacher un autre - 17:00
INSERT INTO spectacle (title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle, category_id)
SELECT 'Un Ado peut en cacher un autre', '/assets/img/spectacles/Un Ado peut en cacher un autre.webp',
  'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l''adolescence.\nMarina a du mal avec ce gamin. Tout ce qu''il regarde, tout ce qu''il écoute, tout ce qui l''intéresse lui semble incohérent et sans intérêt. Les ados n''étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...\n\nSauf qu''un jour Sandro est projeté de l''autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d''être si raisonnable qu''elle le disait...\n\nAttention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.\n\nA savoir :\n . Durée du spectcale : 70 minutes\n . A l''Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.\n . La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.\n\n',
  '2025-12-31', '17:00:00', 'L''espace Comédie', 'https://www.billetweb.fr/un-ado-peut-en-cacher-un-autre18', cat.id
FROM category_spectacle cat WHERE cat.code = '2';

-- Chéri je t'ai trompé - 18:30
INSERT INTO spectacle (title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle, category_id)
SELECT 'Chéri je t''ai trompé (et c''est pas ça le pire...)', '/assets/img/spectacles/Chéri je t''ai trompé (et c''est pas ça le pire...).webp',
  'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers...\nÉric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu''il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. \n\nRésultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables. \n\nLe saviez-vous ?\nUne comédie qui a déjà cumulé plus de 500 000 spectateurs. \nChéri je t''ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. \nGrand succès au Festival d''Avignon.\n\nA savoir : \n. Durée du spectcale : 75 minutes \n. A l''Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.\n. La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.',
  '2025-12-31', '18:30:00', 'L''espace Comédie', 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2', cat.id
FROM category_spectacle cat WHERE cat.code = '3';

-- 8. Images du lieu de test
INSERT INTO lieu (image_path, is_main) VALUES
('bar.webp', TRUE),
('E3390DB1-7D8B-4C0B-859F-CF34EFA89A25.webp', FALSE),
('BAE972EF-73BA-4FFF-A55C-ED917418E5FD.webp', FALSE),
('32A88A8E-8304-4202-A44E-95EE5AB48DA2.webp', FALSE),
('22B2A7EB-CFAC-4987-BA1D-3F09E6BDE45A.webp', FALSE),
('3E8A2276-E265-441F-B5D0-090358DE02D4.webp', FALSE),
('4B31278E-7382-46E2-9C8B-B7A677208F00.webp', FALSE);



-- 10. Paramètres par défaut
INSERT INTO settings (`key`, `value`) VALUES
('contact_recipient_email', 'contact@espacecomedia.fr')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);


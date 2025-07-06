CREATE DATABASE IF NOT EXISTS espace_comedie;
USE espace_comedie;

CREATE TABLE user (
  id int PRIMARY KEY AUTO_INCREMENT,
  civility varchar(100) NOT NULL,
  nom varchar(100) NOT NULL,
  prenom varchar(100) NOT NULL,
  email varchar(100) UNIQUE NOT NULL,
  password varchar(255) NOT NULL,
  dateNaissance date NOT NULL,
  role varchar(20) DEFAULT 'utilisateur' COMMENT 'admin | utilisateur',
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE artiste (
  id int PRIMARY KEY AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  biographie text NOT NULL,
  photo varchar(255) NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  is_featured boolean DEFAULT FALSE,
  photo_featured varchar(255) NOT NULL
);

CREATE TABLE spectacle (
  id int PRIMARY KEY AUTO_INCREMENT,
  title varchar(255) NOT NULL,
  img varchar(999) NOT NULL,
  description text NOT NULL,
  date_spectacle date NOT NULL,
  heure_spectacle time NOT NULL,
  prix int NOT NULL,
  lieu varchar(255) COMMENT "L'espace comédie" NOT NULL,
  artiste_id int NOT NULL
);

CREATE TABLE avis (
  id int PRIMARY KEY AUTO_INCREMENT,
  user_id int NOT NULL,
  spectacle_id int NOT NULL,
  message text NOT NULL,
  date timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reservation (
  id int PRIMARY KEY AUTO_INCREMENT,
  user_id int NOT NULL,
  spectacle_id int NOT NULL,
  nb_places int NOT NULL,
  date timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE paiement (
  id int PRIMARY KEY AUTO_INCREMENT,
  montant int NOT NULL,
  statut boolean NOT NULL,
  session_id varchar(255),
  date timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE paiement_reservation (
  paiement_id INT NOT NULL,
  reservation_id INT NOT NULL,
  montant INT NOT NULL,
  PRIMARY KEY (paiement_id, reservation_id),
  FOREIGN KEY (paiement_id) REFERENCES paiement(id),
  FOREIGN KEY (reservation_id) REFERENCES reservation(id)
);

-- Ajout des clés étrangères
ALTER TABLE avis ADD FOREIGN KEY (user_id) REFERENCES user (id);
ALTER TABLE avis ADD FOREIGN KEY (spectacle_id) REFERENCES spectacle (id);
ALTER TABLE spectacle ADD FOREIGN KEY (artiste_id) REFERENCES artiste (id);
ALTER TABLE reservation ADD FOREIGN KEY (user_id) REFERENCES user (id);
ALTER TABLE reservation ADD FOREIGN KEY (spectacle_id) REFERENCES spectacle (id);

-- Insertions dans l'ordre des dépendances (clés étrangères)

-- 1. Création d'un utilisateur de test
-- Mot de passe: "password123" (le hash correspond à ce mot de passe)
INSERT INTO user (id, civility, nom, prenom, email, password, dateNaissance, role) VALUES
(1, 'M.', 'Test', 'Jean', 'jean.test@example.com', '$2a$10$k.M7bXp9jJ8G5Qz.cO9dZ.D9uWwYqO/PzM4jG1xRn2qO7m.m.z0qC', '1990-01-01', 'utilisateur');

-- 2. Création d'un artiste de test
INSERT INTO artiste (id, name, biographie, photo, is_featured, photo_featured) VALUES
(1, 'Gad Elmaleh', 'Un humoriste célèbre.', 'pikach_artiste.webp', TRUE, 'pikach_feature.webp');

-- 3. Création de spectacles de test (dépendent de artiste)
INSERT INTO spectacle (id, title, img, description, date_spectacle, heure_spectacle, prix, lieu, artiste_id) VALUES
(1, 'D''ailleurs', 'spectacles_pikach.webp', 'Le nouveau spectacle de Gad Elmaleh.', '2025-12-25', '20:30:00', 45, 'L''espace comedie', 1),
(2, 'L''autre, c''est moi', 'spectacles_pikach.webp', 'Un classique de Gad Elmaleh.', '2025-11-15', '21:00:00', 40, 'L''espace comedie', 1);

-- 4. Création d'avis de test (dépendent de user et spectacle)
INSERT INTO avis (user_id, spectacle_id, message) VALUES
(1, 1, 'Excellent spectacle !'),
(1, 2, 'Très drôle, je recommande !');

-- 5. Création de réservations de test (dépendent de user et spectacle)
INSERT INTO reservation (user_id, spectacle_id, nb_places) VALUES
(1, 1, 2),
(1, 2, 1);

-- 6. Création de paiements de test
INSERT INTO paiement (montant, statut) VALUES
(90, TRUE),  -- 2 places à 45€
(40, TRUE);  -- 1 place à 40€

-- 7. Liaison paiements-réservations
INSERT INTO paiement_reservation (paiement_id, reservation_id, montant) VALUES
(1, 1, 90),
(2, 2, 40);
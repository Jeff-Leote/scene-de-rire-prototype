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

CREATE TABLE artiste (
  id int PRIMARY KEY AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  biographie text NOT NULL,
  photo varchar(255) NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  is_featured boolean DEFAULT FALSE,
  photo_featured varchar(255) NOT NULL
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
  reservation_id int NOT NULL,
  montant int NOT NULL,
  statut boolean NOT NULL,
  date timestamp DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE avis ADD FOREIGN KEY (user_id) REFERENCES user (id);

ALTER TABLE avis ADD FOREIGN KEY (spectacle_id) REFERENCES spectacle (id);

ALTER TABLE spectacle ADD FOREIGN KEY (artiste_id) REFERENCES artiste (id);

ALTER TABLE paiement ADD FOREIGN KEY (reservation_id) REFERENCES reservation (id);

ALTER TABLE reservation ADD FOREIGN KEY (user_id) REFERENCES user (id);

ALTER TABLE reservation ADD FOREIGN KEY (spectacle_id) REFERENCES spectacle (id);


-- Création d'un utilisateur de test
-- Mot de passe: "password123" (le hash correspond à ce mot de passe)
INSERT INTO user (id, civility, nom, prenom, email, password, dateNaissance, role) VALUES
(1, 'M.', 'Test', 'Jean', 'jean.test@example.com', '$2a$10$k.M7bXp9jJ8G5Qz.cO9dZ.D9uWwYqO/PzM4jG1xRn2qO7m.m.z0qC', '1990-01-01', 'utilisateur');

-- Création d'un artiste de test
INSERT INTO artiste (id, name, biographie, photo, is_featured, photo_featured) VALUES
(1, 'Gad Elmaleh', 'Un humoriste célèbre.', '/img/artistes/gad.jpg', TRUE, '/img/featured/gad.jpg');

-- Création de spectacles de test
INSERT INTO spectacle (id, title, img, description, date_spectacle, heure_spectacle, prix, lieu, artiste_id) VALUES
(1, 'D''ailleurs', '/img/spectacles/dailleurs.jpg', 'Le nouveau spectacle de Gad Elmaleh.', '2024-12-25', '20:30:00', 45, 'L''espace comedie', 1);

INSERT INTO spectacle (id, title, img, description, date_spectacle, heure_spectacle, prix, lieu, artiste_id) VALUES
(2, 'L''autre, c''est moi', '/img/spectacles/lautre.jpg', 'Un classique de Gad Elmaleh.', '2024-11-15', '21:00:00', 40, 'L''espace comedie', 1);
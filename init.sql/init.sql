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
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
  is_featured boolean DEFAULT FALSE;
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

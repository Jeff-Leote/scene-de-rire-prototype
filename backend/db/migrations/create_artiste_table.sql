CREATE TABLE IF NOT EXISTS artiste (
  id int PRIMARY KEY AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  photo varchar(999),
  description text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
); 
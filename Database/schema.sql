CREATE DATABASE naturadex;
USE naturadex;

CREATE TABLE parks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6)
);

CREATE TABLE species (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    type ENUM('flora','fauna','mineral'),
    description TEXT,
    park_id INT,
    FOREIGN KEY (park_id) REFERENCES parks(id)
);

CREATE TABLE observations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    species_id INT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (species_id) REFERENCES species(id)
);
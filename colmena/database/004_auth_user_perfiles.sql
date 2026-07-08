-- ======================================================
-- 004_auth_user_perfiles.sql
-- Relaciona Administrador y Apicultor con auth_user
-- y agrega FotoPerfil
-- ======================================================

USE dbmicolmena;

-- APICULTOR
ALTER TABLE Apicultor
ADD COLUMN user_id INT UNIQUE NULL AFTER Id_Apicultor,
ADD COLUMN FotoPerfil VARCHAR(255) NULL AFTER ExperienciaAnios;

ALTER TABLE Apicultor
ADD CONSTRAINT fk_apicultor_user
FOREIGN KEY (user_id)
REFERENCES auth_user(id);

-- ADMINISTRADOR
ALTER TABLE Administrador
ADD COLUMN user_id INT UNIQUE NULL AFTER Id_Administrador,
ADD COLUMN FotoPerfil VARCHAR(255) NULL AFTER NivelAcceso;

ALTER TABLE Administrador
ADD CONSTRAINT fk_administrador_user
FOREIGN KEY (user_id)
REFERENCES auth_user(id);

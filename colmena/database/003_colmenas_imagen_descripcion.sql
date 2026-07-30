-- ======================================================
-- 003_colmenas_imagen_descripcion.sql
-- Agrega descripción e imagen a Colmena
-- ======================================================

USE dbmicolmena;

ALTER TABLE Colmena
ADD COLUMN Descripcion TEXT NULL,
ADD COLUMN Imagen VARCHAR(255) NULL;

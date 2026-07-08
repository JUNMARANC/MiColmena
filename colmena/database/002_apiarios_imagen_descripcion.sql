-- ======================================================
-- 002_apiarios_imagen_descripcion.sql
-- Agrega descripción e imagen a Apiario
-- ======================================================

USE dbmicolmena;

ALTER TABLE Apiario
ADD COLUMN Descripcion TEXT NULL,
ADD COLUMN Imagen VARCHAR(255) NULL;

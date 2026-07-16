-- ======================================================
-- 005_eliminar_nombre_email_perfiles.sql
-- Elimina Nombre y Email de Administrador y Apicultor
-- porque ahora esos datos vienen desde auth_user
-- ======================================================

USE dbmicolmena;

ALTER TABLE Apicultor
DROP COLUMN Nombre,
DROP COLUMN Email;

ALTER TABLE Administrador
DROP COLUMN Nombre,
DROP COLUMN Email;

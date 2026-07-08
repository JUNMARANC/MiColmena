-- ======================================================
-- 006_mantenimientos_apiario_colmena.sql
-- Permite que un mantenimiento sea para todo un apiario
-- o para una colmena específica
-- ======================================================

USE dbmicolmena;

ALTER TABLE Mantenimiento
MODIFY Id_Colmena INT NULL;

ALTER TABLE Mantenimiento
ADD COLUMN Id_Apiario INT NULL AFTER Id_Colmena;

ALTER TABLE Mantenimiento
ADD COLUMN EntidadMantenimiento VARCHAR(50) NULL AFTER Id_Apiario;

ALTER TABLE Mantenimiento
ADD CONSTRAINT fk_mantenimiento_apiario
FOREIGN KEY (Id_Apiario)
REFERENCES Apiario(Id_Apiario);

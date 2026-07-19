USE dbmicolmena;

-- Permitir incidencias que no pertenezcan obligatoriamente a una colmena
ALTER TABLE incidencia
MODIFY COLUMN Id_Colmena INT NULL;

-- Agregar relación con apicultor
ALTER TABLE incidencia
ADD COLUMN Id_Apicultor INT NULL AFTER Id_Incidencia;

-- Agregar relación con apiario
ALTER TABLE incidencia
ADD COLUMN Id_Apiario INT NULL AFTER Id_Apicultor;

-- Indica si la incidencia es de un apicultor, apiario o colmena
ALTER TABLE incidencia
ADD COLUMN EntidadIncidencia VARCHAR(30) NOT NULL
DEFAULT 'Colmena'
AFTER Id_Colmena;

-- Evidencia fotográfica
ALTER TABLE incidencia
ADD COLUMN Imagen VARCHAR(255) NULL
AFTER Descripcion;

-- Persona que atenderá o resolverá la incidencia
ALTER TABLE incidencia
ADD COLUMN Responsable VARCHAR(150) NULL
AFTER Imagen;

-- Llave foránea hacia apicultor
ALTER TABLE incidencia
ADD CONSTRAINT fk_incidencia_apicultor
FOREIGN KEY (Id_Apicultor)
REFERENCES apicultor(Id_Apicultor)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Llave foránea hacia apiario
ALTER TABLE incidencia
ADD CONSTRAINT fk_incidencia_apiario
FOREIGN KEY (Id_Apiario)
REFERENCES apiario(Id_Apiario)
ON DELETE SET NULL
ON UPDATE CASCADE;
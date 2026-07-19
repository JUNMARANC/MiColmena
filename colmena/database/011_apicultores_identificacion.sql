USE dbmicolmena;

ALTER TABLE apicultor
ADD COLUMN Identificacion VARCHAR(30) NULL
AFTER Id_Rol;

ALTER TABLE apicultor
ADD CONSTRAINT uq_apicultor_identificacion
UNIQUE (Identificacion);
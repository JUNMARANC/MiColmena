-- ======================================================
-- 007_roles_iniciales.sql
-- Roles iniciales del sistema
-- ======================================================

USE dbmicolmena;

INSERT INTO Rol (NombreRol, Descripcion, NivelAcceso, Permisos, EstadoActivo)
VALUES ('Administrador', 'Administrador General del sistema', 'TOTAL', 'TODOS', TRUE);

INSERT INTO Rol (NombreRol, Descripcion, NivelAcceso, Permisos, EstadoActivo)
VALUES ('Apicultor', 'Usuario encargado de apiarios y colmenas', 'LIMITADO', 'OPERACION', TRUE);

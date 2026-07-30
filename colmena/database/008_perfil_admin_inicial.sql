-- ======================================================
-- 008_perfil_admin_inicial.sql
-- Crea el perfil Administrador para un usuario existente
-- en auth_user.
-- IMPORTANTE: primero crea el superusuario o usuario Django.
-- ======================================================

USE dbmicolmena;

-- Revisa primero el id real del usuario:
-- SELECT id, username, first_name, last_name, email, is_staff, is_superuser FROM auth_user;

INSERT INTO Administrador
(
    user_id,
    Id_Rol,
    Celular,
    FechaRegistro,
    NivelAcceso,
    FotoPerfil
)
VALUES
(
    1,
    1,
    '3200000000',
    CURDATE(),
    'Administrador General',
    NULL
);

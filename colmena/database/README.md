# Scripts SQL - Mi Colmena

Ejecuta estos archivos en orden cuando necesites replicar la estructura de la base de datos en otro computador.

## Orden recomendado

1. `001_creacion_bd_base.sql`
2. `002_apiarios_imagen_descripcion.sql`
3. `003_colmenas_imagen_descripcion.sql`
4. `004_auth_user_perfiles.sql`
5. `005_eliminar_nombre_email_perfiles.sql`
6. `006_mantenimientos_apiario_colmena.sql`
7. `007_roles_iniciales.sql`
8. Crear usuario Django con `py manage.py createsuperuser`
9. `008_perfil_admin_inicial.sql`
10. `009_datos_prueba.sql` solo si necesitas datos de prueba.

## Importante

- Los scripts 004 y 008 dependen de que existan las tablas de Django, especialmente `auth_user`.
- Para que exista `auth_user`, ejecuta en Django:

```bash
py manage.py migrate
```

- Si una columna ya existe, MySQL puede mostrar errores como `Duplicate column name`. En ese caso, verifica con:

```sql
DESCRIBE nombre_tabla;
```

- Si una llave foránea ya existe, revisa con:

```sql
SHOW CREATE TABLE nombre_tabla;
```

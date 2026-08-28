"""
Signals del módulo panel_admin.

Actualmente este archivo no contiene señales activas.

La lógica relacionada con la seguridad del inicio de sesión,
incluyendo intentos fallidos, bloqueo temporal y control de acceso,
se administra desde la aplicación `usuarios`.

Archivos principales:

    usuarios/models.py
        - ControlIntentosLogin
        - SesionUsuario
        - HistorialAcceso

    usuarios/services.py
        - login_esta_bloqueado()
        - registrar_intento_login_fallido()
        - reiniciar_intentos_login()
        - registrar_historial_acceso()

    usuarios/views.py
        - login_view()
        - logout_view()

No se utiliza user_login_failed ni user_logged_in en este archivo
para evitar registrar o contar dos veces los intentos de inicio
de sesión.
"""
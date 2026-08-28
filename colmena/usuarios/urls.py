from django.urls import path
from usuarios.views import (
    login_view,
    logout_view,

    cerrar_sesion_remota,
    cerrar_otras_sesiones,

    iniciar_activacion_2fa,
    verificar_activacion_2fa,

    iniciar_desactivacion_2fa,
    verificar_desactivacion_2fa,
    verificar_login_2fa,
    reenviar_login_2fa,
    solicitar_recuperacion_password,
    recuperar_password,

)

urlpatterns = [

    path("login/", login_view, name="login"),
    path("logout/",logout_view,name="logout"),
    path("sesiones/<int:id_sesion>/cerrar/", cerrar_sesion_remota ,name="cerrar_sesion_remota"),
    path("sesiones/cerrar-otras/", cerrar_otras_sesiones , name="cerrar_otras_sesiones"),
    path("2fa/activar/", iniciar_activacion_2fa ,name="iniciar_activacion_2fa"),
    path("2fa/activar/verificar/", verificar_activacion_2fa ,name="verificar_activacion_2fa"),
    path("2fa/desactivar/", iniciar_desactivacion_2fa ,name="iniciar_desactivacion_2fa"),
    path("2fa/desactivar/verificar/", verificar_desactivacion_2fa ,name="verificar_desactivacion_2fa"),
    path("2fa/login/verificar/", verificar_login_2fa ,name="verificar_login_2fa"),
    path("2fa/login/reenviar/", reenviar_login_2fa, name="reenviar_login_2fa"),
    path("recuperar-password/", solicitar_recuperacion_password,name="solicitar_recuperacion_password"),
    path("recuperar-password/<str:token>/",recuperar_password,name="recuperar_password"),
    
]
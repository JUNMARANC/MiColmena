from django.urls import path

from usuarios.views import (
    login_view,
    logout_view,
    cerrar_sesion_remota,
    cerrar_otras_sesiones,
)


urlpatterns = [

    path("login/", login_view, name="login"),
    path("logout/",logout_view,name="logout"),
    path("sesiones/<int:id_sesion>/cerrar/",cerrar_sesion_remota,name="cerrar_sesion_remota"),
    path("sesiones/cerrar-otras/", cerrar_otras_sesiones, name="cerrar_otras_sesiones"),
]
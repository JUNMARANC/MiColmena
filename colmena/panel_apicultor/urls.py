from django.urls import path

from panel_apicultor.views import (
    dashboard_apicultor,
    mis_apiarios,
    detalle_apiario_apicultor,
    mis_colmenas,
    registrar_mantenimiento_apicultor,
    reportar_incidencia_apicultor,
    mantenimientos_apicultor,
    completar_mantenimiento_apicultor,
    actualizar_observacion_mantenimiento_apicultor,
    incidencias_apicultor,
)



urlpatterns = [

    # ========================================================
    # DASHBOARD
    # ========================================================

    path("",dashboard_apicultor,name="dashboard_apicultor"),

    # ========================================================
    # MIS APIARIOS
    # ========================================================

    path("apiarios/",mis_apiarios,name="apiarios_apicultor"),


    # ========================================================
    # DETALLE APIARIO
    # ========================================================

    path("apiarios/<int:id_apiario>/",detalle_apiario_apicultor,name="detalle_apiario_apicultor"),

    # ========================================================
    # MIS COLMENAS
    # ========================================================

    path("colmenas/",mis_colmenas,name="colmenas_apicultor"),
    path("incidencias/reportar/colmena/<int:id_colmena>/",reportar_incidencia_apicultor,name="reportar_incidencia_apicultor"),

    # ============================================================
    # MANTENIMIENTOS
    # ============================================================

    path("mantenimientos/",mantenimientos_apicultor,name="mantenimientos_apicultor"),
    path("mantenimientos/registrar/colmena/<int:id_colmena>/",registrar_mantenimiento_apicultor,name="registrar_mantenimiento_apicultor"),
    path("mantenimientos/<int:id_mantenimiento>/completar/",completar_mantenimiento_apicultor,name="completar_mantenimiento_apicultor"),
    path("mantenimientos/<int:id_mantenimiento>/observacion/",actualizar_observacion_mantenimiento_apicultor,name="actualizar_observacion_mantenimiento_apicultor"),

    # ============================================================
    # INCIDENCIAS
    # ============================================================

    path("incidencias/",incidencias_apicultor,name="incidencias_apicultor"),
    path("incidencias/reportar/colmena/<int:id_colmena>/",reportar_incidencia_apicultor,name="reportar_incidencia_apicultor"),
]
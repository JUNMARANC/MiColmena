from django.urls import path

from panel_apicultor.views import (
    dashboard_apicultor,

    # Apiarios
    mis_apiarios,
    detalle_apiario_apicultor,
    editar_apiario_apicultor,

    # Colmenas
    mis_colmenas,
    editar_colmena_apicultor,

    # Mantenimientos
    registrar_mantenimiento_apicultor,
    mantenimientos_apicultor,
    crear_mantenimiento_apicultor,
    editar_mantenimiento_apicultor,
    completar_mantenimiento_apicultor,
    actualizar_observacion_mantenimiento_apicultor,

    # Incidencias
    incidencias_apicultor,
    crear_incidencia_apicultor,
    editar_incidencia_apicultor,
    reportar_incidencia_apicultor,

    # Agenda
    agenda_apicultor,
    crear_evento_apicultor,
    actualizar_estado_evento_apicultor,


    #perfil
    perfil_apicultor,
    cambiar_password_apicultor,
)


urlpatterns = [

    # ============================================================
    # DASHBOARD
    # ============================================================

    path(
        "",
        dashboard_apicultor,
        name="dashboard_apicultor",
    ),


    # ============================================================
    # MIS APIARIOS
    # ============================================================

    path(
        "apiarios/",
        mis_apiarios,
        name="apiarios_apicultor",
    ),


    # ============================================================
    # GESTIONAR APIARIO
    # ============================================================

    path(
        "apiarios/<int:id_apiario>/editar/",
        editar_apiario_apicultor,
        name="editar_apiario_apicultor",
    ),


    # ============================================================
    # DETALLE APIARIO
    # ============================================================

    path(
        "apiarios/<int:id_apiario>/",
        detalle_apiario_apicultor,
        name="detalle_apiario_apicultor",
    ),


    # ============================================================
    # MIS COLMENAS
    # ============================================================

    path(
        "colmenas/",
        mis_colmenas,
        name="colmenas_apicultor",
    ),


    # ============================================================
    # GESTIONAR COLMENA
    # ============================================================

    path(
        "colmenas/<int:id_colmena>/editar/",
        editar_colmena_apicultor,
        name="editar_colmena_apicultor",
    ),


    # ============================================================
    # MANTENIMIENTO RÁPIDO DESDE UNA COLMENA
    # ============================================================

    path(
        "colmenas/<int:id_colmena>/mantenimiento/",
        registrar_mantenimiento_apicultor,
        name="registrar_mantenimiento_apicultor",
    ),


    # ============================================================
    # MANTENIMIENTOS
    # ============================================================

    path(
        "mantenimientos/",
        mantenimientos_apicultor,
        name="mantenimientos_apicultor",
    ),

    path(
        "mantenimientos/crear/",
        crear_mantenimiento_apicultor,
        name="crear_mantenimiento_apicultor",
    ),

    path(
        "mantenimientos/<int:id_mantenimiento>/editar/",
        editar_mantenimiento_apicultor,
        name="editar_mantenimiento_apicultor",
    ),

    path(
        "mantenimientos/<int:id_mantenimiento>/completar/",
        completar_mantenimiento_apicultor,
        name="completar_mantenimiento_apicultor",
    ),

    path(
        "mantenimientos/<int:id_mantenimiento>/observacion/",
        actualizar_observacion_mantenimiento_apicultor,
        name="actualizar_observacion_mantenimiento_apicultor",
    ),


    # ============================================================
    # INCIDENCIAS
    # ============================================================

    path(
        "incidencias/",
        incidencias_apicultor,
        name="incidencias_apicultor",
    ),

    path(
        "incidencias/crear/",
        crear_incidencia_apicultor,
        name="crear_incidencia_apicultor",
    ),

    path(
        "incidencias/<int:id_incidencia>/editar/",
        editar_incidencia_apicultor,
        name="editar_incidencia_apicultor",
    ),


    # ============================================================
    # ACCESO RÁPIDO A INCIDENCIA DESDE UNA COLMENA
    # ============================================================

    path(
        "incidencias/reportar/colmena/<int:id_colmena>/",
        reportar_incidencia_apicultor,
        name="reportar_incidencia_apicultor",
    ),


    # ============================================================
    # AGENDA
    # ============================================================

    path(
        "agenda/",
        agenda_apicultor,
        name="agenda_apicultor",
    ),

    path(
        "agenda/crear/",
        crear_evento_apicultor,
        name="crear_evento_apicultor",
    ),

    path(
        "agenda/evento/<int:id_evento>/estado/",
        actualizar_estado_evento_apicultor,
        name="actualizar_estado_evento_apicultor",
    ),

    # ============================================================
    # PERFIL
    # ============================================================

    path("perfil/",perfil_apicultor,name="perfil_apicultor",),
    path("perfil/cambiar-password/",cambiar_password_apicultor,name="cambiar_password_apicultor"),
]
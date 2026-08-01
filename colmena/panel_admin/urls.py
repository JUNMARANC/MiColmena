from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [

    # Dashboard
    path('panel/', views.dashboard_admin, name='dashboard_admin'),
    path("dashboard/datos/", views.dashboard_datos_json, name="dashboard_datos_json"),

    # Apiarios
    path('apiarios/', views.apiarios_admin, name='apiarios_admin'),
    path('apiarios/crear/', views.crear_apiario, name='crear_apiario'),
    path('apiarios/editar/<int:id>/', views.editar_apiario, name='editar_apiario'),
    path('apiarios/eliminar/<int:id>/', views.eliminar_apiario, name='eliminar_apiario'),

    # Colmenas
    path('colmenas/', views.colmenas_admin, name='colmenas_admin'),
    path('colmenas/crear/', views.crear_colmena, name='crear_colmena'),
    path('colmenas/editar/<int:id>/', views.editar_colmena, name='editar_colmena'),
    path('colmenas/eliminar/<int:id>/', views.eliminar_colmena, name='eliminar_colmena'),

    # Mantenimientos
    path('mantenimientos/', views.mantenimientos_admin, name='mantenimientos_admin'),
    path('mantenimientos/crear/', views.crear_mantenimiento, name='crear_mantenimiento'),
    path('mantenimientos/editar/<int:id>/', views.editar_mantenimiento, name='editar_mantenimiento'),
    path('mantenimientos/eliminar/<int:id>/', views.eliminar_mantenimiento, name='eliminar_mantenimiento'),

    # Incidencias
    path('incidencias/', views.incidencias_admin, name='incidencias_admin'),
    path("incidencias/crear/",views.crear_incidencia,name="crear_incidencia"),
    path("incidencias/editar/<int:id_incidencia>/",views.editar_incidencia,name="editar_incidencia"),
    path("incidencias/eliminar/<int:id_incidencia>/",views.eliminar_incidencia,name="eliminar_incidencia"),

    # Apicultores
    path('apicultores/', views.apicultores_admin, name='apicultores_admin'),
    path("apicultores/crear/",views.crear_apicultor,name="crear_apicultor"),
    path("apicultores/editar/<int:id_apicultor>/",views.editar_apicultor,name="editar_apicultor"),
    path("apicultores/eliminar/<int:id_apicultor>/",views.eliminar_apicultor,name="eliminar_apicultor"),
    path("apicultores/<int:id_apicultor>/perfil/",views.perfil_apicultor,name="perfil_apicultor"),
    path("apicultores/<int:id_apicultor>/vinculacion/guardar/",views.guardar_vinculacion_apicultor,name="guardar_vinculacion_apicultor"),
    path("apicultores/<int:id_apicultor>/registro-laboral/guardar/",views.guardar_registro_laboral_mensual,name="guardar_registro_laboral_mensual"),
    path("apicultores/<int:id_apicultor>/reporte-pdf/",views.reporte_apicultor_pdf,name="reporte_apicultor_pdf"),

    # Agenda
    path('agenda/', views.agenda_admin, name='agenda_admin'),
    path("agenda/crear/",views.crear_evento_agenda,name="crear_evento_agenda"),
    path("agenda/<int:id_evento>/editar/",views.editar_evento_agenda,name="editar_evento_agenda"),
    path("agenda/<int:id_evento>/eliminar/",views.eliminar_evento_agenda,name="eliminar_evento_agenda"),

    # Reportes
    path('reportes/', views.reportes_admin, name='reportes_admin'),
    path("reportes/generar/",views.generar_reporte_sistema,name="generar_reporte_sistema"),
    path("reportes/<int:id_reporte>/abrir/",views.abrir_reporte_sistema,name="abrir_reporte_sistema"),

    # Usuarios
    path('usuarios-roles/', views.usuarios_roles_admin, name='usuarios_roles_admin'),

    # Configuración
    path('configuracion/', views.configuracion_admin, name='configuracion_admin'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
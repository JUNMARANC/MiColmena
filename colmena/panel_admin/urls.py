from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [

    # Dashboard
    path('panel/', views.dashboard_admin, name='dashboard_admin'),

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

    # Apicultores
    path('apicultores/', views.apicultores_admin, name='apicultores_admin'),

    # Exportar
    path('exportar/', views.exportar_admin, name='exportar_admin'),

    # Agenda
    path('agenda/', views.agenda_admin, name='agenda_admin'),

    # Reportes
    path('reportes/', views.reportes_admin, name='reportes_admin'),

    # Usuarios
    path('usuarios-roles/', views.usuarios_roles_admin, name='usuarios_roles_admin'),

    # Configuración
    path('configuracion/', views.configuracion_admin, name='configuracion_admin'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
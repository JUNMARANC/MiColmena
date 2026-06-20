from django.urls import path
from home.views import inicio,quienes,servicios,contactanos,correo

urlpatterns = [
    path('',inicio,name="Inicio"),
    path('quienes',quienes,name="Quienes"),
    path('servicios',servicios,name="Servicios"),
    path('contactanos', contactanos,name="Contactanos"),
    path('correo_de_contacto',correo,name="Correo_de_Contacto"),
]
from django.urls import path
from home.views import inicio,quienes,servicios,contactanos

urlpatterns = [
    path('inicio',inicio,name="Inicio"),
    path('quienes',quienes,name="Quienes"),
    path('servicios',servicios,name="Servicios"),
    path('contactanos', contactanos,name="Contactanos"),
]
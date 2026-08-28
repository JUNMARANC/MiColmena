from django.urls import path

from panel_apicultor.views import (
    dashboard_apicultor,
    mis_apiarios,
)


urlpatterns = [

    path("",dashboard_apicultor,name="dashboard_apicultor"),
    path("apiarios/",mis_apiarios,name="apiarios_apicultor"),

]
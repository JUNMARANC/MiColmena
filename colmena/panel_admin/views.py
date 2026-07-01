from django.shortcuts import render, redirect, get_object_or_404
from dbmicolmena.models import Apiario, Apicultor
from django.core.paginator import Paginator

def dashboard_admin(request):
    return render(request, 'admin_panel/dashboard.html')


def colmenas_admin(request):
    return render(request, 'admin_panel/colmenas.html')

def mantenimientos_admin(request):
    return render(request, 'admin_panel/mantenimientos.html')

def incidencias_admin(request):
    return render(request, 'admin_panel/incidencias.html')

def apicultores_admin(request):
    return render(request, 'admin_panel/apicultores.html')

def exportar_admin(request):
    return render(request, 'admin_panel/exportar_base_datos.html')

def agenda_admin(request):
    return render(request, 'admin_panel/agenda.html')

def reportes_admin(request):
    return render(request, 'admin_panel/reportes.html')

def usuarios_roles_admin(request):
    return render(request, 'admin_panel/usuarios_roles.html')

def configuracion_admin(request):
    return render(request, 'admin_panel/configuracion.html')



from django.core.paginator import Paginator
from dbmicolmena.models import Apiario, Apicultor

def apiarios_admin(request):
    apiarios_lista = Apiario.objects.all().order_by('id_apiario')
    apicultores = Apicultor.objects.all()

    paginator = Paginator(apiarios_lista, 5)  # 6 registros por página
    page_number = request.GET.get('page')
    apiarios = paginator.get_page(page_number)

    return render(request, 'admin_panel/apiarios.html', {
        'apiarios': apiarios,
        'apicultores': apicultores,
    })

def crear_apiario(request):
    if request.method == "POST":
        Apiario.objects.create(
            nombreapiario=request.POST.get("nombre_apiario"),
            ubicacion=request.POST.get("ubicacion"),
            cantidadcolmenas=request.POST.get("cantidad_colmenas"),
            estadoapiario=request.POST.get("estado_apiario"),
            fechaeclosionapiario=request.POST.get("fecha_registro"),
            id_apicultor_id=request.POST.get("id_apicultor")
        )

    return redirect("apiarios_admin")


def editar_apiario(request, id):
    apiario = get_object_or_404(Apiario, id_apiario=id)

    if request.method == "POST":
        apiario.nombreapiario = request.POST.get("nombre_apiario")
        apiario.ubicacion = request.POST.get("ubicacion")
        apiario.cantidadcolmenas = request.POST.get("cantidad_colmenas")
        apiario.estadoapiario = request.POST.get("estado_apiario")
        apiario.fechaeclosionapiario = request.POST.get("fecha_registro")
        apiario.id_apicultor_id = request.POST.get("id_apicultor")
        apiario.save()

    return redirect("apiarios_admin")


def eliminar_apiario(request, id):
    apiario = get_object_or_404(Apiario, id_apiario=id)

    if request.method == "POST":
        apiario.delete()

    return redirect("apiarios_admin")
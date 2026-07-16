from django.shortcuts import render, redirect, get_object_or_404
from dbmicolmena.models import Apiario, Apicultor, Colmena, Mantenimiento
from django.core.paginator import Paginator
from django.contrib.auth.decorators import login_required
from dbmicolmena.models import Administrador

@login_required(login_url="login")
def dashboard_admin(request):
    if not Administrador.objects.filter(user=request.user).exists():
        return redirect("login")

    return render(request, 'admin_panel/dashboard.html')


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

#LOGICA DE LOS APIARIOS

def apiarios_admin(request):
    apiarios_lista = Apiario.objects.all().order_by('id_apiario')
    apicultores = Apicultor.objects.all()

    estado = request.GET.get('estado')

    if estado:
        apiarios_lista = apiarios_lista.filter(estadoapiario=estado)

    paginator = Paginator(apiarios_lista, 5)
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
            id_apicultor_id=request.POST.get("id_apicultor"),
            descripcion=request.POST.get("descripcion"),
            imagen=request.FILES.get("imagen")
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
        apiario.descripcion = request.POST.get("descripcion")

        if request.FILES.get("imagen"):
            apiario.imagen = request.FILES.get("imagen")

        apiario.save()

    return redirect("apiarios_admin")


def eliminar_apiario(request, id):
    apiario = get_object_or_404(Apiario, id_apiario=id)

    if request.method == "POST":
        apiario.delete()

    return redirect("apiarios_admin")


#LOGICA DE LOS COLMENAS

def colmenas_admin(request):

    colmenas_lista = Colmena.objects.select_related(
        'id_apiario'
    ).all().order_by('id_colmena')

    apiarios = Apiario.objects.all()

    # ==========================
    # FILTROS
    # ==========================

    codigo = request.GET.get("codigo")
    apiario = request.GET.get("apiario")
    estado = request.GET.get("estado")

    if codigo:
        colmenas_lista = colmenas_lista.filter(
            codigocolmena__icontains=codigo
        )

    if apiario:
        colmenas_lista = colmenas_lista.filter(
            id_apiario_id=apiario
        )

    if estado:
        colmenas_lista = colmenas_lista.filter(
            estadocolmena=estado
        )

    # ==========================
    # PAGINADOR
    # ==========================

    paginator = Paginator(colmenas_lista, 5)

    page_number = request.GET.get("page")

    colmenas = paginator.get_page(page_number)

    return render(request, "admin_panel/colmenas.html", {
        "colmenas": colmenas,
        "apiarios": apiarios,
    })


def crear_colmena(request):
    if request.method == "POST":

        ultima_colmena = Colmena.objects.order_by('-id_colmena').first()

        if ultima_colmena:
            nuevo_numero = ultima_colmena.id_colmena + 1
        else:
            nuevo_numero = 1

        codigo = f"CM{nuevo_numero:08d}"

        Colmena.objects.create(
            id_apiario_id=request.POST.get("id_apiario"),
            codigocolmena=codigo,
            estadocolmena=request.POST.get("estado_colmena"),
            fecharegistro=request.POST.get("fecha_registro"),
            descripcion=request.POST.get("descripcion"),
            imagen=request.FILES.get("imagen")   # ← Aquí se guarda la imagen
        )

    return redirect("colmenas_admin")


def editar_colmena(request, id):
    colmena = get_object_or_404(Colmena, id_colmena=id)

    if request.method == "POST":
        colmena.id_apiario_id = request.POST.get("id_apiario")
        colmena.estadocolmena = request.POST.get("estado_colmena")
        colmena.fecharegistro = request.POST.get("fecha_registro")
        colmena.descripcion = request.POST.get("descripcion")

        if request.FILES.get("imagen"):
            colmena.imagen = request.FILES.get("imagen")

        colmena.save()

    return redirect("colmenas_admin")


def eliminar_colmena(request, id):
    colmena = get_object_or_404(Colmena, id_colmena=id)

    if request.method == "POST":
        colmena.delete()

    return redirect("colmenas_admin")

#LOGICA DE MATENIMIENTOS
def mantenimientos_admin(request):
    apicultores = Apicultor.objects.select_related("user").all()
    apiarios = Apiario.objects.all()
    colmenas = Colmena.objects.select_related("id_apiario").all()

    mantenimientos_lista = Mantenimiento.objects.select_related(
        "id_apiario",
        "id_colmena",
        "id_colmena__id_apiario"
    ).all().order_by("id_mantenimiento")

    apiario_id = request.GET.get("apiario")
    colmena_id = request.GET.get("colmena")
    estado = request.GET.get("estado")

    if apiario_id:
        mantenimientos_lista = mantenimientos_lista.filter(
            id_apiario_id=apiario_id
        )

    if colmena_id:
        mantenimientos_lista = mantenimientos_lista.filter(
            id_colmena_id=colmena_id
        )

    if estado:
        mantenimientos_lista = mantenimientos_lista.filter(
            estado=estado
        )

    paginator = Paginator(mantenimientos_lista, 5)
    page_number = request.GET.get("page")
    mantenimientos = paginator.get_page(page_number)

    return render(request, "admin_panel/mantenimientos.html", {
        "mantenimientos": mantenimientos,
        "apicultores": apicultores,
        "apiarios": apiarios,
        "colmenas": colmenas,
    })


def crear_mantenimiento(request):
    if request.method == "POST":
        entidad = request.POST.get("entidad_mantenimiento")

        id_apiario = None
        id_colmena = None

        if entidad == "Apiario":
            id_apiario = request.POST.get("id_apiario")

        if entidad == "Colmena":
            id_colmena = request.POST.get("id_colmena")

        Mantenimiento.objects.create(
            entidadmantenimiento=entidad,
            id_apiario_id=id_apiario,
            id_colmena_id=id_colmena,
            tipo=request.POST.get("tipo"),
            fechaejecucion=request.POST.get("fecha_ejecucion"),
            estado=request.POST.get("estado"),
            prioridad=request.POST.get("prioridad"),
            observaciones=request.POST.get("observaciones"),
            responsable=request.POST.get("responsable")
        )

    return redirect("mantenimientos_admin")


def editar_mantenimiento(request, id):
    mantenimiento = get_object_or_404(Mantenimiento, id_mantenimiento=id)

    if request.method == "POST":
        mantenimiento.id_colmena_id = request.POST.get("id_colmena")
        mantenimiento.tipo = request.POST.get("tipo")
        mantenimiento.fechaejecucion = request.POST.get("fecha_ejecucion")
        mantenimiento.estado = request.POST.get("estado")
        mantenimiento.prioridad = request.POST.get("prioridad")
        mantenimiento.observaciones = request.POST.get("observaciones")
        mantenimiento.responsable = request.POST.get("responsable")
        mantenimiento.save()

    return redirect("mantenimientos_admin")


def eliminar_mantenimiento(request, id):
    mantenimiento = get_object_or_404(Mantenimiento, id_mantenimiento=id)

    if request.method == "POST":
        mantenimiento.delete()

    return redirect("mantenimientos_admin")
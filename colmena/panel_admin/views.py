from django.shortcuts import render, redirect, get_object_or_404
from dbmicolmena.models import Apiario, Apicultor, Colmena, Mantenimiento, Incidencia, Administrador, Rol
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.db.models import Q, Count, Sum
from django.core.paginator import Paginator
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from functools import wraps
import traceback
from calendar import monthrange
from django.utils import timezone
from django.views.decorators.http import require_POST
from panel_admin.forms import (VinculacionApicultorForm,RegistroLaboralMensualForm,)
from dbmicolmena.models import (VinculacionApicultor,RegistroLaboralMensual,)
from django.utils.text import slugify
from django.views.decorators.http import require_GET
from django.template.loader import render_to_string
from django.http import HttpResponse
from datetime import datetime, date
from pathlib import Path

def administrador_requerido(vista):
    @wraps(vista)
    @login_required(login_url="login")
    def envoltura(request, *args, **kwargs):

        es_administrador = Administrador.objects.filter(
            user=request.user
        ).exists()

        if not es_administrador:
            messages.error(
                request,
                "No tienes permisos para acceder al panel administrativo."
            )

            return redirect("login")

        return vista(request, *args, **kwargs)

    return envoltura

@administrador_requerido
def dashboard_admin(request):
    return render(
        request,
        "admin_panel/dashboard.html"
    )


@administrador_requerido
def exportar_admin(request):
    return render(request, 'admin_panel/exportar_base_datos.html')

@administrador_requerido
def agenda_admin(request):
    return render(request, 'admin_panel/agenda.html')

@administrador_requerido
def reportes_admin(request):
    return render(request, 'admin_panel/reportes.html')

@administrador_requerido
def usuarios_roles_admin(request):
    return render(request, 'admin_panel/usuarios_roles.html')

@administrador_requerido
def configuracion_admin(request):
    return render(request, 'admin_panel/configuracion.html')

#LOGICA DE LOS APIARIOS
@administrador_requerido
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

@administrador_requerido
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

@administrador_requerido
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

@administrador_requerido
def eliminar_apiario(request, id):
    apiario = get_object_or_404(Apiario, id_apiario=id)

    if request.method == "POST":
        apiario.delete()

    return redirect("apiarios_admin")


#LOGICA DE LOS COLMENAS
@administrador_requerido
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

@administrador_requerido
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

@administrador_requerido
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

@administrador_requerido
def eliminar_colmena(request, id):
    colmena = get_object_or_404(Colmena, id_colmena=id)

    if request.method == "POST":
        colmena.delete()

    return redirect("colmenas_admin")

#LOGICA DE MATENIMIENTOS
@administrador_requerido
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

@administrador_requerido
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

@administrador_requerido
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

@administrador_requerido
def eliminar_mantenimiento(request, id):
    mantenimiento = get_object_or_404(Mantenimiento, id_mantenimiento=id)

    if request.method == "POST":
        mantenimiento.delete()

    return redirect("mantenimientos_admin")


# LOGICO DE INCIDENCIAS 

@administrador_requerido
def incidencias_admin(request):
    incidencias_lista = Incidencia.objects.select_related(
        "id_apicultor",
        "id_apiario",
        "id_colmena",
        "id_colmena__id_apiario",
    ).all().order_by("-fechadeteccion", "-id_incidencia")

    apicultores = Apicultor.objects.all().order_by("id_apicultor")
    apiarios = Apiario.objects.all().order_by("nombreapiario")
    colmenas = Colmena.objects.select_related(
        "id_apiario"
    ).all().order_by("codigocolmena")

    # Valores enviados por los filtros
    entidad = request.GET.get("entidad", "").strip()
    id_apicultor = request.GET.get("apicultor", "").strip()
    id_apiario = request.GET.get("apiario", "").strip()
    id_colmena = request.GET.get("colmena", "").strip()
    prioridad = request.GET.get("prioridad", "").strip()
    estado = request.GET.get("estado", "").strip()

    # Primer filtro desplegable:
    # Apicultor, Apiario o Colmena
    if entidad:
        incidencias_lista = incidencias_lista.filter(
            entidadincidencia=entidad
        )

    if id_apicultor:
        incidencias_lista = incidencias_lista.filter(
            id_apicultor_id=id_apicultor
        )

    if id_apiario:
        if entidad == "Colmena":
            incidencias_lista = incidencias_lista.filter(
                id_colmena__id_apiario_id=id_apiario
            )
        else:
            incidencias_lista = incidencias_lista.filter(
                id_apiario_id=id_apiario
            )

    if id_colmena:
        incidencias_lista = incidencias_lista.filter(
            id_colmena_id=id_colmena
        )

    if prioridad:
        incidencias_lista = incidencias_lista.filter(
            prioridad=prioridad
        )

    if estado:
        incidencias_lista = incidencias_lista.filter(
            estado=estado
        )

    paginator = Paginator(incidencias_lista, 5)
    numero_pagina = request.GET.get("page")
    incidencias = paginator.get_page(numero_pagina)

    contexto = {
        "incidencias": incidencias,
        "apicultores": apicultores,
        "apiarios": apiarios,
        "colmenas": colmenas,

        # Mantener los filtros seleccionados
        "filtro_entidad": entidad,
        "filtro_apicultor": id_apicultor,
        "filtro_apiario": id_apiario,
        "filtro_colmena": id_colmena,
        "filtro_prioridad": prioridad,
        "filtro_estado": estado,
    }

    return render(
        request,
        "admin_panel/incidencias.html",
        contexto
    )

#CREAR INCIDENCIA 

@administrador_requerido
def crear_incidencia(request):
    if request.method != "POST":
        return redirect("incidencias_admin")

    entidad = request.POST.get("entidadincidencia", "").strip()
    titulo = request.POST.get("titulo", "").strip()
    prioridad = request.POST.get("prioridad", "").strip()
    fecha_deteccion = request.POST.get("fechadeteccion", "").strip()
    estado = request.POST.get("estado", "").strip()
    observaciones = request.POST.get("observaciones", "").strip()
    responsable = request.POST.get("responsable", "").strip()
    imagen = request.FILES.get("imagen")

    id_apicultor = request.POST.get("id_apicultor")
    id_apiario = request.POST.get("id_apiario")
    id_colmena = request.POST.get("id_colmena")

    entidades_validas = ["Apicultor", "Apiario", "Colmena"]
    prioridades_validas = ["Baja", "Media", "Alta", "Crítica"]
    estados_validos = ["Pendiente", "En proceso", "Resuelta"]

    if entidad not in entidades_validas:
        messages.error(
            request,
            "Debes seleccionar una entidad válida."
        )
        return redirect("incidencias_admin")

    if not titulo or not fecha_deteccion:
        messages.error(
            request,
            "El título y la fecha de detección son obligatorios."
        )
        return redirect("incidencias_admin")

    if prioridad not in prioridades_validas:
        messages.error(
            request,
            "La prioridad seleccionada no es válida."
        )
        return redirect("incidencias_admin")

    if estado not in estados_validos:
        messages.error(
            request,
            "El estado seleccionado no es válido."
        )
        return redirect("incidencias_admin")

    incidencia = Incidencia(
        entidadincidencia=entidad,
        titulo=titulo,
        prioridad=prioridad,
        fechadeteccion=fecha_deteccion,
        estado=estado,
        observaciones=observaciones or None,
        responsable=responsable or None,
        imagen=imagen,
    )

    # Limpiamos las relaciones para evitar que una incidencia
    # quede relacionada con varias entidades al mismo tiempo.
    incidencia.id_apicultor = None
    incidencia.id_apiario = None
    incidencia.id_colmena = None

    if entidad == "Apicultor":
        if not id_apicultor:
            messages.error(
                request,
                "Debes seleccionar un apicultor."
            )
            return redirect("incidencias_admin")

        incidencia.id_apicultor = get_object_or_404(
            Apicultor,
            pk=id_apicultor
        )

    elif entidad == "Apiario":
        if not id_apiario:
            messages.error(
                request,
                "Debes seleccionar un apiario."
            )
            return redirect("incidencias_admin")

        incidencia.id_apiario = get_object_or_404(
            Apiario,
            pk=id_apiario
        )

    elif entidad == "Colmena":
        if not id_apiario or not id_colmena:
            messages.error(
                request,
                "Debes seleccionar el apiario y la colmena."
            )
            return redirect("incidencias_admin")

        colmena = get_object_or_404(
            Colmena,
            pk=id_colmena,
            id_apiario_id=id_apiario
        )

        # Guardamos la colmena y también el apiario al que pertenece.
        incidencia.id_colmena = colmena
        incidencia.id_apiario = colmena.id_apiario

    incidencia.save()

    messages.success(
        request,
        "La incidencia fue registrada correctamente."
    )

    return redirect("incidencias_admin")

#editar incidencias 

@administrador_requerido
def editar_incidencia(request, id_incidencia):
    incidencia = get_object_or_404(
        Incidencia,
        pk=id_incidencia
    )

    if request.method != "POST":
        return redirect("incidencias_admin")

    entidad = request.POST.get("entidadincidencia", "").strip()
    titulo = request.POST.get("titulo", "").strip()
    prioridad = request.POST.get("prioridad", "").strip()
    fecha_deteccion = request.POST.get("fechadeteccion", "").strip()
    estado = request.POST.get("estado", "").strip()
    observaciones = request.POST.get("observaciones", "").strip()
    responsable = request.POST.get("responsable", "").strip()

    id_apicultor = request.POST.get("id_apicultor")
    id_apiario = request.POST.get("id_apiario")
    id_colmena = request.POST.get("id_colmena")

    nueva_imagen = request.FILES.get("imagen")
    eliminar_imagen = request.POST.get("eliminar_imagen")

    entidades_validas = ["Apicultor", "Apiario", "Colmena"]
    prioridades_validas = ["Baja", "Media", "Alta", "Crítica"]
    estados_validos = ["Pendiente", "En proceso", "Resuelta"]

    if entidad not in entidades_validas:
        messages.error(
            request,
            "La entidad seleccionada no es válida."
        )
        return redirect("incidencias_admin")

    if not titulo or not fecha_deteccion:
        messages.error(
            request,
            "El título y la fecha son obligatorios."
        )
        return redirect("incidencias_admin")

    if prioridad not in prioridades_validas:
        messages.error(
            request,
            "La prioridad seleccionada no es válida."
        )
        return redirect("incidencias_admin")

    if estado not in estados_validos:
        messages.error(
            request,
            "El estado seleccionado no es válido."
        )
        return redirect("incidencias_admin")

    incidencia.entidadincidencia = entidad
    incidencia.titulo = titulo
    incidencia.prioridad = prioridad
    incidencia.fechadeteccion = fecha_deteccion
    incidencia.estado = estado
    incidencia.observaciones = observaciones or None
    incidencia.responsable = responsable or None

    # Limpiar relaciones anteriores
    incidencia.id_apicultor = None
    incidencia.id_apiario = None
    incidencia.id_colmena = None

    if entidad == "Apicultor":
        if not id_apicultor:
            messages.error(
                request,
                "Debes seleccionar un apicultor."
            )
            return redirect("incidencias_admin")

        incidencia.id_apicultor = get_object_or_404(
            Apicultor,
            pk=id_apicultor
        )

    elif entidad == "Apiario":
        if not id_apiario:
            messages.error(
                request,
                "Debes seleccionar un apiario."
            )
            return redirect("incidencias_admin")

        incidencia.id_apiario = get_object_or_404(
            Apiario,
            pk=id_apiario
        )

    elif entidad == "Colmena":
        if not id_apiario or not id_colmena:
            messages.error(
                request,
                "Debes seleccionar el apiario y la colmena."
            )
            return redirect("incidencias_admin")

        colmena = get_object_or_404(
            Colmena,
            pk=id_colmena,
            id_apiario_id=id_apiario
        )

        incidencia.id_colmena = colmena
        incidencia.id_apiario = colmena.id_apiario

    # Reemplazar imagen
    if nueva_imagen:
        if incidencia.imagen:
            incidencia.imagen.delete(save=False)

        incidencia.imagen = nueva_imagen

    # Eliminar imagen actual
    elif eliminar_imagen == "1":
        if incidencia.imagen:
            incidencia.imagen.delete(save=False)

        incidencia.imagen = None

    incidencia.save()

    messages.success(
        request,
        "La incidencia fue actualizada correctamente."
    )

    return redirect("incidencias_admin")

#Eliminar incidencia

@administrador_requerido
def eliminar_incidencia(request, id_incidencia):
    incidencia = get_object_or_404(
        Incidencia,
        pk=id_incidencia
    )

    if request.method == "POST":
        if incidencia.imagen:
            incidencia.imagen.delete(save=False)

        incidencia.delete()

        messages.success(
            request,
            "La incidencia fue eliminada correctamente."
        )

    return redirect("incidencias_admin")




#LOGICA DE APICULTORES

@administrador_requerido
def apicultores_admin(request):

    apicultores_lista = (
        Apicultor.objects
        .select_related(
            "user",
            "id_rol"
        )
        .prefetch_related("apiarios")
        .order_by(
            "user__first_name",
            "user__last_name"
        )
    )

    tipo_filtro = request.GET.get("tipo_filtro", "").strip()
    busqueda = request.GET.get("busqueda", "").strip()

    if busqueda:

        if tipo_filtro == "nombre":
            apicultores_lista = apicultores_lista.filter(
                Q(user__first_name__icontains=busqueda) |
                Q(user__last_name__icontains=busqueda) |
                Q(user__username__icontains=busqueda)
            )

        elif tipo_filtro == "telefono":
            apicultores_lista = apicultores_lista.filter(
                telefono__icontains=busqueda
            )

        elif tipo_filtro == "correo":
            apicultores_lista = apicultores_lista.filter(
                user__email__icontains=busqueda
            )

        elif tipo_filtro == "identificacion":
            apicultores_lista = apicultores_lista.filter(
                identificacion__icontains=busqueda
            )

        else:
            apicultores_lista = apicultores_lista.filter(
                Q(user__first_name__icontains=busqueda) |
                Q(user__last_name__icontains=busqueda) |
                Q(user__username__icontains=busqueda) |
                Q(user__email__icontains=busqueda) |
                Q(telefono__icontains=busqueda) |
                Q(identificacion__icontains=busqueda)
            )

    paginator = Paginator(apicultores_lista, 5)

    numero_pagina = request.GET.get("page")

    apicultores = paginator.get_page(numero_pagina)

    return render(
        request,
        "admin_panel/apicultores/apicultores.html",
        {
            "apicultores": apicultores,
            "tipo_filtro": tipo_filtro,
            "busqueda": busqueda,
        }
    )

#CREAR APICULTOR

@administrador_requerido
def crear_apicultor(request):

    if request.method != "POST":
        return redirect("apicultores_admin")

    # =========================================================
    # DATOS PERSONALES
    # =========================================================

    primer_nombre = request.POST.get(
        "primer_nombre",
        ""
    ).strip()

    segundo_nombre = request.POST.get(
        "segundo_nombre",
        ""
    ).strip()

    primer_apellido = request.POST.get(
        "primer_apellido",
        ""
    ).strip()

    segundo_apellido = request.POST.get(
        "segundo_apellido",
        ""
    ).strip()

    identificacion = request.POST.get(
        "identificacion",
        ""
    ).strip()

    correo = request.POST.get(
        "correo",
        ""
    ).strip().lower()

    telefono = request.POST.get(
        "telefono",
        ""
    ).strip()

    # =========================================================
    # INFORMACIÓN LABORAL
    # =========================================================

    zona_trabajo = request.POST.get(
        "zona_trabajo",
        ""
    ).strip()

    experiencia = request.POST.get(
        "experiencia",
        ""
    ).strip()

    # =========================================================
    # CREDENCIALES
    # =========================================================

    username = request.POST.get(
        "username",
        ""
    ).strip()

    password = request.POST.get(
        "password",
        ""
    )

    confirmar_password = request.POST.get(
        "confirmar_password",
        ""
    )

    # =========================================================
    # FOTO
    # =========================================================

    fotoperfil = request.FILES.get(
        "fotoperfil"
    )

    # =========================================================
    # VALIDACIONES DE CAMPOS OBLIGATORIOS
    # =========================================================

    if not primer_nombre:
        messages.error(
            request,
            "El primer nombre es obligatorio."
        )
        return redirect("apicultores_admin")

    if not primer_apellido:
        messages.error(
            request,
            "El primer apellido es obligatorio."
        )
        return redirect("apicultores_admin")

    if not identificacion:
        messages.error(
            request,
            "La identificación es obligatoria."
        )
        return redirect("apicultores_admin")

    if not correo:
        messages.error(
            request,
            "El correo electrónico es obligatorio."
        )
        return redirect("apicultores_admin")

    if not username:
        messages.error(
            request,
            "El nombre de usuario es obligatorio."
        )
        return redirect("apicultores_admin")

    if not password:
        messages.error(
            request,
            "La contraseña es obligatoria."
        )
        return redirect("apicultores_admin")

    if not confirmar_password:
        messages.error(
            request,
            "Debes confirmar la contraseña."
        )
        return redirect("apicultores_admin")

    # =========================================================
    # VALIDAR IDENTIFICACIÓN
    # =========================================================

    if not identificacion.isdigit():
        messages.error(
            request,
            "La identificación debe contener solamente números."
        )
        return redirect("apicultores_admin")

    # =========================================================
    # VALIDAR TELÉFONO
    # =========================================================

    if telefono and not telefono.isdigit():
        messages.error(
            request,
            "El teléfono debe contener solamente números."
        )
        return redirect("apicultores_admin")

    # =========================================================
    # VALIDAR EXPERIENCIA
    # =========================================================

    if experiencia:

        try:
            experiencia = int(experiencia)

        except ValueError:
            messages.error(
                request,
                "Los años de experiencia deben ser un número válido."
            )
            return redirect("apicultores_admin")

        if experiencia < 0 or experiencia > 80:
            messages.error(
                request,
                "Los años de experiencia deben estar entre 0 y 80."
            )
            return redirect("apicultores_admin")

    else:
        experiencia = None

    # =========================================================
    # VALIDAR CONTRASEÑAS
    # =========================================================

    if len(password) < 8:
        messages.error(
            request,
            "La contraseña debe tener como mínimo 8 caracteres."
        )
        return redirect("apicultores_admin")

    if password != confirmar_password:
        messages.error(
            request,
            "Las contraseñas no coinciden."
        )
        return redirect("apicultores_admin")

    # =========================================================
    # VALIDAR FOTO
    # =========================================================

    if fotoperfil:

        tipos_permitidos = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ]

        if fotoperfil.content_type not in tipos_permitidos:
            messages.error(
                request,
                "La foto debe estar en formato JPG, PNG o WEBP."
            )
            return redirect("apicultores_admin")

        tamano_maximo = 5 * 1024 * 1024

        if fotoperfil.size > tamano_maximo:
            messages.error(
                request,
                "La foto de perfil no puede superar los 5 MB."
            )
            return redirect("apicultores_admin")

    # =========================================================
    # VALIDAR DATOS DUPLICADOS
    # =========================================================

    if User.objects.filter(
        username__iexact=username
    ).exists():
        messages.error(
            request,
            "Ese nombre de usuario ya está registrado."
        )
        return redirect("apicultores_admin")

    if User.objects.filter(
        email__iexact=correo
    ).exists():
        messages.error(
            request,
            "Ese correo electrónico ya está registrado."
        )
        return redirect("apicultores_admin")

    if Apicultor.objects.filter(
        identificacion=identificacion
    ).exists():
        messages.error(
            request,
            "Ya existe un apicultor con esa identificación."
        )
        return redirect("apicultores_admin")

    # =========================================================
    # CONSTRUIR NOMBRES Y APELLIDOS
    # =========================================================

    nombres = " ".join(
        valor
        for valor in [
            primer_nombre,
            segundo_nombre
        ]
        if valor
    )

    apellidos = " ".join(
        valor
        for valor in [
            primer_apellido,
            segundo_apellido
        ]
        if valor
    )

    # =========================================================
    # CREAR USUARIO Y PERFIL
    # =========================================================

    try:

        with transaction.atomic():

            rol_apicultor = Rol.objects.get(
                nombrerol__iexact="Apicultor"
            )

            usuario = User.objects.create_user(
                username=username,
                email=correo,
                password=password,
                first_name=nombres,
                last_name=apellidos,
                is_active=True,
                is_staff=False,
                is_superuser=False
            )

            Apicultor.objects.create(
                user=usuario,
                id_rol=rol_apicultor,
                identificacion=identificacion,
                telefono=telefono or None,
                zona_trabajo=zona_trabajo or None,
                experienciaanios=experiencia,
                fotoperfil=fotoperfil
            )

        messages.success(
            request,
            "El apicultor fue registrado correctamente."
        )

    except Rol.DoesNotExist:

        messages.error(
            request,
            "No existe el rol Apicultor en la base de datos."
        )

    except IntegrityError:

        messages.error(
            request,
            "No fue posible registrar el apicultor porque alguno de los datos ya existe."
        )

    except Exception as error:

        print("\n" + "=" * 70)
        print("ERROR AL REGISTRAR EL APICULTOR")
        print("Tipo de error:", type(error).__name__)
        print("Mensaje:", str(error))
        traceback.print_exc()
        print("=" * 70 + "\n")

        messages.error(
            request,
            "Ocurrió un error inesperado al registrar el apicultor. "
            "Revisa la terminal del servidor."
        )

    return redirect("apicultores_admin")

#EDITAR APICULTOR

@administrador_requerido
def editar_apicultor(request, id_apicultor):

    apicultor = get_object_or_404(
        Apicultor.objects.select_related("user"),
        pk=id_apicultor
    )

    if request.method != "POST":
        return redirect("apicultores_admin")

    if not apicultor.user:
        messages.error(
            request,
            "Este apicultor no tiene un usuario asociado."
        )
        return redirect("apicultores_admin")

    usuario = apicultor.user

    # =========================================================
    # RECIBIR DATOS
    # =========================================================

    nombres = request.POST.get(
        "nombres",
        ""
    ).strip()

    apellidos = request.POST.get(
        "apellidos",
        ""
    ).strip()

    identificacion = request.POST.get(
        "identificacion",
        ""
    ).strip()

    correo = request.POST.get(
        "correo",
        ""
    ).strip().lower()

    telefono = request.POST.get(
        "telefono",
        ""
    ).strip()

    zona_trabajo = request.POST.get(
        "zona_trabajo",
        ""
    ).strip()

    experiencia = request.POST.get(
        "experiencia",
        ""
    ).strip()

    username = request.POST.get(
        "username",
        ""
    ).strip()

    nueva_password = request.POST.get(
        "password",
        ""
    )

    confirmar_password = request.POST.get(
        "confirmar_password",
        ""
    )

    nueva_foto = request.FILES.get(
        "fotoperfil"
    )

    eliminar_foto = (
        request.POST.get("eliminar_foto") == "1"
    )

    usuario_activo = (
        request.POST.get("is_active") == "1"
    )

    # =========================================================
    # CAMPOS OBLIGATORIOS
    # =========================================================

    if not nombres:
        messages.error(
            request,
            "Los nombres son obligatorios."
        )
        return redirect("apicultores_admin")

    if not apellidos:
        messages.error(
            request,
            "Los apellidos son obligatorios."
        )
        return redirect("apicultores_admin")

    if not identificacion:
        messages.error(
            request,
            "La identificación es obligatoria."
        )
        return redirect("apicultores_admin")

    if not username:
        messages.error(
            request,
            "El nombre de usuario es obligatorio."
        )
        return redirect("apicultores_admin")

    if not correo:
        messages.error(
            request,
            "El correo electrónico es obligatorio."
        )
        return redirect("apicultores_admin")

    # =========================================================
    # IDENTIFICACIÓN Y TELÉFONO
    # =========================================================

    if not identificacion.isdigit():
        messages.error(
            request,
            "La identificación debe contener solamente números."
        )
        return redirect("apicultores_admin")

    if telefono and not telefono.isdigit():
        messages.error(
            request,
            "El teléfono debe contener solamente números."
        )
        return redirect("apicultores_admin")

    # =========================================================
    # EXPERIENCIA
    # =========================================================

    if experiencia:

        try:
            experiencia = int(experiencia)

        except ValueError:

            messages.error(
                request,
                "Los años de experiencia deben ser un número válido."
            )

            return redirect("apicultores_admin")

        if experiencia < 0 or experiencia > 80:

            messages.error(
                request,
                "Los años de experiencia deben estar entre 0 y 80."
            )

            return redirect("apicultores_admin")

    else:
        experiencia = None

    # =========================================================
    # CONTRASEÑA OPCIONAL
    # =========================================================

    if nueva_password or confirmar_password:

        if len(nueva_password) < 8:
            messages.error(
                request,
                "La nueva contraseña debe tener como mínimo 8 caracteres."
            )
            return redirect("apicultores_admin")

        if nueva_password != confirmar_password:
            messages.error(
                request,
                "Las nuevas contraseñas no coinciden."
            )
            return redirect("apicultores_admin")

    # =========================================================
    # VALIDAR FOTO
    # =========================================================

    if nueva_foto:

        tipos_permitidos = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ]

        if nueva_foto.content_type not in tipos_permitidos:
            messages.error(
                request,
                "La fotografía debe estar en formato JPG, PNG o WEBP."
            )
            return redirect("apicultores_admin")

        tamano_maximo = 5 * 1024 * 1024

        if nueva_foto.size > tamano_maximo:
            messages.error(
                request,
                "La fotografía no puede superar los 5 MB."
            )
            return redirect("apicultores_admin")

    # =========================================================
    # DATOS DUPLICADOS
    # =========================================================

    if User.objects.exclude(
        pk=usuario.pk
    ).filter(
        username__iexact=username
    ).exists():

        messages.error(
            request,
            "Ese nombre de usuario ya pertenece a otra persona."
        )

        return redirect("apicultores_admin")

    if User.objects.exclude(
        pk=usuario.pk
    ).filter(
        email__iexact=correo
    ).exists():

        messages.error(
            request,
            "Ese correo electrónico ya pertenece a otro usuario."
        )

        return redirect("apicultores_admin")

    if Apicultor.objects.exclude(
        pk=apicultor.pk
    ).filter(
        identificacion=identificacion
    ).exists():

        messages.error(
            request,
            "Esa identificación ya pertenece a otro apicultor."
        )

        return redirect("apicultores_admin")

    # =========================================================
    # PREPARAR FOTO ANTERIOR
    # =========================================================

    nombre_foto_anterior = None
    almacenamiento_foto = None

    if apicultor.fotoperfil:

        nombre_foto_anterior = (
            apicultor.fotoperfil.name
        )

        almacenamiento_foto = (
            apicultor.fotoperfil.storage
        )

    foto_fue_reemplazada = bool(
        nueva_foto or eliminar_foto
    )

    # =========================================================
    # ACTUALIZAR
    # =========================================================

    try:

        with transaction.atomic():

            usuario.first_name = nombres
            usuario.last_name = apellidos
            usuario.username = username
            usuario.email = correo
            usuario.is_active = usuario_activo

            if nueva_password:
                usuario.set_password(nueva_password)

            usuario.save()

            apicultor.identificacion = identificacion
            apicultor.telefono = telefono or None
            apicultor.zona_trabajo = zona_trabajo or None
            apicultor.experienciaanios = experiencia

            if eliminar_foto:
                apicultor.fotoperfil = None

            if nueva_foto:
                apicultor.fotoperfil = nueva_foto

            apicultor.save()

        # El archivo anterior se elimina después de guardar.
        if (
            foto_fue_reemplazada
            and nombre_foto_anterior
            and almacenamiento_foto
        ):
            almacenamiento_foto.delete(
                nombre_foto_anterior
            )

        messages.success(
            request,
            "El apicultor fue actualizado correctamente."
        )

    except IntegrityError as error:

        print(
            "Error de integridad al editar apicultor:",
            error
        )

        messages.error(
            request,
            "No fue posible actualizar el apicultor porque alguno de los datos ya existe."
        )

    except Exception as error:

        print(
            "Error inesperado al editar apicultor:",
            type(error).__name__,
            error
        )

        messages.error(
            request,
            "Ocurrió un error inesperado al actualizar el apicultor."
        )

    return redirect("apicultores_admin")



#ELIMINAR APICULTOR

@administrador_requerido
def eliminar_apicultor(request, id_apicultor):

    apicultor = get_object_or_404(
        Apicultor.objects.select_related("user"),
        pk=id_apicultor
    )

    if request.method != "POST":
        return redirect("apicultores_admin")

    # No permitir eliminar apicultores con apiarios
    if apicultor.apiarios.exists():

        cantidad_apiarios = apicultor.apiarios.count()

        messages.error(
            request,
            (
                f"No se puede eliminar el apicultor porque tiene "
                f"{cantidad_apiarios} apiario"
                f"{'s' if cantidad_apiarios != 1 else ''} asignado"
                f"{'s' if cantidad_apiarios != 1 else ''}."
            )
        )

        return redirect("apicultores_admin")

    usuario = apicultor.user

    nombre_foto = None
    almacenamiento_foto = None

    if apicultor.fotoperfil:

        nombre_foto = apicultor.fotoperfil.name
        almacenamiento_foto = apicultor.fotoperfil.storage

    try:

        with transaction.atomic():

            apicultor.delete()

            if usuario:
                usuario.delete()

        # Borrar archivo físico después de confirmar la transacción
        if nombre_foto and almacenamiento_foto:
            almacenamiento_foto.delete(nombre_foto)

        messages.success(
            request,
            "El apicultor y sus credenciales fueron eliminados correctamente."
        )

    except IntegrityError as error:

        print(
            "Error de integridad al eliminar apicultor:",
            error
        )

        messages.error(
            request,
            "No se puede eliminar el apicultor porque tiene información relacionada."
        )

    except Exception as error:

        print(
            "Error inesperado al eliminar apicultor:",
            type(error).__name__,
            error
        )

        messages.error(
            request,
            "Ocurrió un error inesperado al eliminar el apicultor."
        )

    return redirect("apicultores_admin")

@administrador_requerido
def perfil_apicultor(request, id_apicultor):

    apicultor = get_object_or_404(
        Apicultor.objects
        .select_related(
            "user",
            "id_rol"
        )
        .prefetch_related(
            "apiarios"
        ),
        pk=id_apicultor
    )

    apiarios = (
        apicultor.apiarios
        .all()
        .order_by("nombreapiario")
    )

    resumen = apiarios.aggregate(
        total_apiarios=Count("id_apiario"),
        total_colmenas=Sum("cantidadcolmenas")
    )

    total_apiarios = resumen["total_apiarios"] or 0
    total_colmenas = resumen["total_colmenas"] or 0

    return render(
        request,
        "admin_panel/apicultores/perfil.html",
        {
            "apicultor": apicultor,
            "apiarios": apiarios,
            "total_apiarios": total_apiarios,
            "total_colmenas": total_colmenas,
        }
    )

#VISTA PARA EL PERFIL DEL APICULTOR 

def calcular_antiguedad(fecha_ingreso, fecha_final=None):

    if not fecha_ingreso:
        return {
            "anios": 0,
            "meses": 0,
            "dias": 0,
            "texto": "Sin fecha de ingreso",
        }

    fecha_final = fecha_final or timezone.localdate()

    if fecha_ingreso > fecha_final:
        return {
            "anios": 0,
            "meses": 0,
            "dias": 0,
            "texto": "Fecha de ingreso no válida",
        }

    anios = fecha_final.year - fecha_ingreso.year
    meses = fecha_final.month - fecha_ingreso.month
    dias = fecha_final.day - fecha_ingreso.day

    if dias < 0:

        mes_anterior = fecha_final.month - 1
        anio_mes_anterior = fecha_final.year

        if mes_anterior == 0:
            mes_anterior = 12
            anio_mes_anterior -= 1

        dias += monthrange(
            anio_mes_anterior,
            mes_anterior
        )[1]

        meses -= 1

    if meses < 0:
        anios -= 1
        meses += 12

    partes = []

    if anios:
        partes.append(
            f"{anios} año{'s' if anios != 1 else ''}"
        )

    if meses:
        partes.append(
            f"{meses} mes{'es' if meses != 1 else ''}"
        )

    if dias or not partes:
        partes.append(
            f"{dias} día{'s' if dias != 1 else ''}"
        )

    return {
        "anios": anios,
        "meses": meses,
        "dias": dias,
        "texto": ", ".join(partes),
    }

@administrador_requerido
@require_POST
def guardar_vinculacion_apicultor(
    request,
    id_apicultor
):

    apicultor = get_object_or_404(
        Apicultor,
        pk=id_apicultor
    )

    vinculacion = VinculacionApicultor.objects.filter(
        apicultor=apicultor
    ).first()

    formulario = VinculacionApicultorForm(
        request.POST,
        instance=vinculacion
    )

    if formulario.is_valid():

        vinculacion = formulario.save(
            commit=False
        )

        vinculacion.apicultor = apicultor
        vinculacion.save()

        messages.success(
            request,
            "La vinculación laboral fue guardada correctamente."
        )

    else:

        for errores in formulario.errors.values():

            for error in errores:

                messages.error(
                    request,
                    error
                )

    return redirect(
        "perfil_apicultor",
        id_apicultor=apicultor.id_apicultor
    )

@administrador_requerido
@require_POST
def guardar_registro_laboral_mensual(
    request,
    id_apicultor
):

    apicultor = get_object_or_404(
        Apicultor,
        pk=id_apicultor
    )

    formulario = RegistroLaboralMensualForm(
        request.POST
    )

    if formulario.is_valid():

        mes_reporte = formulario.cleaned_data[
            "mes_reporte"
        ]

        registro_existente = (
            RegistroLaboralMensual.objects
            .filter(
                apicultor=apicultor,
                mes_reporte=mes_reporte
            )
            .first()
        )

        if registro_existente:

            registro_existente.dias_trabajados_mes = (
                formulario.cleaned_data[
                    "dias_trabajados_mes"
                ]
            )

            registro_existente.horas_trabajadas_mes = (
                formulario.cleaned_data[
                    "horas_trabajadas_mes"
                ]
            )

            registro_existente.observaciones = (
                formulario.cleaned_data[
                    "observaciones"
                ]
            )

            registro_existente.save()

            messages.success(
                request,
                "El registro mensual fue actualizado correctamente."
            )

        else:

            registro = formulario.save(
                commit=False
            )

            registro.apicultor = apicultor
            registro.save()

            messages.success(
                request,
                "El registro mensual fue creado correctamente."
            )

    else:

        for errores in formulario.errors.values():

            for error in errores:

                messages.error(
                    request,
                    error
                )

    return redirect(
        "perfil_apicultor",
        id_apicultor=apicultor.id_apicultor
    )

@administrador_requerido
def perfil_apicultor(request, id_apicultor):

    apicultor = get_object_or_404(
        Apicultor.objects.select_related(
            "user",
            "id_rol"
        ),
        pk=id_apicultor
    )

    apiarios = (
        apicultor.apiarios
        .all()
        .order_by("nombreapiario")
    )

    resumen = apiarios.aggregate(
        total_apiarios=Count("id_apiario"),
        total_colmenas=Sum("cantidadcolmenas")
    )

    total_apiarios = (
        resumen["total_apiarios"] or 0
    )

    total_colmenas = (
        resumen["total_colmenas"] or 0
    )

    vinculacion = (
        VinculacionApicultor.objects
        .filter(apicultor=apicultor)
        .first()
    )

    registros_laborales = (
        RegistroLaboralMensual.objects
        .filter(apicultor=apicultor)
        .order_by("-mes_reporte")
    )

    mes_actual = (
        timezone.localdate()
        .replace(day=1)
    )

    registro_mes_actual = (
        registros_laborales
        .filter(mes_reporte=mes_actual)
        .first()
    )

    formulario_vinculacion = (
        VinculacionApicultorForm(
            instance=vinculacion
        )
    )

    if registro_mes_actual:

        formulario_registro = (
            RegistroLaboralMensualForm(
                instance=registro_mes_actual
            )
        )

    else:

        formulario_registro = (
            RegistroLaboralMensualForm(
                initial={
                    "mes_reporte": mes_actual
                }
            )
        )

    if vinculacion:

        antiguedad = calcular_antiguedad(
            vinculacion.fecha_ingreso
        )

        dias_habituales = (
            vinculacion.dias_semana_texto()
        )

    else:

        antiguedad = {
            "anios": 0,
            "meses": 0,
            "dias": 0,
            "texto": "Sin registrar",
        }

        dias_habituales = "Sin registrar"

    return render(
        request,
        "admin_panel/apicultores/perfil.html",
        {
            "apicultor": apicultor,
            "apiarios": apiarios,
            "total_apiarios": total_apiarios,
            "total_colmenas": total_colmenas,

            "vinculacion": vinculacion,
            "antiguedad": antiguedad,
            "dias_habituales": dias_habituales,

            "registros_laborales": registros_laborales,
            "registro_mes_actual": registro_mes_actual,

            "formulario_vinculacion": formulario_vinculacion,
            "formulario_registro": formulario_registro,
        }
    )

def obtener_mes_espanol(fecha):

    if not fecha:
        return "Sin registro mensual"

    meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
    ]

    return (
        f"{meses[fecha.month - 1]} "
        f"de {fecha.year}"
    )

@administrador_requerido
@require_GET
def reporte_apicultor_pdf(
    request,
    id_apicultor
):

    # =========================================================
    # IMPORTAR WEASYPRINT
    # =========================================================

    try:
        from weasyprint import HTML

    except (ImportError, OSError) as error:

        print(
            "Error cargando WeasyPrint:",
            type(error).__name__,
            error
        )

        messages.error(
            request,
            (
                "No fue posible cargar WeasyPrint. "
                "Comprueba la instalación y las DLL de Pango."
            )
        )

        return redirect(
            "perfil_apicultor",
            id_apicultor=id_apicultor
        )

    # =========================================================
    # BUSCAR APICULTOR
    # =========================================================

    apicultor = get_object_or_404(
        Apicultor.objects.select_related(
            "user",
            "id_rol"
        ),
        pk=id_apicultor
    )

    apiarios = (
        apicultor.apiarios
        .all()
        .order_by("nombreapiario")
    )

    resumen_apiarios = apiarios.aggregate(
        total_apiarios=Count("id_apiario"),
        total_colmenas=Sum("cantidadcolmenas")
    )

    total_apiarios = (
        resumen_apiarios["total_apiarios"] or 0
    )

    total_colmenas = (
        resumen_apiarios["total_colmenas"] or 0
    )

    # =========================================================
    # VINCULACIÓN LABORAL
    # =========================================================

    vinculacion = (
        VinculacionApicultor.objects
        .filter(apicultor=apicultor)
        .first()
    )

    registros_laborales = (
        RegistroLaboralMensual.objects
        .filter(apicultor=apicultor)
        .order_by("-mes_reporte")
    )

    # =========================================================
    # SELECCIONAR MES
    # =========================================================

    mes_solicitado = request.GET.get(
        "mes",
        ""
    ).strip()

    registro_laboral = None

    if mes_solicitado:

        try:

            fecha_mes = datetime.strptime(
                mes_solicitado,
                "%Y-%m"
            ).date()

            fecha_mes = fecha_mes.replace(day=1)

        except ValueError:

            messages.error(
                request,
                "El mes seleccionado no es válido."
            )

            return redirect(
                "perfil_apicultor",
                id_apicultor=id_apicultor
            )

        registro_laboral = (
            registros_laborales
            .filter(mes_reporte=fecha_mes)
            .first()
        )

        if not registro_laboral:

            messages.error(
                request,
                (
                    "El apicultor no tiene un registro "
                    "laboral para el mes seleccionado."
                )
            )

            return redirect(
                "perfil_apicultor",
                id_apicultor=id_apicultor
            )

    else:

        registro_laboral = (
            registros_laborales.first()
        )

    # =========================================================
    # FECHA DE CORTE PARA LA ANTIGÜEDAD
    # =========================================================

    fecha_actual = timezone.localdate()
    fecha_corte = fecha_actual

    if registro_laboral:

        ultimo_dia = monthrange(
            registro_laboral.mes_reporte.year,
            registro_laboral.mes_reporte.month
        )[1]

        fin_mes_reporte = date(
            registro_laboral.mes_reporte.year,
            registro_laboral.mes_reporte.month,
            ultimo_dia
        )

        # No calcular antigüedad usando una fecha futura.
        fecha_corte = min(
            fin_mes_reporte,
            fecha_actual
        )

    # =========================================================
    # ANTIGÜEDAD Y DÍAS HABITUALES
    # =========================================================

    if vinculacion:

        antiguedad = calcular_antiguedad(
            vinculacion.fecha_ingreso,
            fecha_corte
        )

        dias_habituales = (
            vinculacion.dias_semana_texto()
        )

    else:

        antiguedad = {
            "anios": 0,
            "meses": 0,
            "dias": 0,
            "texto": "Sin registrar",
        }

        dias_habituales = "Sin registrar"

    # =========================================================
    # CÁLCULOS DEL MES
    # =========================================================

    promedio_horas_diarias = 0

    if (
        registro_laboral
        and registro_laboral.dias_trabajados_mes > 0
    ):

        promedio_horas_diarias = round(
            float(
                registro_laboral.horas_trabajadas_mes
            )
            / registro_laboral.dias_trabajados_mes,
            2
        )

    mes_reporte_texto = obtener_mes_espanol(
        registro_laboral.mes_reporte
        if registro_laboral
        else None
    )

    # =========================================================
    # FOTO DEL APICULTOR
    # =========================================================

    foto_uri = None

    try:

        if (
            apicultor.fotoperfil
            and apicultor.fotoperfil.name
        ):

            ruta_foto = Path(
                apicultor.fotoperfil.path
            )

            if ruta_foto.exists():
                foto_uri = ruta_foto.resolve().as_uri()

    except (ValueError, OSError) as error:

        print(
            "No fue posible cargar la foto en el PDF:",
            error
        )

        foto_uri = None

    # =========================================================
    # NOMBRE DEL APICULTOR
    # =========================================================

    nombre_apicultor = ""

    if apicultor.user:

        nombre_apicultor = (
            apicultor.user.get_full_name().strip()
        )

        if not nombre_apicultor:
            nombre_apicultor = (
                apicultor.user.username
            )

    if not nombre_apicultor:
        nombre_apicultor = "Apicultor"

    generado_por = (
        request.user.get_full_name().strip()
        or request.user.username
    )

    historial_laboral = (
        registros_laborales[:6]
    )

    # =========================================================
    # GENERAR HTML
    # =========================================================

    contexto = {
        "apicultor": apicultor,
        "nombre_apicultor": nombre_apicultor,
        "foto_uri": foto_uri,

        "apiarios": apiarios,
        "total_apiarios": total_apiarios,
        "total_colmenas": total_colmenas,

        "vinculacion": vinculacion,
        "antiguedad": antiguedad,
        "dias_habituales": dias_habituales,
        "fecha_corte": fecha_corte,

        "registro_laboral": registro_laboral,
        "mes_reporte_texto": mes_reporte_texto,
        "promedio_horas_diarias": promedio_horas_diarias,
        "historial_laboral": historial_laboral,

        "fecha_generacion": timezone.localtime(),
        "generado_por": generado_por,
    }

    html_string = render_to_string(
        "admin_panel/apicultores/reporte_pdf.html",
        contexto
    )

    # =========================================================
    # CONVERTIR HTML A PDF
    # =========================================================

    try:

        pdf = HTML(
            string=html_string,
            base_url=request.build_absolute_uri("/")
        ).write_pdf()

    except Exception as error:

        print(
            "Error generando PDF:",
            type(error).__name__,
            error
        )

        messages.error(
            request,
            "Ocurrió un error al generar el reporte PDF."
        )

        return redirect(
            "perfil_apicultor",
            id_apicultor=id_apicultor
        )

    # =========================================================
    # RESPUESTA
    # =========================================================

    nombre_archivo = slugify(
        nombre_apicultor
    )

    if registro_laboral:

        periodo_archivo = (
            registro_laboral
            .mes_reporte
            .strftime("%Y-%m")
        )

    else:
        periodo_archivo = "sin-registro-mensual"

    response = HttpResponse(
        pdf,
        content_type="application/pdf"
    )

    response["Content-Disposition"] = (
        f'inline; filename="'
        f'reporte-{nombre_archivo}-'
        f'{periodo_archivo}.pdf"'
    )

    return response
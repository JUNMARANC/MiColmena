from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect,get_object_or_404
from django.core.paginator import Paginator
from django.db.models import Q, Prefetch
from datetime import datetime
from django.utils import timezone
from django.views.decorators.http import require_POST
from django.urls import reverse
from PIL import Image, UnidentifiedImageError
from django.db import transaction


from dbmicolmena.models import (
    Apicultor,
    Apiario,
    Colmena,
    Mantenimiento,
    Incidencia,
    EventoAgenda,
    EvidenciaIncidencia,
    EvidenciaMantenimiento,
)




# ============================================================
# DASHBOARD APICULTOR
# ============================================================

@login_required
def dashboard_apicultor(request):

    # ========================================================
    # OBTENER PERFIL DEL APICULTOR
    # ========================================================

    apicultor = (
        Apicultor.objects
        .filter(
            user=request.user
        )
        .first()
    )


    # ========================================================
    # EL USUARIO NO ES APICULTOR
    # ========================================================

    if not apicultor:

        messages.error(
            request,
            "Tu usuario no tiene un perfil "
            "de apicultor asignado."
        )

        return redirect(
            "login"
        )


    # ========================================================
    # APIARIOS DEL APICULTOR
    # ========================================================

    apiarios = (
        Apiario.objects
        .filter(
            id_apicultor=apicultor
        )
    )


    # ========================================================
    # COLMENAS DE SUS APIARIOS
    # ========================================================

    colmenas = (
        Colmena.objects
        .filter(
            id_apiario__in=apiarios
        )
    )


    # ========================================================
    # MANTENIMIENTOS
    # ========================================================

    mantenimientos_pendientes = (
        Mantenimiento.objects
        .filter(
            id_apiario__in=apiarios,
            estado="Pendiente"
        )
        .count()
    )


    # ========================================================
    # INCIDENCIAS
    # ========================================================

    incidencias_abiertas = (
        Incidencia.objects
        .filter(
            id_apiario__in=apiarios
        )
        .exclude(
            estado__iexact="Cerrada"
        )
        .count()
    )


    # ========================================================
    # PRÓXIMOS EVENTOS
    # ========================================================

    proximos_eventos = (
        EventoAgenda.objects
        .filter(
            responsable=apicultor,
            estado="programado"
        )
        .order_by(
            "fecha",
            "hora"
        )[:5]
    )


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "total_apiarios":
            apiarios.count(),

        "total_colmenas":
            colmenas.count(),

        "mantenimientos_pendientes":
            mantenimientos_pendientes,

        "incidencias_abiertas":
            incidencias_abiertas,

        "proximos_eventos":
            proximos_eventos,
    }


    return render(request,"panel_apicultor/dashboard.html",contexto)




# ============================================================
# MIS APIARIOS
# ============================================================

@login_required
def mis_apiarios(request):

    # ========================================================
    # OBTENER APICULTOR AUTENTICADO
    # ========================================================

    apicultor = (
        Apicultor.objects
        .filter(
            user=request.user
        )
        .first()
    )


    # ========================================================
    # VALIDAR PERFIL
    # ========================================================

    if not apicultor:

        messages.error(
            request,
            "Tu usuario no tiene un perfil "
            "de apicultor asignado."
        )

        return redirect(
            "login"
        )


    # ========================================================
    # APIARIOS DEL APICULTOR
    # ========================================================

    apiarios = (
        Apiario.objects
        .filter(
            id_apicultor=apicultor
        )
        .order_by(
            "nombreapiario"
        )
    )


    # ========================================================
    # BUSCADOR
    # ========================================================

    busqueda = (
        request.GET.get(
            "q",
            ""
        )
        .strip()
    )


    if busqueda:

        apiarios = apiarios.filter(

            Q(
                nombreapiario__icontains=
                    busqueda
            )

            |

            Q(
                ubicacion__icontains=
                    busqueda
            )

        )


    # ========================================================
    # FILTRO POR ESTADO
    # ========================================================

    estado = (
        request.GET.get(
            "estado",
            ""
        )
        .strip()
    )


    if estado:

        apiarios = apiarios.filter(
            estadoapiario__iexact=
                estado
        )


    # ========================================================
    # PAGINACIÓN
    # ========================================================

    paginator = Paginator(
        apiarios,
        6
    )


    pagina = request.GET.get(
        "page"
    )


    apiarios_pagina = (
        paginator.get_page(
            pagina
        )
    )


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "apiarios":
            apiarios_pagina,

        "busqueda":
            busqueda,

        "estado_seleccionado":
            estado,

        "total_resultados":
            paginator.count,
    }


    return render(
        request,
        "panel_apicultor/apiarios.html",
        contexto
    )

# ============================================================
# DETALLE DE APIARIO - APICULTOR
# ============================================================

@login_required
def detalle_apiario_apicultor(
    request,
    id_apiario
):

    # ========================================================
    # OBTENER APICULTOR AUTENTICADO
    # ========================================================

    apicultor = (
        Apicultor.objects
        .filter(
            user=request.user
        )
        .first()
    )


    # ========================================================
    # VALIDAR PERFIL
    # ========================================================

    if not apicultor:

        messages.error(
            request,
            "Tu usuario no tiene un perfil "
            "de apicultor asignado."
        )

        return redirect(
            "login"
        )


    # ========================================================
    # OBTENER APIARIO
    #
    # IMPORTANTE:
    # Solo puede consultar apiarios que le pertenezcan.
    # ========================================================

    apiario = get_object_or_404(
        Apiario,
        id_apiario=id_apiario,
        id_apicultor=apicultor
    )


    # ========================================================
    # COLMENAS DEL APIARIO
    # ========================================================

    colmenas = (
        Colmena.objects
        .filter(
            id_apiario=apiario
        )
        .order_by(
            "codigocolmena"
        )
    )


    # ========================================================
    # CONTEO POR ESTADO
    # ========================================================

    colmenas_activas = (
        colmenas
        .filter(
            estadocolmena__iexact="Activa"
        )
        .count()
    )


    colmenas_riesgo = (
        colmenas
        .filter(
            estadocolmena__iexact="Riesgo"
        )
        .count()
    )


    colmenas_revision = (
        colmenas
        .filter(
            estadocolmena__iexact="Revisión"
        )
        .count()
    )


    colmenas_inactivas = (
        colmenas
        .filter(
            estadocolmena__iexact="Inactiva"
        )
        .count()
    )


    # ========================================================
    # PREPARAR INFORMACIÓN DE CADA COLMENA
    # ========================================================

    colmenas_detalle = []


    for colmena in colmenas:

        # ====================================================
        # ÚLTIMO MANTENIMIENTO COMPLETADO
        # ====================================================

        ultimo_mantenimiento = (
            Mantenimiento.objects
            .filter(
                id_colmena=colmena,
                estado="Completado"
            )
            .order_by(
                "-fechaejecucion"
            )
            .first()
        )


        # ====================================================
        # INCIDENCIAS DE LA COLMENA
        #
        # Por ahora contamos las registradas.
        # Después ajustamos aquí cuáles estados
        # consideramos "activas".
        # ====================================================

        total_incidencias = (
            Incidencia.objects
            .filter(
                id_colmena=colmena
            )
            .count()
        )


        colmenas_detalle.append(
            {
                "colmena":
                    colmena,

                "ultimo_mantenimiento":
                    ultimo_mantenimiento,

                "total_incidencias":
                    total_incidencias,
            }
        )


    # ========================================================
    # ÚLTIMA ACTIVIDAD / REVISIÓN DEL APIARIO
    # ========================================================

    ultimo_mantenimiento_apiario = (
        Mantenimiento.objects
        .filter(
            id_apiario=apiario,
            estado="Completado"
        )
        .order_by(
            "-fechaejecucion"
        )
        .first()
    )


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "apiario":
            apiario,

        "colmenas_detalle":
            colmenas_detalle,

        "total_colmenas":
            colmenas.count(),

        "colmenas_activas":
            colmenas_activas,

        "colmenas_riesgo":
            colmenas_riesgo,

        "colmenas_revision":
            colmenas_revision,

        "colmenas_inactivas":
            colmenas_inactivas,

        "ultimo_mantenimiento_apiario":
            ultimo_mantenimiento_apiario,
    }


    return render(
        request,
        "panel_apicultor/detalle_apiario.html",
        contexto
    )


# ============================================================
# MIS COLMENAS - APICULTOR
# ============================================================

@login_required
def mis_colmenas(request):

    # ========================================================
    # OBTENER APICULTOR AUTENTICADO
    # ========================================================

    apicultor = (
        Apicultor.objects
        .filter(
            user=request.user
        )
        .first()
    )


    # ========================================================
    # VALIDAR PERFIL
    # ========================================================

    if not apicultor:

        messages.error(
            request,
            "Tu usuario no tiene un perfil "
            "de apicultor asignado."
        )

        return redirect(
            "login"
        )


    # ========================================================
    # APIARIOS DEL APICULTOR
    # ========================================================

    apiarios = (
        Apiario.objects
        .filter(
            id_apicultor=apicultor
        )
        .order_by(
            "nombreapiario"
        )
    )


    # ========================================================
    # COLMENAS
    #
    # IMPORTANTE:
    # Solo pertenecientes a los apiarios del apicultor.
    # ========================================================

    colmenas = (
        Colmena.objects
        .filter(
            id_apiario__in=apiarios
        )
        .select_related(
            "id_apiario"
        )
        .order_by(
            "codigocolmena"
        )
    )


    # ========================================================
    # DATOS GENERALES ANTES DE FILTRAR
    # ========================================================

    total_colmenas = (
        colmenas.count()
    )


    total_activas = (
        colmenas
        .filter(
            estadocolmena__iexact="Activa"
        )
        .count()
    )


    total_revision = (
        colmenas
        .filter(
            estadocolmena__iexact="Revisión"
        )
        .count()
    )


    total_riesgo = (
        colmenas
        .filter(
            estadocolmena__iexact="Riesgo"
        )
        .count()
    )


    total_inactivas = (
        colmenas
        .filter(
            estadocolmena__iexact="Inactiva"
        )
        .count()
    )


    # ========================================================
    # BUSCADOR
    # ========================================================

    busqueda = (
        request.GET.get(
            "q",
            ""
        )
        .strip()
    )


    if busqueda:

        colmenas = (
            colmenas.filter(

                Q(
                    codigocolmena__icontains=
                        busqueda
                )

                |

                Q(
                    descripcion__icontains=
                        busqueda
                )

                |

                Q(
                    id_apiario__nombreapiario__icontains=
                        busqueda
                )

            )
        )


    # ========================================================
    # FILTRO POR APIARIO
    # ========================================================

    apiario_seleccionado = (
        request.GET.get(
            "apiario",
            ""
        )
        .strip()
    )


    if apiario_seleccionado.isdigit():

        colmenas = (
            colmenas.filter(
                id_apiario__id_apiario=
                    int(apiario_seleccionado)
            )
        )


    # ========================================================
    # FILTRO POR ESTADO
    # ========================================================

    estado_seleccionado = (
        request.GET.get(
            "estado",
            ""
        )
        .strip()
    )


    estados_permitidos = [
        "Activa",
        "Riesgo",
        "Revisión",
        "Inactiva",
    ]


    if estado_seleccionado in estados_permitidos:

        colmenas = (
            colmenas.filter(
                estadocolmena__iexact=
                    estado_seleccionado
            )
        )


    # ========================================================
    # PAGINACIÓN
    # ========================================================

    paginator = Paginator(
        colmenas,
        8
    )


    numero_pagina = (
        request.GET.get(
            "page"
        )
    )


    colmenas_pagina = (
        paginator.get_page(
            numero_pagina
        )
    )


    # ========================================================
    # DATOS ADICIONALES DE CADA COLMENA
    # ========================================================

    for colmena in colmenas_pagina:

        # Último mantenimiento completado
        colmena.ultimo_mantenimiento = (
            Mantenimiento.objects
            .filter(
                id_colmena=colmena,
                estado="Completado"
            )
            .order_by(
                "-fechaejecucion"
            )
            .first()
        )


        # Incidencias registradas
        colmena.total_incidencias = (
            Incidencia.objects
            .filter(
                id_colmena=colmena
            )
            .count()
        )


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "apiarios":
            apiarios,

        "colmenas":
            colmenas_pagina,

        "total_resultados":
            paginator.count,

        "total_colmenas":
            total_colmenas,

        "total_activas":
            total_activas,

        "total_revision":
            total_revision,

        "total_riesgo":
            total_riesgo,

        "total_inactivas":
            total_inactivas,

        "busqueda":
            busqueda,

        "apiario_seleccionado":
            apiario_seleccionado,

        "estado_seleccionado":
            estado_seleccionado,
    }


    return render(
        request,
        "panel_apicultor/colmenas.html",
        contexto
    )


# ============================================================
# VALIDAR IMAGEN DE EVIDENCIA
# MANTENIMIENTOS
# ============================================================

def validar_imagen_mantenimiento(archivo):

    LIMITE_MB = 5

    LIMITE_BYTES = (
        LIMITE_MB
        * 1024
        * 1024
    )

    FORMATOS_VALIDOS = {
        "JPEG",
        "PNG",
        "WEBP",
    }


    # ========================================================
    # ARCHIVO
    # ========================================================

    if not archivo:

        return (
            "No se pudo leer una de las fotografías "
            "seleccionadas."
        )


    if archivo.size <= 0:

        return (
            f'La imagen "{archivo.name}" está vacía.'
        )


    # ========================================================
    # TAMAÑO
    # ========================================================

    if archivo.size > LIMITE_BYTES:

        return (
            f'La imagen "{archivo.name}" supera '
            f"el límite de {LIMITE_MB} MB."
        )


    # ========================================================
    # MIME
    # ========================================================

    tipo_archivo = getattr(
        archivo,
        "content_type",
        ""
    )


    if (
        tipo_archivo
        and
        not tipo_archivo.startswith("image/")
    ):

        return (
            f'El archivo "{archivo.name}" '
            "no es una imagen válida."
        )


    # ========================================================
    # VALIDAR CONTENIDO REAL
    # ========================================================

    try:

        archivo.seek(0)

        imagen = Image.open(
            archivo
        )

        formato = (
            imagen.format
            or ""
        ).upper()

        imagen.verify()


        if formato not in FORMATOS_VALIDOS:

            return (
                f'La imagen "{archivo.name}" tiene un '
                "formato no permitido. "
                "Utiliza JPG, PNG o WEBP."
            )


    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
    ):

        return (
            f'El archivo "{archivo.name}" '
            "no contiene una imagen válida."
        )


    finally:

        try:
            archivo.seek(0)

        except Exception:
            pass


    return None


# ============================================================
# REGISTRAR MANTENIMIENTO - APICULTOR
# ============================================================

@login_required
def registrar_mantenimiento_apicultor(
    request,
    id_colmena
):

    # ========================================================
    # OBTENER APICULTOR AUTENTICADO
    # ========================================================

    apicultor = (
        Apicultor.objects
        .filter(
            user=request.user
        )
        .first()
    )


    # ========================================================
    # VALIDAR PERFIL
    # ========================================================

    if not apicultor:

        messages.error(
            request,
            "Tu usuario no tiene un perfil de apicultor asignado."
        )

        return redirect(
            "login"
        )


    # ========================================================
    # OBTENER COLMENA
    #
    # SEGURIDAD:
    # solamente puede registrar mantenimientos
    # sobre colmenas pertenecientes a sus apiarios.
    # ========================================================

    colmena = get_object_or_404(
        Colmena,
        id_colmena=id_colmena,
        id_apiario__id_apicultor=apicultor
    )


    # ========================================================
    # APIARIO AUTOMÁTICO
    # ========================================================

    apiario = colmena.id_apiario


    # ========================================================
    # PROCESAR FORMULARIO
    # ========================================================

    if request.method == "POST":

        tipo = (
            request.POST.get(
                "tipo",
                ""
            )
            .strip()
        )


        fecha_ejecucion = (
            request.POST.get(
                "fecha_ejecucion",
                ""
            )
            .strip()
        )


        estado = (
            request.POST.get(
                "estado",
                ""
            )
            .strip()
        )


        prioridad = (
            request.POST.get(
                "prioridad",
                ""
            )
            .strip()
        )


        observaciones = (
            request.POST.get(
                "observaciones",
                ""
            )
            .strip()
        )


        # ====================================================
        # VALIDACIONES
        # ====================================================

        errores = []


        if not tipo:

            errores.append(
                "Debes ingresar el tipo de mantenimiento."
            )


        if len(tipo) > 100:

            errores.append(
                "El tipo de mantenimiento no puede superar los 100 caracteres."
            )


        # ====================================================
        # VALIDAR FECHA
        # ====================================================

        fecha_convertida = None


        if not fecha_ejecucion:

            errores.append(
                "Debes seleccionar la fecha del mantenimiento."
            )

        else:

            try:

                fecha_convertida = (
                    datetime.strptime(
                        fecha_ejecucion,
                        "%Y-%m-%d"
                    )
                    .date()
                )

            except ValueError:

                errores.append(
                    "La fecha del mantenimiento no es válida."
                )


        # ====================================================
        # VALIDAR ESTADO
        # ====================================================

        estados_validos = [
            "Pendiente",
            "Completado",
            "Cancelado",
        ]


        if estado not in estados_validos:

            errores.append(
                "Selecciona un estado válido."
            )


        # ====================================================
        # VALIDAR PRIORIDAD
        # ====================================================

        prioridades_validas = [
            "Baja",
            "Media",
            "Alta",
            "Crítica",
        ]


        if prioridad not in prioridades_validas:

            errores.append(
                "Selecciona una prioridad válida."
            )


        # ====================================================
        # OBSERVACIONES
        # ====================================================

        if len(observaciones) > 1000:

            errores.append(
                "Las observaciones son demasiado extensas."
            )


        # ====================================================
        # MOSTRAR ERRORES
        # ====================================================

        if errores:

            for error in errores:

                messages.error(
                    request,
                    error
                )


        else:

            # =================================================
            # RESPONSABLE
            # =================================================

            responsable = (
                request.user.get_full_name()
                or
                request.user.username
            )


            # =================================================
            # CREAR MANTENIMIENTO
            # =================================================

            Mantenimiento.objects.create(

                id_apiario=
                    apiario,

                id_colmena=
                    colmena,

                entidadmantenimiento=
                    "Colmena",

                tipo=
                    tipo,

                fechaejecucion=
                    fecha_convertida,

                estado=
                    estado,

                prioridad=
                    prioridad,

                observaciones=
                    observaciones,

                responsable=
                    responsable,

            )


            messages.success(
                request,
                "El mantenimiento fue registrado correctamente."
            )


            return redirect(
                "colmenas_apicultor"
            )


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "apiario":
            apiario,

        "colmena":
            colmena,

        "fecha_hoy":
            timezone.localdate().isoformat(),

    }


    return render(
        request,
        "panel_apicultor/registrar_mantenimiento.html",
        contexto
    )



# ============================================================
# ACCESO RÁPIDO
# REPORTAR INCIDENCIA DESDE UNA COLMENA
# ============================================================

@login_required
def reportar_incidencia_apicultor(
    request,
    id_colmena
):

    # ========================================================
    # APICULTOR
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # VALIDAR QUE LA COLMENA SEA SUYA
    # ========================================================

    colmena = get_object_or_404(

        Colmena,

        id_colmena=id_colmena,

        id_apiario__id_apicultor=apicultor

    )


    # ========================================================
    # REDIRIGIR AL NUEVO FORMULARIO
    #
    # Quedará preseleccionada la colmena.
    # ========================================================

    url = reverse(
        "crear_incidencia_apicultor"
    )


    return redirect(
        f"{url}?colmena={colmena.id_colmena}"
    )



# ============================================================
# MANTENIMIENTOS
# PANEL APICULTOR
# ============================================================

@login_required
def mantenimientos_apicultor(request):


    # ========================================================
    # APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # APIARIOS DEL APICULTOR
    # ========================================================

    apiarios = (
        Apiario.objects
        .filter(
            id_apicultor=apicultor
        )
        .order_by(
            "nombreapiario"
        )
    )


    # ========================================================
    # COLMENAS DEL APICULTOR
    # ========================================================

    colmenas = (
        Colmena.objects
        .filter(
            id_apiario__id_apicultor=apicultor
        )
        .select_related(
            "id_apiario"
        )
        .order_by(
            "id_apiario__nombreapiario",
            "codigocolmena"
        )
    )


    # ========================================================
    # REGLA DE ACCESO
    #
    # Un mantenimiento pertenece al apicultor cuando:
    #
    # 1. Está directamente asociado a uno de sus apiarios.
    #
    # O
    #
    # 2. Está asociado a una colmena perteneciente
    #    a uno de sus apiarios.
    # ========================================================

    acceso_mantenimiento = (

        Q(
            id_apiario__id_apicultor=apicultor
        )

        |

        Q(
            id_colmena__id_apiario__id_apicultor=apicultor
        )

    )


    # ========================================================
    # EVIDENCIAS
    # ========================================================

    evidencias_antes = Prefetch(

        "evidencias",

        queryset=(
            EvidenciaMantenimiento.objects
            .filter(
                tipo=
                EvidenciaMantenimiento
                .TipoEvidencia
                .ANTES
            )
            .select_related(
                "subido_por"
            )
        ),

        to_attr=
            "evidencias_antes_apicultor"
    )


    evidencias_durante = Prefetch(

        "evidencias",

        queryset=(
            EvidenciaMantenimiento.objects
            .filter(
                tipo=
                EvidenciaMantenimiento
                .TipoEvidencia
                .DURANTE
            )
            .select_related(
                "subido_por"
            )
        ),

        to_attr=
            "evidencias_durante_apicultor"
    )


    evidencias_despues = Prefetch(

        "evidencias",

        queryset=(
            EvidenciaMantenimiento.objects
            .filter(
                tipo=
                EvidenciaMantenimiento
                .TipoEvidencia
                .DESPUES
            )
            .select_related(
                "subido_por"
            )
        ),

        to_attr=
            "evidencias_despues_apicultor"
    )


    # ========================================================
    # TODOS LOS MANTENIMIENTOS DEL APICULTOR
    # ========================================================

    mantenimientos_base = (

        Mantenimiento.objects

        .select_related(
            "id_apiario",
            "id_colmena",
            "id_colmena__id_apiario"
        )

        .filter(
            acceso_mantenimiento
        )

        .distinct()

        .prefetch_related(
            evidencias_antes,
            evidencias_durante,
            evidencias_despues,
        )

    )


    # ========================================================
    # CONTADORES
    # ANTES DE APLICAR FILTROS
    # ========================================================

    total_mantenimientos = (
        mantenimientos_base.count()
    )


    total_pendientes = (
        mantenimientos_base
        .filter(
            estado="Pendiente"
        )
        .count()
    )


    total_completados = (
        mantenimientos_base
        .filter(
            estado="Completado"
        )
        .count()
    )


    total_cancelados = (
        mantenimientos_base
        .filter(
            estado="Cancelado"
        )
        .count()
    )


    # ========================================================
    # FILTROS
    # ========================================================

    busqueda = (
        request.GET
        .get(
            "q",
            ""
        )
        .strip()
    )


    apiario_seleccionado = (
        request.GET
        .get(
            "apiario",
            ""
        )
        .strip()
    )


    estado_seleccionado = (
        request.GET
        .get(
            "estado",
            ""
        )
        .strip()
    )


    prioridad_seleccionada = (
        request.GET
        .get(
            "prioridad",
            ""
        )
        .strip()
    )


    estados_disponibles = [
        "Pendiente",
        "Completado",
        "Cancelado",
    ]


    prioridades_disponibles = [
        "Baja",
        "Media",
        "Alta",
        "Crítica",
    ]


    mantenimientos = (
        mantenimientos_base
    )


    # ========================================================
    # TRABAJOS ACTIVOS POR DEFECTO
    # ========================================================

    if not estado_seleccionado:

        mantenimientos = (
            mantenimientos.exclude(
                estado__in=[
                    "Completado",
                    "Cancelado",
                ]
            )
        )


    # ========================================================
    # BÚSQUEDA
    # ========================================================

    if busqueda:

        mantenimientos = (
            mantenimientos.filter(

                Q(
                    tipo__icontains=busqueda
                )

                |

                Q(
                    observaciones__icontains=busqueda
                )

                |

                Q(
                    responsable__icontains=busqueda
                )

                |

                Q(
                    id_apiario__nombreapiario__icontains=busqueda
                )

                |

                Q(
                    id_colmena__codigocolmena__icontains=busqueda
                )

            )
        )


    # ========================================================
    # FILTRO POR APIARIO
    # ========================================================

    if apiario_seleccionado.isdigit():

        id_apiario_filtro = int(
            apiario_seleccionado
        )


        # Verificar que sea suyo.

        if apiarios.filter(
            id_apiario=id_apiario_filtro
        ).exists():

            mantenimientos = (
                mantenimientos.filter(

                    Q(
                        id_apiario_id=
                        id_apiario_filtro
                    )

                    |

                    Q(
                        id_colmena__id_apiario_id=
                        id_apiario_filtro
                    )

                )
                .distinct()
            )


    # ========================================================
    # FILTRO POR ESTADO
    # ========================================================

    if (
        estado_seleccionado
        and
        estado_seleccionado
        in estados_disponibles
    ):

        mantenimientos = (
            mantenimientos.filter(
                estado=
                estado_seleccionado
            )
        )


    # ========================================================
    # FILTRO POR PRIORIDAD
    # ========================================================

    if (
        prioridad_seleccionada
        and
        prioridad_seleccionada
        in prioridades_disponibles
    ):

        mantenimientos = (
            mantenimientos.filter(
                prioridad=
                prioridad_seleccionada
            )
        )


    # ========================================================
    # ORDEN
    # ========================================================

    mantenimientos = (
        mantenimientos
        .order_by(
            "-fechaejecucion",
            "-id_mantenimiento"
        )
    )


    # ========================================================
    # PAGINACIÓN
    # ========================================================

    paginator = Paginator(
        mantenimientos,
        10
    )


    pagina = request.GET.get(
        "page"
    )


    mantenimientos_pagina = (
        paginator.get_page(
            pagina
        )
    )


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "apiarios":
            apiarios,

        "colmenas":
            colmenas,

        "mantenimientos":
            mantenimientos_pagina,


        # ----------------------------------------------------
        # CONTADORES
        # ----------------------------------------------------

        "total_mantenimientos":
            total_mantenimientos,

        "total_pendientes":
            total_pendientes,

        "total_completados":
            total_completados,

        "total_cancelados":
            total_cancelados,

        "total_resultados":
            paginator.count,


        # ----------------------------------------------------
        # FILTROS
        # ----------------------------------------------------

        "busqueda":
            busqueda,

        "apiario_seleccionado":
            apiario_seleccionado,

        "estado_seleccionado":
            estado_seleccionado,

        "prioridad_seleccionada":
            prioridad_seleccionada,


        # ----------------------------------------------------
        # OPCIONES
        # ----------------------------------------------------

        "estados_disponibles":
            estados_disponibles,

        "prioridades_disponibles":
            prioridades_disponibles,


        # ----------------------------------------------------
        # EVIDENCIAS
        # ----------------------------------------------------

        "max_evidencias_mantenimiento":
            6,

        "max_tamano_imagen_mb":
            5,

        "fecha_hoy":
            timezone.localdate(),

    }


    return render(
        request,
        "panel_apicultor/mantenimientos.html",
        contexto
    )



# ============================================================
# CREAR MANTENIMIENTO
# PANEL APICULTOR
# ============================================================

@login_required
@require_POST
def crear_mantenimiento_apicultor(request):


    MAX_EVIDENCIAS = 6


    # ========================================================
    # APICULTOR
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # DATOS
    # ========================================================

    entidad = (
        request.POST
        .get(
            "entidad_mantenimiento",
            ""
        )
        .strip()
    )


    id_apiario = (
        request.POST
        .get(
            "id_apiario",
            ""
        )
        .strip()
    )


    id_colmena = (
        request.POST
        .get(
            "id_colmena",
            ""
        )
        .strip()
    )


    tipo = (
        request.POST
        .get(
            "tipo",
            ""
        )
        .strip()
    )


    fecha_texto = (
        request.POST
        .get(
            "fecha_ejecucion",
            ""
        )
        .strip()
    )


    prioridad = (
        request.POST
        .get(
            "prioridad",
            ""
        )
        .strip()
    )


    observaciones = (
        request.POST
        .get(
            "observaciones",
            ""
        )
        .strip()
    )


    # ========================================================
    # FOTOGRAFÍAS
    # ========================================================

    evidencias_antes = (
        request.FILES.getlist(
            "evidencias_antes"
        )
    )


    evidencias_durante = (
        request.FILES.getlist(
            "evidencias_durante"
        )
    )


    evidencias_despues = (
        request.FILES.getlist(
            "evidencias_despues"
        )
    )


    todas_evidencias = (
        evidencias_antes
        +
        evidencias_durante
        +
        evidencias_despues
    )


    # ========================================================
    # VALIDACIONES
    # ========================================================

    errores = []


    if entidad not in [
        "Apiario",
        "Colmena",
    ]:

        errores.append(
            "Debes indicar si el mantenimiento "
            "corresponde a un apiario o una colmena."
        )


    if not tipo:

        errores.append(
            "Debes indicar la tarea de mantenimiento."
        )


    elif len(tipo) > 100:

        errores.append(
            "La tarea no puede superar los 100 caracteres."
        )


    prioridades_validas = [
        "Baja",
        "Media",
        "Alta",
        "Crítica",
    ]


    if prioridad not in prioridades_validas:

        errores.append(
            "Selecciona una prioridad válida."
        )


    if len(observaciones) > 255:

        errores.append(
            "Las observaciones no pueden superar "
            "los 255 caracteres."
        )


    # ========================================================
    # FECHA
    # ========================================================

    fecha_ejecucion = None


    try:

        fecha_ejecucion = datetime.strptime(
            fecha_texto,
            "%Y-%m-%d"
        ).date()


    except (
        TypeError,
        ValueError,
    ):

        errores.append(
            "Selecciona una fecha válida."
        )


    if (
        fecha_ejecucion
        and
        fecha_ejecucion < timezone.localdate()
    ):

        errores.append(
            "La fecha programada no puede ser anterior a hoy."
        )


    # ========================================================
    # APIARIO
    # ========================================================

    apiario = None


    if id_apiario.isdigit():

        apiario = (
            Apiario.objects
            .filter(
                id_apiario=int(
                    id_apiario
                ),
                id_apicultor=apicultor
            )
            .first()
        )


    if not apiario:

        errores.append(
            "El apiario seleccionado no pertenece "
            "a tus apiarios asignados."
        )


    # ========================================================
    # COLMENA
    # ========================================================

    colmena = None


    if (
        entidad == "Colmena"
        and
        apiario
    ):

        if not id_colmena.isdigit():

            errores.append(
                "Debes seleccionar una colmena."
            )

        else:

            colmena = (
                Colmena.objects
                .filter(
                    id_colmena=int(
                        id_colmena
                    ),
                    id_apiario=apiario,
                    id_apiario__id_apicultor=apicultor
                )
                .first()
            )


            if not colmena:

                errores.append(
                    "La colmena seleccionada no pertenece "
                    "al apiario indicado."
                )


    # ========================================================
    # CANTIDAD DE FOTOS
    # ========================================================

    if len(todas_evidencias) > MAX_EVIDENCIAS:

        errores.append(
            "Puedes agregar un máximo de "
            "6 fotografías por mantenimiento."
        )


    # ========================================================
    # VALIDAR CADA FOTO
    # ========================================================

    if len(todas_evidencias) <= MAX_EVIDENCIAS:

        for imagen in todas_evidencias:

            error_imagen = (
                validar_imagen_mantenimiento(
                    imagen
                )
            )


            if error_imagen:

                errores.append(
                    error_imagen
                )


    # ========================================================
    # SI HAY ERRORES
    # ========================================================

    if errores:

        for error in errores:

            messages.error(
                request,
                error
            )


        return redirect(
            "mantenimientos_apicultor"
        )


    # ========================================================
    # RESPONSABLE
    # ========================================================

    responsable = (
        request.user
        .get_full_name()
        .strip()
    )


    if not responsable:

        responsable = (
            request.user.username
        )


    # ========================================================
    # CREAR
    # ========================================================

    try:

        with transaction.atomic():


            mantenimiento = (
                Mantenimiento.objects.create(

                    id_apiario=
                        apiario,

                    id_colmena=
                        colmena,

                    entidadmantenimiento=
                        entidad,

                    tipo=
                        tipo,

                    fechaejecucion=
                        fecha_ejecucion,

                    estado=
                        "Pendiente",

                    prioridad=
                        prioridad,

                    observaciones=
                        observaciones,

                    responsable=
                        responsable,
                )
            )


            # ==================================================
            # ANTES
            # ==================================================

            for imagen in evidencias_antes:

                imagen.seek(0)

                EvidenciaMantenimiento.objects.create(

                    id_mantenimiento=
                        mantenimiento,

                    tipo=
                        EvidenciaMantenimiento
                        .TipoEvidencia
                        .ANTES,

                    imagen=
                        imagen,

                    subido_por=
                        request.user,
                )


            # ==================================================
            # DURANTE
            # ==================================================

            for imagen in evidencias_durante:

                imagen.seek(0)

                EvidenciaMantenimiento.objects.create(

                    id_mantenimiento=
                        mantenimiento,

                    tipo=
                        EvidenciaMantenimiento
                        .TipoEvidencia
                        .DURANTE,

                    imagen=
                        imagen,

                    subido_por=
                        request.user,
                )


            # ==================================================
            # DESPUÉS
            # ==================================================

            for imagen in evidencias_despues:

                imagen.seek(0)

                EvidenciaMantenimiento.objects.create(

                    id_mantenimiento=
                        mantenimiento,

                    tipo=
                        EvidenciaMantenimiento
                        .TipoEvidencia
                        .DESPUES,

                    imagen=
                        imagen,

                    subido_por=
                        request.user,
                )


    except Exception:

        messages.error(
            request,
            "No fue posible registrar el mantenimiento. "
            "Inténtalo nuevamente."
        )


        return redirect(
            "mantenimientos_apicultor"
        )


    messages.success(
        request,
        "El mantenimiento fue registrado correctamente."
    )


    return redirect(
        "mantenimientos_apicultor"
    )



# ============================================================
# EDITAR MANTENIMIENTO
# PANEL APICULTOR
# ============================================================

@login_required
@require_POST
def editar_mantenimiento_apicultor(
    request,
    id_mantenimiento
):

    MAX_EVIDENCIAS = 6


    # ========================================================
    # APICULTOR
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # ACCESO
    # ========================================================

    acceso_mantenimiento = (

        Q(
            id_apiario__id_apicultor=apicultor
        )

        |

        Q(
            id_colmena__id_apiario__id_apicultor=apicultor
        )

    )


    mantenimiento = get_object_or_404(

        Mantenimiento.objects
        .filter(
            acceso_mantenimiento
        )
        .distinct(),

        id_mantenimiento=
            id_mantenimiento
    )


    # ========================================================
    # DATOS
    # ========================================================

    entidad = (
        request.POST
        .get(
            "entidad_mantenimiento",
            ""
        )
        .strip()
    )


    id_apiario = (
        request.POST
        .get(
            "id_apiario",
            ""
        )
        .strip()
    )


    id_colmena = (
        request.POST
        .get(
            "id_colmena",
            ""
        )
        .strip()
    )


    tipo = (
        request.POST
        .get(
            "tipo",
            ""
        )
        .strip()
    )


    fecha_texto = (
        request.POST
        .get(
            "fecha_ejecucion",
            ""
        )
        .strip()
    )


    estado = (
        request.POST
        .get(
            "estado",
            ""
        )
        .strip()
    )


    prioridad = (
        request.POST
        .get(
            "prioridad",
            ""
        )
        .strip()
    )


    observaciones = (
        request.POST
        .get(
            "observaciones",
            ""
        )
        .strip()
    )


    # ========================================================
    # FOTOS NUEVAS
    # ========================================================

    evidencias_antes = (
        request.FILES.getlist(
            "evidencias_antes"
        )
    )


    evidencias_durante = (
        request.FILES.getlist(
            "evidencias_durante"
        )
    )


    evidencias_despues = (
        request.FILES.getlist(
            "evidencias_despues"
        )
    )


    nuevas_evidencias = (
        evidencias_antes
        +
        evidencias_durante
        +
        evidencias_despues
    )


    # ========================================================
    # VALIDACIONES
    # ========================================================

    errores = []


    if entidad not in [
        "Apiario",
        "Colmena",
    ]:

        errores.append(
            "Selecciona un alcance válido."
        )


    if not tipo:

        errores.append(
            "La tarea del mantenimiento es obligatoria."
        )


    elif len(tipo) > 100:

        errores.append(
            "La tarea no puede superar los 100 caracteres."
        )


    estados_validos = [
        "Pendiente",
        "Completado",
        "Cancelado",
    ]


    if estado not in estados_validos:

        errores.append(
            "Selecciona un estado válido."
        )


    prioridades_validas = [
        "Baja",
        "Media",
        "Alta",
        "Crítica",
    ]


    if prioridad not in prioridades_validas:

        errores.append(
            "Selecciona una prioridad válida."
        )


    if len(observaciones) > 255:

        errores.append(
            "Las observaciones no pueden superar "
            "los 255 caracteres."
        )


    # ========================================================
    # APIARIO
    # ========================================================

    apiario = None


    if id_apiario.isdigit():

        apiario = (
            Apiario.objects
            .filter(
                id_apiario=int(
                    id_apiario
                ),
                id_apicultor=apicultor
            )
            .first()
        )


    if not apiario:

        errores.append(
            "El apiario seleccionado no pertenece "
            "a tus apiarios asignados."
        )


    # ========================================================
    # COLMENA
    # ========================================================

    colmena = None


    if (
        entidad == "Colmena"
        and
        apiario
    ):

        if not id_colmena.isdigit():

            errores.append(
                "Debes seleccionar una colmena."
            )

        else:

            colmena = (
                Colmena.objects
                .filter(
                    id_colmena=int(
                        id_colmena
                    ),
                    id_apiario=apiario,
                    id_apiario__id_apicultor=apicultor
                )
                .first()
            )


            if not colmena:

                errores.append(
                    "La colmena seleccionada no pertenece "
                    "al apiario indicado."
                )


    # ========================================================
    # FECHA
    # ========================================================

    fecha_ejecucion = None


    try:

        fecha_ejecucion = datetime.strptime(
            fecha_texto,
            "%Y-%m-%d"
        ).date()


    except (
        TypeError,
        ValueError,
    ):

        errores.append(
            "Selecciona una fecha válida."
        )


    hoy = timezone.localdate()


    if fecha_ejecucion:

        fecha_original = (
            mantenimiento.fechaejecucion
        )


        # Si la fecha original ya venció,
        # solamente permitimos conservarla.

        if (
            fecha_original
            and
            fecha_original < hoy
        ):

            if fecha_ejecucion != fecha_original:

                errores.append(
                    "La fecha de este mantenimiento ya venció "
                    "y no puede modificarse."
                )


        elif fecha_ejecucion < hoy:

            errores.append(
                "La fecha programada no puede ser anterior a hoy."
            )


    # ========================================================
    # FOTOS
    # ========================================================

    cantidad_existente = (
        mantenimiento
        .evidencias
        .count()
    )


    cantidad_total = (
        cantidad_existente
        +
        len(
            nuevas_evidencias
        )
    )


    if cantidad_total > MAX_EVIDENCIAS:

        disponibles = max(
            0,
            MAX_EVIDENCIAS
            -
            cantidad_existente
        )


        errores.append(
            "Este mantenimiento puede tener máximo "
            "6 fotografías en total. "
            f"Actualmente puedes agregar {disponibles} más."
        )


    if cantidad_total <= MAX_EVIDENCIAS:

        for imagen in nuevas_evidencias:

            error_imagen = (
                validar_imagen_mantenimiento(
                    imagen
                )
            )


            if error_imagen:

                errores.append(
                    error_imagen
                )


    # ========================================================
    # ERRORES
    # ========================================================

    if errores:

        for error in errores:

            messages.error(
                request,
                error
            )


        return redirect(
            "mantenimientos_apicultor"
        )


    # ========================================================
    # ACTUALIZAR
    # ========================================================

    try:

        with transaction.atomic():


            mantenimiento.id_apiario = (
                apiario
            )


            mantenimiento.id_colmena = (
                colmena
            )


            mantenimiento.entidadmantenimiento = (
                entidad
            )


            mantenimiento.tipo = (
                tipo
            )


            mantenimiento.fechaejecucion = (
                fecha_ejecucion
            )


            mantenimiento.estado = (
                estado
            )


            mantenimiento.prioridad = (
                prioridad
            )


            mantenimiento.observaciones = (
                observaciones
            )


            # IMPORTANTE:
            # no modificamos responsable.
            #
            # Si el Admin creó el mantenimiento,
            # conservamos el dato original.

            mantenimiento.save()


            # ==================================================
            # EVIDENCIAS ANTES
            # ==================================================

            for imagen in evidencias_antes:

                imagen.seek(0)

                EvidenciaMantenimiento.objects.create(

                    id_mantenimiento=
                        mantenimiento,

                    tipo=
                        EvidenciaMantenimiento
                        .TipoEvidencia
                        .ANTES,

                    imagen=
                        imagen,

                    subido_por=
                        request.user,
                )


            # ==================================================
            # EVIDENCIAS DURANTE
            # ==================================================

            for imagen in evidencias_durante:

                imagen.seek(0)

                EvidenciaMantenimiento.objects.create(

                    id_mantenimiento=
                        mantenimiento,

                    tipo=
                        EvidenciaMantenimiento
                        .TipoEvidencia
                        .DURANTE,

                    imagen=
                        imagen,

                    subido_por=
                        request.user,
                )


            # ==================================================
            # EVIDENCIAS DESPUÉS
            # ==================================================

            for imagen in evidencias_despues:

                imagen.seek(0)

                EvidenciaMantenimiento.objects.create(

                    id_mantenimiento=
                        mantenimiento,

                    tipo=
                        EvidenciaMantenimiento
                        .TipoEvidencia
                        .DESPUES,

                    imagen=
                        imagen,

                    subido_por=
                        request.user,
                )


    except Exception:

        messages.error(
            request,
            "No fue posible actualizar el mantenimiento."
        )


        return redirect(
            "mantenimientos_apicultor"
        )


    messages.success(
        request,
        "El mantenimiento fue actualizado correctamente."
    )


    return redirect(
        "mantenimientos_apicultor"
    )



# ============================================================
# COMPLETAR MANTENIMIENTO
# PANEL APICULTOR
# ============================================================

@login_required
@require_POST
def completar_mantenimiento_apicultor(
    request,
    id_mantenimiento
):

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    acceso_mantenimiento = (

        Q(
            id_apiario__id_apicultor=apicultor
        )

        |

        Q(
            id_colmena__id_apiario__id_apicultor=apicultor
        )

    )


    mantenimiento = get_object_or_404(

        Mantenimiento.objects
        .filter(
            acceso_mantenimiento
        )
        .distinct(),

        id_mantenimiento=
            id_mantenimiento
    )


    if mantenimiento.estado == "Cancelado":

        messages.error(
            request,
            "Un mantenimiento cancelado no puede "
            "marcarse como completado."
        )


        return redirect(
            "mantenimientos_apicultor"
        )


    if mantenimiento.estado == "Completado":

        messages.info(
            request,
            "Este mantenimiento ya estaba completado."
        )


        return redirect(
            "mantenimientos_apicultor"
        )


    mantenimiento.estado = (
        "Completado"
    )


    mantenimiento.save(
        update_fields=[
            "estado"
        ]
    )


    messages.success(
        request,
        "Mantenimiento marcado como completado."
    )


    return redirect(
        "mantenimientos_apicultor"
    )


# ============================================================
# ACTUALIZAR OBSERVACIÓN
# PANEL APICULTOR
# ============================================================

@login_required
@require_POST
def actualizar_observacion_mantenimiento_apicultor(
    request,
    id_mantenimiento
):

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    acceso_mantenimiento = (

        Q(
            id_apiario__id_apicultor=apicultor
        )

        |

        Q(
            id_colmena__id_apiario__id_apicultor=apicultor
        )

    )


    mantenimiento = get_object_or_404(

        Mantenimiento.objects
        .filter(
            acceso_mantenimiento
        )
        .distinct(),

        id_mantenimiento=
            id_mantenimiento
    )


    observaciones = (
        request.POST
        .get(
            "observaciones",
            ""
        )
        .strip()
    )


    if len(observaciones) > 255:

        messages.error(
            request,
            "Las observaciones no pueden superar "
            "los 255 caracteres."
        )


        return redirect(
            "mantenimientos_apicultor"
        )


    mantenimiento.observaciones = (
        observaciones
    )


    mantenimiento.save(
        update_fields=[
            "observaciones"
        ]
    )


    messages.success(
        request,
        "Las observaciones fueron actualizadas."
    )


    return redirect(
        "mantenimientos_apicultor"
    )



# ============================================================
# INCIDENCIAS
# PANEL APICULTOR
# ============================================================

@login_required
def incidencias_apicultor(request):

    # ========================================================
    # 1. APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor.objects.select_related(
            "user"
        ),
        user=request.user
    )


    # ========================================================
    # 2. APIARIOS DEL APICULTOR
    # ========================================================

    apiarios = (
        Apiario.objects
        .filter(
            id_apicultor=apicultor
        )
        .order_by(
            "nombreapiario"
        )
    )


    # ========================================================
    # 3. REGLA DE ACCESO A INCIDENCIAS
    #
    # El apicultor puede ver una incidencia cuando:
    #
    # - Está asignada directamente a él.
    # - Pertenece a uno de sus apiarios.
    # - Pertenece a una colmena de uno de sus apiarios.
    #
    # Esto permite que también aparezcan incidencias
    # registradas por el administrador.
    # ========================================================

    acceso_incidencias = (

        Q(
            id_apicultor=apicultor
        )

        |

        Q(
            id_apiario__id_apicultor=apicultor
        )

        |

        Q(
            id_colmena__id_apiario__id_apicultor=apicultor
        )

    )


    # ========================================================
    # 4. CONSULTA BASE
    # ========================================================

    incidencias_base = (
        Incidencia.objects

        .filter(
            acceso_incidencias
        )

        .distinct()

        .select_related(
            "id_apicultor",
            "id_apicultor__user",
            "id_apiario",
            "id_apiario__id_apicultor",
            "id_colmena",
            "id_colmena__id_apiario",
        )

        .prefetch_related(

            # =================================================
            # EVIDENCIAS DEL PROBLEMA
            # =================================================

            Prefetch(
                "evidencias",

                queryset=(
                    EvidenciaIncidencia.objects

                    .filter(
                        tipo=(
                            EvidenciaIncidencia
                            .TipoEvidencia
                            .PROBLEMA
                        )
                    )

                    .select_related(
                        "subido_por"
                    )

                    .order_by(
                        "fecha_registro",
                        "id_evidencia"
                    )
                ),

                to_attr="evidencias_problema_modal"
            ),


            # =================================================
            # EVIDENCIAS DE LA SOLUCIÓN
            # =================================================

            Prefetch(
                "evidencias",

                queryset=(
                    EvidenciaIncidencia.objects

                    .filter(
                        tipo=(
                            EvidenciaIncidencia
                            .TipoEvidencia
                            .SOLUCION
                        )
                    )

                    .select_related(
                        "subido_por"
                    )

                    .order_by(
                        "fecha_registro",
                        "id_evidencia"
                    )
                ),

                to_attr="evidencias_solucion_modal"
            ),

        )
    )


    # ========================================================
    # 5. ESTADOS OFICIALES
    # ========================================================

    estados_disponibles = [
        "Pendiente",
        "En proceso",
        "Resuelta",
    ]


    # ========================================================
    # 6. PRIORIDADES OFICIALES
    # ========================================================

    prioridades_disponibles = [
        "Baja",
        "Media",
        "Alta",
        "Crítica",
    ]


    # ========================================================
    # 7. CONTADORES GENERALES
    #
    # Estos contadores representan todas las incidencias
    # disponibles para el apicultor, independientemente
    # de los filtros seleccionados.
    # ========================================================

    total_incidencias = (
        incidencias_base.count()
    )


    total_pendientes = (
        incidencias_base
        .filter(
            estado__iexact="Pendiente"
        )
        .count()
    )


    total_en_proceso = (
        incidencias_base
        .filter(
            estado__iexact="En proceso"
        )
        .count()
    )


    total_resueltas = (
        incidencias_base
        .filter(
            estado__iexact="Resuelta"
        )
        .count()
    )


    # ========================================================
    # 8. FILTROS GET
    # ========================================================

    busqueda = (
        request.GET.get(
            "q",
            ""
        )
        .strip()
    )


    apiario_seleccionado = (
        request.GET.get(
            "apiario",
            ""
        )
        .strip()
    )


    estado_seleccionado = (
        request.GET.get(
            "estado",
            ""
        )
        .strip()
    )


    prioridad_seleccionada = (
        request.GET.get(
            "prioridad",
            ""
        )
        .strip()
    )


    # ========================================================
    # 9. CONSULTA FILTRABLE
    # ========================================================

    incidencias = incidencias_base


    # ========================================================
    # 10. BUSCADOR
    #
    # Busca por:
    #
    # - Título
    # - Observaciones
    # - Responsable
    # - Tipo de entidad
    # - Nombre del apiario
    # - Código de colmena
    # ========================================================

    if busqueda:

        incidencias = (
            incidencias.filter(

                Q(
                    titulo__icontains=busqueda
                )

                |

                Q(
                    observaciones__icontains=busqueda
                )

                |

                Q(
                    responsable__icontains=busqueda
                )

                |

                Q(
                    entidadincidencia__icontains=busqueda
                )

                |

                Q(
                    id_apiario__nombreapiario__icontains=busqueda
                )

                |

                Q(
                    id_colmena__codigocolmena__icontains=busqueda
                )

                |

                Q(
                    id_colmena__id_apiario__nombreapiario__icontains=busqueda
                )

            )
            .distinct()
        )


    # ========================================================
    # 11. FILTRO POR APIARIO
    #
    # Incluye:
    #
    # - Incidencias directamente asociadas al apiario.
    # - Incidencias asociadas a colmenas de ese apiario.
    # ========================================================

    if apiario_seleccionado.isdigit():

        id_apiario_filtro = int(
            apiario_seleccionado
        )


        incidencias = (
            incidencias.filter(

                Q(
                    id_apiario_id=id_apiario_filtro
                )

                |

                Q(
                    id_colmena__id_apiario_id=id_apiario_filtro
                )

            )
            .distinct()
        )


    # ========================================================
    # 12. FILTRO POR ESTADO
    # ========================================================

    if (
        estado_seleccionado
        and
        estado_seleccionado in estados_disponibles
    ):

        incidencias = (
            incidencias.filter(
                estado__iexact=estado_seleccionado
            )
        )


    # ========================================================
    # 13. FILTRO POR PRIORIDAD
    # ========================================================

    if (
        prioridad_seleccionada
        and
        prioridad_seleccionada in prioridades_disponibles
    ):

        incidencias = (
            incidencias.filter(
                prioridad__iexact=prioridad_seleccionada
            )
        )


    # ========================================================
    # 14. ORDENAMIENTO
    #
    # Primero las incidencias más recientes.
    # ========================================================

    incidencias = (
        incidencias
        .order_by(
            "-fechadeteccion",
            "-id_incidencia"
        )
    )


    # ========================================================
    # 15. PAGINACIÓN
    # ========================================================

    paginator = Paginator(
        incidencias,
        10
    )


    numero_pagina = (
        request.GET.get(
            "page"
        )
    )


    incidencias_pagina = (
        paginator.get_page(
            numero_pagina
        )
    )


    # ========================================================
    # 16. CONTEXTO
    # ========================================================

    contexto = {

        # ====================================================
        # USUARIO
        # ====================================================

        "apicultor":
            apicultor,


        # ====================================================
        # APIARIOS
        # ====================================================

        "apiarios":
            apiarios,


        # ====================================================
        # INCIDENCIAS
        # ====================================================

        "incidencias":
            incidencias_pagina,


        # ====================================================
        # CONTADORES GENERALES
        # ====================================================

        "total_incidencias":
            total_incidencias,

        "total_pendientes":
            total_pendientes,

        "total_en_proceso":
            total_en_proceso,

        "total_resueltas":
            total_resueltas,


        # ====================================================
        # RESULTADOS DESPUÉS DE FILTROS
        # ====================================================

        "total_resultados":
            paginator.count,


        # ====================================================
        # OPCIONES
        # ====================================================

        "estados_disponibles":
            estados_disponibles,

        "prioridades_disponibles":
            prioridades_disponibles,


        # ====================================================
        # FILTROS ACTUALES
        # ====================================================

        "busqueda":
            busqueda,

        "apiario_seleccionado":
            apiario_seleccionado,

        "estado_seleccionado":
            estado_seleccionado,

        "prioridad_seleccionada":
            prioridad_seleccionada,

    }


    # ========================================================
    # 17. RENDER
    # ========================================================

    return render(
        request,
        "panel_apicultor/incidencias.html",
        contexto
    )

# ============================================================
# VALIDAR IMAGEN DE EVIDENCIA
# INCIDENCIAS
# ============================================================

def validar_imagen_evidencia(archivo):

    # ========================================================
    # CONFIGURACIÓN
    # ========================================================

    LIMITE_MB = 5

    LIMITE_BYTES = (
        LIMITE_MB
        * 1024
        * 1024
    )

    FORMATOS_VALIDOS = {
        "JPEG",
        "PNG",
        "WEBP",
    }


    # ========================================================
    # ARCHIVO VACÍO
    # ========================================================

    if not archivo:

        return (
            "No se pudo leer una de las imágenes seleccionadas."
        )


    if archivo.size <= 0:

        return (
            f'La imagen "{archivo.name}" está vacía.'
        )


    # ========================================================
    # TAMAÑO
    # ========================================================

    if archivo.size > LIMITE_BYTES:

        return (
            f'La imagen "{archivo.name}" supera '
            f"el límite de {LIMITE_MB} MB."
        )


    # ========================================================
    # MIME
    # ========================================================

    tipo_archivo = getattr(
        archivo,
        "content_type",
        ""
    )


    if (
        tipo_archivo
        and
        not tipo_archivo.startswith("image/")
    ):

        return (
            f'El archivo "{archivo.name}" '
            "no es una imagen válida."
        )


    # ========================================================
    # VALIDAR CONTENIDO REAL DE LA IMAGEN
    #
    # No confiamos únicamente en la extensión.
    # ========================================================

    try:

        archivo.seek(0)

        imagen = Image.open(
            archivo
        )

        formato = (
            imagen.format or ""
        ).upper()

        imagen.verify()


        if formato not in FORMATOS_VALIDOS:

            return (
                f'La imagen "{archivo.name}" tiene un formato '
                "no permitido. Utiliza JPG, PNG o WEBP."
            )


    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
    ):

        return (
            f'El archivo "{archivo.name}" '
            "no contiene una imagen válida."
        )


    finally:

        try:

            archivo.seek(0)

        except Exception:

            pass


    # ========================================================
    # TODO CORRECTO
    # ========================================================

    return None



# ============================================================
# CREAR INCIDENCIA
# PANEL APICULTOR
# ============================================================

@login_required
def crear_incidencia_apicultor(request):


    # ========================================================
    # 1. APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # 2. APIARIOS ASIGNADOS
    #
    # El apicultor solo puede reportar incidencias
    # sobre sus propios apiarios.
    # ========================================================

    apiarios = (
        Apiario.objects
        .filter(
            id_apicultor=apicultor
        )
        .order_by(
            "nombreapiario"
        )
    )


    # ========================================================
    # 3. COLMENAS DE SUS APIARIOS
    # ========================================================

    colmenas = (
        Colmena.objects
        .filter(
            id_apiario__id_apicultor=apicultor
        )
        .select_related(
            "id_apiario"
        )
        .order_by(
            "id_apiario__nombreapiario",
            "codigocolmena"
        )
    )


    # ========================================================
    # 4. PRIORIDADES
    # ========================================================

    prioridades_validas = [
        "Baja",
        "Media",
        "Alta",
        "Crítica",
    ]


    # ========================================================
    # 5. CONFIGURACIÓN DE EVIDENCIAS
    # ========================================================

    MAX_EVIDENCIAS_PROBLEMA = 6

    MAX_TAMANO_IMAGEN_MB = 5


    # ========================================================
    # 6. VALORES INICIALES
    #
    # Permite abrir el formulario de esta forma:
    #
    # /incidencias/crear/?apiario=2
    #
    # o:
    #
    # /incidencias/crear/?colmena=8
    # ========================================================

    tipo_inicial = "Apiario"


    apiario_preseleccionado = request.GET.get(
        "apiario",
        ""
    ).strip()


    colmena_preseleccionada = request.GET.get(
        "colmena",
        ""
    ).strip()


    # ========================================================
    # 7. PRESELECCIÓN DESDE UNA COLMENA
    # ========================================================

    if colmena_preseleccionada.isdigit():

        colmena_inicial = (
            colmenas
            .filter(
                id_colmena=int(
                    colmena_preseleccionada
                )
            )
            .first()
        )


        if colmena_inicial:

            tipo_inicial = "Colmena"

            apiario_preseleccionado = str(
                colmena_inicial.id_apiario_id
            )

            colmena_preseleccionada = str(
                colmena_inicial.id_colmena
            )


    # ========================================================
    # 8. POST
    # ========================================================

    if request.method == "POST":


        # ====================================================
        # 8.1. RECIBIR DATOS
        # ====================================================

        tipo_entidad = request.POST.get(
            "tipo_entidad",
            ""
        ).strip()


        id_apiario = request.POST.get(
            "apiario",
            ""
        ).strip()


        id_colmena = request.POST.get(
            "colmena",
            ""
        ).strip()


        titulo = request.POST.get(
            "titulo",
            ""
        ).strip()


        prioridad = request.POST.get(
            "prioridad",
            ""
        ).strip()


        fecha = request.POST.get(
            "fecha",
            ""
        ).strip()


        observaciones = request.POST.get(
            "observaciones",
            ""
        ).strip()


        # ====================================================
        # 8.2. RECIBIR VARIAS EVIDENCIAS
        #
        # El nuevo HTML utilizará:
        #
        # name="evidencias_problema"
        #
        # y:
        #
        # multiple
        # ====================================================

        imagenes_problema = request.FILES.getlist(
            "evidencias_problema"
        )


        # ====================================================
        # COMPATIBILIDAD TEMPORAL
        #
        # Mientras actualizamos el HTML, si todavía existe
        # el input antiguo:
        #
        # name="imagen"
        #
        # también lo aceptamos.
        # ====================================================

        if not imagenes_problema:

            imagen_antigua = request.FILES.get(
                "imagen"
            )

            if imagen_antigua:

                imagenes_problema = [
                    imagen_antigua
                ]


        # ====================================================
        # 8.3. CONSERVAR DATOS SI HAY ERROR
        # ====================================================

        valores_formulario = {

            "tipo_entidad":
                tipo_entidad,

            "apiario":
                id_apiario,

            "colmena":
                id_colmena,

            "titulo":
                titulo,

            "prioridad":
                prioridad,

            "fecha":
                fecha,

            "observaciones":
                observaciones,

        }


        # ====================================================
        # 9. ERRORES
        # ====================================================

        errores = []


        # ====================================================
        # 10. VALIDAR TIPO DE ENTIDAD
        # ====================================================

        if tipo_entidad not in [
            "Apiario",
            "Colmena",
        ]:

            errores.append(
                "Selecciona si la incidencia corresponde "
                "a un apiario o a una colmena."
            )


        # ====================================================
        # 11. VALIDAR TÍTULO
        # ====================================================

        if not titulo:

            errores.append(
                "Debes ingresar un título para la incidencia."
            )


        # ====================================================
        # 12. VALIDAR PRIORIDAD
        # ====================================================

        if prioridad not in prioridades_validas:

            errores.append(
                "Selecciona una prioridad válida."
            )


        # ====================================================
        # 13. VALIDAR FECHA
        # ====================================================

        fecha_deteccion = None


        if fecha:

            try:

                fecha_deteccion = datetime.strptime(
                    fecha,
                    "%Y-%m-%d"
                ).date()


            except ValueError:

                errores.append(
                    "La fecha de detección no es válida."
                )


        else:

            fecha_deteccion = (
                timezone.localdate()
            )


        # ====================================================
        # NO PERMITIR FECHA FUTURA
        # ====================================================

        if (
            fecha_deteccion
            and
            fecha_deteccion > timezone.localdate()
        ):

            errores.append(
                "La fecha de detección no puede ser futura."
            )


        # ====================================================
        # 14. VALIDAR APIARIO
        #
        # Solo buscamos dentro de los apiarios
        # asignados al apicultor.
        # ====================================================

        apiario = None


        if not id_apiario.isdigit():

            errores.append(
                "Debes seleccionar un apiario."
            )


        else:

            apiario = (
                apiarios
                .filter(
                    id_apiario=int(
                        id_apiario
                    )
                )
                .first()
            )


            if not apiario:

                errores.append(
                    "El apiario seleccionado no pertenece "
                    "a tus apiarios asignados."
                )


        # ====================================================
        # 15. VALIDAR COLMENA
        # ====================================================

        colmena = None


        if (
            tipo_entidad == "Colmena"
            and
            apiario
        ):


            if not id_colmena.isdigit():

                errores.append(
                    "Debes seleccionar una colmena."
                )


            else:

                colmena = (
                    Colmena.objects
                    .filter(

                        id_colmena=int(
                            id_colmena
                        ),

                        id_apiario=apiario,

                        id_apiario__id_apicultor=apicultor,

                    )
                    .first()
                )


                if not colmena:

                    errores.append(
                        "La colmena seleccionada no pertenece "
                        "al apiario indicado."
                    )


        # ====================================================
        # 16. VALIDAR CANTIDAD DE EVIDENCIAS
        # ====================================================

        cantidad_imagenes = len(
            imagenes_problema
        )


        if (
            cantidad_imagenes
            >
            MAX_EVIDENCIAS_PROBLEMA
        ):

            errores.append(
                "Puedes subir un máximo de "
                f"{MAX_EVIDENCIAS_PROBLEMA} fotografías "
                "por incidencia."
            )


        # ====================================================
        # 17. VALIDAR CADA IMAGEN
        #
        # Máximo:
        #
        # 6 imágenes
        # 5 MB por imagen
        # JPG / PNG / WEBP
        # ====================================================

        if (
            cantidad_imagenes
            <=
            MAX_EVIDENCIAS_PROBLEMA
        ):


            for imagen in imagenes_problema:

                error_imagen = (
                    validar_imagen_evidencia(
                        imagen
                    )
                )


                if error_imagen:

                    errores.append(
                        error_imagen
                    )


        # ====================================================
        # 18. SI HAY ERRORES
        # ====================================================

        if errores:


            for error in errores:

                messages.error(
                    request,
                    error
                )


            contexto = {

                "apicultor":
                    apicultor,

                "apiarios":
                    apiarios,

                "colmenas":
                    colmenas,

                "prioridades":
                    prioridades_validas,

                "tipo_inicial":
                    tipo_entidad,

                "apiario_preseleccionado":
                    id_apiario,

                "colmena_preseleccionada":
                    id_colmena,

                "valores_formulario":
                    valores_formulario,

                "fecha_hoy":
                    timezone.localdate(),

                "max_evidencias_problema":
                    MAX_EVIDENCIAS_PROBLEMA,

                "max_tamano_imagen_mb":
                    MAX_TAMANO_IMAGEN_MB,

            }


            return render(
                request,
                "panel_apicultor/crear_incidencia.html",
                contexto
            )


        # ====================================================
        # 19. NOMBRE DE QUIEN REPORTÓ
        # ====================================================

        nombre_reportante = (
            request.user
            .get_full_name()
            .strip()
        )


        if not nombre_reportante:

            nombre_reportante = (
                request.user.username
            )


        # ====================================================
        # 20. CREAR INCIDENCIA + EVIDENCIAS
        #
        # Usamos transaction.atomic para evitar que se cree
        # la incidencia en la BD y fallen las evidencias.
        # ====================================================

        try:

            with transaction.atomic():


                # ============================================
                # CREAR INCIDENCIA
                #
                # imagen inicialmente queda vacía.
                # Luego apuntaremos el campo antiguo a la
                # primera evidencia para compatibilidad.
                # ============================================

                incidencia = (
                    Incidencia.objects.create(

                        # ------------------------------------
                        # APICULTOR ENCARGADO
                        # ------------------------------------

                        id_apicultor=
                            apicultor,


                        # ------------------------------------
                        # UBICACIÓN
                        # ------------------------------------

                        id_apiario=
                            apiario,

                        id_colmena=
                            colmena,


                        # ------------------------------------
                        # ENTIDAD
                        # ------------------------------------

                        entidadincidencia=
                            tipo_entidad,


                        # ------------------------------------
                        # INFORMACIÓN
                        # ------------------------------------

                        titulo=
                            titulo,

                        prioridad=
                            prioridad,

                        fechadeteccion=
                            fecha_deteccion,


                        # ------------------------------------
                        # ESTADO INICIAL
                        # ------------------------------------

                        estado=
                            "Pendiente",


                        # ------------------------------------
                        # OBSERVACIONES
                        # ------------------------------------

                        observaciones=
                            observaciones,


                        # ------------------------------------
                        # CAMPO ANTIGUO
                        #
                        # Lo dejamos vacío temporalmente.
                        # ------------------------------------

                        imagen=
                            None,


                        # ------------------------------------
                        # REPORTANTE
                        # ------------------------------------

                        responsable=
                            nombre_reportante,

                    )
                )


                # ============================================
                # GUARDAR EVIDENCIAS DEL PROBLEMA
                # ============================================

                primera_evidencia = None


                for imagen in imagenes_problema:


                    # ----------------------------------------
                    # Volver al inicio del archivo
                    # después de la validación con Pillow.
                    # ----------------------------------------

                    try:

                        imagen.seek(0)

                    except Exception:

                        pass


                    evidencia = (
                        EvidenciaIncidencia.objects.create(

                            id_incidencia=
                                incidencia,

                            tipo=
                                EvidenciaIncidencia
                                .TipoEvidencia
                                .PROBLEMA,

                            imagen=
                                imagen,

                            descripcion=
                                None,

                            subido_por=
                                request.user,

                        )
                    )


                    if primera_evidencia is None:

                        primera_evidencia = (
                            evidencia
                        )


                # ============================================
                # COMPATIBILIDAD CON Incidencia.imagen
                #
                # No duplicamos físicamente la fotografía.
                #
                # El campo antiguo simplemente apunta
                # al archivo de la primera evidencia.
                # ============================================

                if primera_evidencia:

                    incidencia.imagen.name = (
                        primera_evidencia.imagen.name
                    )

                    incidencia.save(
                        update_fields=[
                            "imagen"
                        ]
                    )


        except Exception:

            messages.error(
                request,
                "Ocurrió un error al guardar la incidencia "
                "y sus evidencias. Intenta nuevamente."
            )


            contexto = {

                "apicultor":
                    apicultor,

                "apiarios":
                    apiarios,

                "colmenas":
                    colmenas,

                "prioridades":
                    prioridades_validas,

                "tipo_inicial":
                    tipo_entidad,

                "apiario_preseleccionado":
                    id_apiario,

                "colmena_preseleccionada":
                    id_colmena,

                "valores_formulario":
                    valores_formulario,

                "fecha_hoy":
                    timezone.localdate(),

                "max_evidencias_problema":
                    MAX_EVIDENCIAS_PROBLEMA,

                "max_tamano_imagen_mb":
                    MAX_TAMANO_IMAGEN_MB,

            }


            return render(
                request,
                "panel_apicultor/crear_incidencia.html",
                contexto
            )


        # ====================================================
        # 21. MENSAJE DE ÉXITO
        # ====================================================

        if cantidad_imagenes == 1:

            messages.success(
                request,
                "La incidencia fue reportada correctamente "
                "con 1 evidencia fotográfica."
            )


        elif cantidad_imagenes > 1:

            messages.success(
                request,
                "La incidencia fue reportada correctamente "
                f"con {cantidad_imagenes} evidencias fotográficas."
            )


        else:

            messages.success(
                request,
                "La incidencia fue reportada correctamente."
            )


        # ====================================================
        # 22. REGRESAR AL LISTADO
        # ====================================================

        return redirect(
            "incidencias_apicultor"
        )


    # ========================================================
    # 23. GET
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "apiarios":
            apiarios,

        "colmenas":
            colmenas,

        "prioridades":
            prioridades_validas,

        "tipo_inicial":
            tipo_inicial,

        "apiario_preseleccionado":
            apiario_preseleccionado,

        "colmena_preseleccionada":
            colmena_preseleccionada,

        "fecha_hoy":
            timezone.localdate(),

        "valores_formulario":
            {},

        "max_evidencias_problema":
            MAX_EVIDENCIAS_PROBLEMA,

        "max_tamano_imagen_mb":
            MAX_TAMANO_IMAGEN_MB,

    }


    return render(
        request,
        "panel_apicultor/crear_incidencia.html",
        contexto
    )



# ============================================================
# EDITAR / GESTIONAR INCIDENCIA
# PANEL APICULTOR
# ============================================================

@login_required
def editar_incidencia_apicultor(
    request,
    id_incidencia
):

    # ========================================================
    # 1. APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor.objects.select_related(
            "user"
        ),
        user=request.user
    )


    # ========================================================
    # 2. REGLA DE ACCESO A LA INCIDENCIA
    #
    # El apicultor puede gestionar una incidencia cuando:
    #
    # - Está asignada directamente a él.
    # - Pertenece a uno de sus apiarios.
    # - Pertenece a una colmena de uno de sus apiarios.
    #
    # Esto permite gestionar también incidencias creadas
    # por el administrador.
    # ========================================================

    acceso_incidencia = (

        Q(
            id_apicultor=apicultor
        )

        |

        Q(
            id_apiario__id_apicultor=apicultor
        )

        |

        Q(
            id_colmena__id_apiario__id_apicultor=apicultor
        )

    )


    # ========================================================
    # 3. OBTENER INCIDENCIA
    #
    # IMPORTANTE:
    # No usamos solamente id_apicultor=apicultor porque una
    # incidencia creada por el administrador puede estar
    # relacionada al apiario o a una de sus colmenas.
    # ========================================================

    incidencia = get_object_or_404(

        Incidencia.objects

        .filter(
            acceso_incidencia
        )

        .distinct()

        .select_related(
            "id_apicultor",
            "id_apicultor__user",
            "id_apiario",
            "id_apiario__id_apicultor",
            "id_colmena",
            "id_colmena__id_apiario",
        ),

        id_incidencia=id_incidencia

    )


    # ========================================================
    # 4. ESTADOS DISPONIBLES
    # ========================================================

    estados_disponibles = [
        "Pendiente",
        "En proceso",
        "Resuelta",
    ]


    # ========================================================
    # 5. CONFIGURACIÓN DE EVIDENCIAS
    # ========================================================

    MAX_EVIDENCIAS_PROBLEMA = 6

    MAX_EVIDENCIAS_SOLUCION = 6

    MAX_TAMANO_IMAGEN_MB = 5


    # ========================================================
    # 6. EVIDENCIAS EXISTENTES DEL PROBLEMA
    # ========================================================

    evidencias_problema = (
        incidencia.evidencias

        .filter(
            tipo=(
                EvidenciaIncidencia
                .TipoEvidencia
                .PROBLEMA
            )
        )

        .select_related(
            "subido_por"
        )

        .order_by(
            "fecha_registro",
            "id_evidencia"
        )
    )


    # ========================================================
    # 7. EVIDENCIAS EXISTENTES DE SOLUCIÓN
    # ========================================================

    evidencias_solucion = (
        incidencia.evidencias

        .filter(
            tipo=(
                EvidenciaIncidencia
                .TipoEvidencia
                .SOLUCION
            )
        )

        .select_related(
            "subido_por"
        )

        .order_by(
            "fecha_registro",
            "id_evidencia"
        )
    )


    # ========================================================
    # 8. CANTIDADES EXISTENTES
    # ========================================================

    cantidad_problema_actual = (
        evidencias_problema.count()
    )


    cantidad_solucion_actual = (
        evidencias_solucion.count()
    )


    # ========================================================
    # 9. COMPATIBILIDAD CON INCIDENCIA.IMAGEN
    #
    # Una incidencia antigua puede tener:
    #
    # incidencia.imagen
    #
    # pero todavía no tener un registro en
    # EvidenciaIncidencia.
    #
    # La consideramos una evidencia del problema para
    # efectos del límite máximo.
    # ========================================================

    tiene_imagen_legacy = (
        bool(incidencia.imagen)
        and
        cantidad_problema_actual == 0
    )


    cantidad_problema_para_limite = (
        cantidad_problema_actual
        +
        (
            1
            if tiene_imagen_legacy
            else 0
        )
    )


    # ========================================================
    # 10. FUNCIÓN LOCAL PARA CONSTRUIR CONTEXTO
    #
    # Evita repetir el mismo diccionario varias veces.
    # ========================================================

    def construir_contexto():

        return {

            "apicultor":
                apicultor,

            "incidencia":
                incidencia,

            "estados_disponibles":
                estados_disponibles,

            "evidencias_problema":
                evidencias_problema,

            "evidencias_solucion":
                evidencias_solucion,

            "cantidad_problema_actual":
                cantidad_problema_para_limite,

            "cantidad_solucion_actual":
                cantidad_solucion_actual,

            "max_evidencias_problema":
                MAX_EVIDENCIAS_PROBLEMA,

            "max_evidencias_solucion":
                MAX_EVIDENCIAS_SOLUCION,

            "max_tamano_imagen_mb":
                MAX_TAMANO_IMAGEN_MB,

        }


    # ========================================================
    # 11. GET
    # ========================================================

    if request.method != "POST":

        return render(
            request,
            "panel_apicultor/editar_incidencia.html",
            construir_contexto()
        )


    # ========================================================
    # 12. ESTADO
    # ========================================================

    estado = (
        request.POST.get(
            "estado",
            ""
        )
        .strip()
    )


    # ========================================================
    # 13. OBSERVACIONES
    # ========================================================

    observaciones = (
        request.POST.get(
            "observaciones",
            ""
        )
        .strip()
    )


    # ========================================================
    # 14. NUEVAS EVIDENCIAS DEL PROBLEMA
    # ========================================================

    nuevas_evidencias_problema = (
        request.FILES.getlist(
            "evidencias_problema"
        )
    )


    # ========================================================
    # 15. NUEVAS EVIDENCIAS DE SOLUCIÓN
    # ========================================================

    nuevas_evidencias_solucion = (
        request.FILES.getlist(
            "evidencias_solucion"
        )
    )


    # ========================================================
    # 16. COMPATIBILIDAD TEMPORAL CON FORMULARIO ANTIGUO
    #
    # Si todavía existe algún formulario que envíe:
    #
    # name="imagen"
    #
    # la tratamos automáticamente como:
    #
    # - Problema si no está resuelta.
    # - Solución si pasa a Resuelta.
    # ========================================================

    imagen_antigua_formulario = (
        request.FILES.get(
            "imagen"
        )
    )


    if (
        imagen_antigua_formulario
        and
        not nuevas_evidencias_problema
        and
        not nuevas_evidencias_solucion
    ):

        if estado == "Resuelta":

            nuevas_evidencias_solucion = [
                imagen_antigua_formulario
            ]

        else:

            nuevas_evidencias_problema = [
                imagen_antigua_formulario
            ]


    # ========================================================
    # 17. ERRORES
    # ========================================================

    errores = []


    # ========================================================
    # 18. VALIDAR ESTADO
    # ========================================================

    if estado not in estados_disponibles:

        errores.append(
            "Selecciona un estado válido."
        )


    # ========================================================
    # 19. VALIDAR OBSERVACIONES
    # ========================================================

    if len(observaciones) > 1000:

        errores.append(
            "Las observaciones no pueden superar "
            "los 1000 caracteres."
        )


    # ========================================================
    # 20. CANTIDAD DE NUEVAS EVIDENCIAS
    # ========================================================

    cantidad_nueva_problema = len(
        nuevas_evidencias_problema
    )


    cantidad_nueva_solucion = len(
        nuevas_evidencias_solucion
    )


    # ========================================================
    # 21. TOTAL DEL PROBLEMA DESPUÉS DEL GUARDADO
    # ========================================================

    total_problema = (
        cantidad_problema_para_limite
        +
        cantidad_nueva_problema
    )


    # ========================================================
    # 22. TOTAL DE SOLUCIÓN DESPUÉS DEL GUARDADO
    # ========================================================

    total_solucion = (
        cantidad_solucion_actual
        +
        cantidad_nueva_solucion
    )


    # ========================================================
    # 23. VALIDAR LÍMITE DEL PROBLEMA
    # ========================================================

    if (
        total_problema
        >
        MAX_EVIDENCIAS_PROBLEMA
    ):

        disponibles = max(
            0,
            MAX_EVIDENCIAS_PROBLEMA
            -
            cantidad_problema_para_limite
        )


        errores.append(
            "La incidencia puede tener un máximo de "
            f"{MAX_EVIDENCIAS_PROBLEMA} fotografías "
            "del problema. "
            f"Actualmente puedes agregar {disponibles} más."
        )


    # ========================================================
    # 24. VALIDAR LÍMITE DE SOLUCIÓN
    # ========================================================

    if (
        total_solucion
        >
        MAX_EVIDENCIAS_SOLUCION
    ):

        disponibles = max(
            0,
            MAX_EVIDENCIAS_SOLUCION
            -
            cantidad_solucion_actual
        )


        errores.append(
            "La incidencia puede tener un máximo de "
            f"{MAX_EVIDENCIAS_SOLUCION} fotografías "
            "de solución. "
            f"Actualmente puedes agregar {disponibles} más."
        )


    # ========================================================
    # 25. VALIDAR FOTOGRAFÍAS DEL PROBLEMA
    # ========================================================

    if (
        total_problema
        <=
        MAX_EVIDENCIAS_PROBLEMA
    ):

        for imagen in nuevas_evidencias_problema:

            error_imagen = (
                validar_imagen_evidencia(
                    imagen
                )
            )


            if error_imagen:

                errores.append(
                    error_imagen
                )


    # ========================================================
    # 26. VALIDAR FOTOGRAFÍAS DE SOLUCIÓN
    # ========================================================

    if (
        total_solucion
        <=
        MAX_EVIDENCIAS_SOLUCION
    ):

        for imagen in nuevas_evidencias_solucion:

            error_imagen = (
                validar_imagen_evidencia(
                    imagen
                )
            )


            if error_imagen:

                errores.append(
                    error_imagen
                )


    # ========================================================
    # 27. REGLA PARA MARCAR COMO RESUELTA
    #
    # Una incidencia solamente puede pasar a Resuelta cuando
    # exista por lo menos una fotografía de solución.
    # ========================================================

    if (
        estado == "Resuelta"
        and
        total_solucion <= 0
    ):

        errores.append(
            "Para marcar la incidencia como Resuelta "
            "debes agregar al menos una fotografía "
            "que evidencie la solución."
        )


    # ========================================================
    # 28. MOSTRAR ERRORES
    # ========================================================

    if errores:

        for error in errores:

            messages.error(
                request,
                error
            )


        return render(
            request,
            "panel_apicultor/editar_incidencia.html",
            construir_contexto()
        )


    # ========================================================
    # 29. GUARDAR
    # ========================================================

    try:

        with transaction.atomic():


            # =================================================
            # 29.1 ACTUALIZAR INCIDENCIA
            # =================================================

            incidencia.estado = (
                estado
            )


            incidencia.observaciones = (
                observaciones
                or
                None
            )


            incidencia.save(
                update_fields=[
                    "estado",
                    "observaciones",
                ]
            )


            # =================================================
            # 29.2 MIGRAR IMAGEN LEGACY
            #
            # Si existe una imagen antigua y ahora el usuario
            # agrega nuevas evidencias del problema, registramos
            # la antigua también en EvidenciaIncidencia.
            #
            # No copiamos el archivo físicamente.
            # =================================================

            if (
                tiene_imagen_legacy
                and
                nuevas_evidencias_problema
            ):

                evidencia_legacy = (
                    EvidenciaIncidencia(
                        id_incidencia=incidencia,

                        tipo=(
                            EvidenciaIncidencia
                            .TipoEvidencia
                            .PROBLEMA
                        ),

                        descripcion=None,

                        subido_por=None,
                    )
                )


                evidencia_legacy.imagen.name = (
                    incidencia.imagen.name
                )


                evidencia_legacy.save()


            # =================================================
            # 29.3 PRIMERA EVIDENCIA NUEVA DEL PROBLEMA
            # =================================================

            primera_evidencia_problema = None


            # =================================================
            # 29.4 GUARDAR EVIDENCIAS DEL PROBLEMA
            # =================================================

            for imagen in nuevas_evidencias_problema:


                try:

                    imagen.seek(0)

                except Exception:

                    pass


                evidencia = (
                    EvidenciaIncidencia.objects.create(

                        id_incidencia=
                            incidencia,

                        tipo=(
                            EvidenciaIncidencia
                            .TipoEvidencia
                            .PROBLEMA
                        ),

                        imagen=
                            imagen,

                        descripcion=
                            None,

                        subido_por=
                            request.user,

                    )
                )


                if (
                    primera_evidencia_problema
                    is None
                ):

                    primera_evidencia_problema = (
                        evidencia
                    )


            # =================================================
            # 29.5 GUARDAR EVIDENCIAS DE SOLUCIÓN
            # =================================================

            for imagen in nuevas_evidencias_solucion:


                try:

                    imagen.seek(0)

                except Exception:

                    pass


                EvidenciaIncidencia.objects.create(

                    id_incidencia=
                        incidencia,

                    tipo=(
                        EvidenciaIncidencia
                        .TipoEvidencia
                        .SOLUCION
                    ),

                    imagen=
                        imagen,

                    descripcion=
                        None,

                    subido_por=
                        request.user,

                )


            # =================================================
            # 29.6 COMPATIBILIDAD CON INCIDENCIA.IMAGEN
            #
            # Si la incidencia nunca tuvo imagen antigua,
            # apuntamos el campo legacy a la primera nueva
            # evidencia del problema.
            #
            # No duplicamos el archivo.
            # =================================================

            if (
                not incidencia.imagen
                and
                primera_evidencia_problema
            ):

                incidencia.imagen.name = (
                    primera_evidencia_problema
                    .imagen
                    .name
                )


                incidencia.save(
                    update_fields=[
                        "imagen"
                    ]
                )


    # ========================================================
    # 30. ERROR DE GUARDADO
    # ========================================================

    except Exception:

        messages.error(
            request,
            "Ocurrió un error al actualizar la incidencia "
            "o guardar las evidencias fotográficas."
        )


        return render(
            request,
            "panel_apicultor/editar_incidencia.html",
            construir_contexto()
        )


    # ========================================================
    # 31. MENSAJE FINAL
    # ========================================================

    total_nuevas_evidencias = (
        cantidad_nueva_problema
        +
        cantidad_nueva_solucion
    )


    if estado == "Resuelta":

        messages.success(
            request,
            "La incidencia fue marcada como Resuelta "
            "y las evidencias de solución fueron guardadas."
        )


    elif total_nuevas_evidencias > 0:

        messages.success(
            request,
            "La incidencia fue actualizada correctamente. "
            f"Se agregaron {total_nuevas_evidencias} "
            "evidencia(s) fotográfica(s)."
        )


    else:

        messages.success(
            request,
            "La incidencia fue actualizada correctamente."
        )


    # ========================================================
    # 32. VOLVER AL LISTADO
    # ========================================================

    return redirect(
        "incidencias_apicultor"
    )


# ============================================================
# AGENDA
# PANEL APICULTOR
# ============================================================

@login_required
def agenda_apicultor(request):

    # ========================================================
    # APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # APIARIOS DEL APICULTOR
    # ========================================================

    apiarios = (
        Apiario.objects
        .filter(
            id_apicultor=apicultor
        )
        .order_by(
            "nombreapiario"
        )
    )


    # ========================================================
    # FECHA ACTUAL
    # ========================================================

    hoy = timezone.localdate()


    # ========================================================
    # EVENTOS DEL APICULTOR
    #
    # Puede ver:
    #
    # 1. Eventos asignados directamente a él.
    #
    # 2. Eventos correspondientes a sus apiarios.
    #
    # Esto nos permite que un administrador cree un evento
    # para un apiario y el apicultor encargado pueda verlo.
    # ========================================================

    eventos_base = (
        EventoAgenda.objects
        .filter(
            Q(
                responsable=apicultor
            )
            |
            Q(
                id_apiario__in=apiarios
            )
        )
        .select_related(
            "id_apiario",
            "id_colmena",
            "responsable",
            "creado_por"
        )
        .distinct()
    )


    # ========================================================
    # CONTADORES GENERALES
    # ========================================================

    total_eventos = (
        eventos_base.count()
    )


    total_programados = (
        eventos_base
        .filter(
            estado=EventoAgenda.EstadoEvento.PROGRAMADO
        )
        .count()
    )


    total_completados = (
        eventos_base
        .filter(
            estado=EventoAgenda.EstadoEvento.COMPLETADO
        )
        .count()
    )


    total_cancelados = (
        eventos_base
        .filter(
            estado=EventoAgenda.EstadoEvento.CANCELADO
        )
        .count()
    )


    # ========================================================
    # EVENTOS PARA HOY
    # ========================================================

    eventos_hoy = (
        eventos_base
        .filter(
            fecha=hoy
        )
        .order_by(
            "hora"
        )
    )


    total_hoy = eventos_hoy.count()


    # ========================================================
    # PRÓXIMOS EVENTOS
    #
    # No mostramos aquí eventos ya completados/cancelados.
    # ========================================================

    proximos_eventos = (
        eventos_base
        .filter(
            fecha__gte=hoy,
            estado=EventoAgenda.EstadoEvento.PROGRAMADO
        )
        .order_by(
            "fecha",
            "hora"
        )[:5]
    )


    # ========================================================
    # TIPOS DISPONIBLES
    # ========================================================

    tipos_disponibles = [
        {
            "valor": EventoAgenda.TipoEvento.MANTENIMIENTO,
            "nombre": "Mantenimiento",
        },
        {
            "valor": EventoAgenda.TipoEvento.REVISION,
            "nombre": "Revisión",
        },
        {
            "valor": EventoAgenda.TipoEvento.INCIDENCIA,
            "nombre": "Incidencia",
        },
        {
            "valor": EventoAgenda.TipoEvento.EVENTO,
            "nombre": "Evento general",
        },
    ]


    # ========================================================
    # ESTADOS DISPONIBLES
    # ========================================================

    estados_disponibles = [
        {
            "valor": EventoAgenda.EstadoEvento.PROGRAMADO,
            "nombre": "Programado",
        },
        {
            "valor": EventoAgenda.EstadoEvento.COMPLETADO,
            "nombre": "Completado",
        },
        {
            "valor": EventoAgenda.EstadoEvento.CANCELADO,
            "nombre": "Cancelado",
        },
    ]


    # ========================================================
    # FILTROS GET
    # ========================================================

    busqueda = request.GET.get(
        "q",
        ""
    ).strip()


    apiario_seleccionado = request.GET.get(
        "apiario",
        ""
    ).strip()


    tipo_seleccionado = request.GET.get(
        "tipo",
        ""
    ).strip()


    estado_seleccionado = request.GET.get(
        "estado",
        ""
    ).strip()


    fecha_seleccionada = request.GET.get(
        "fecha",
        ""
    ).strip()


    # ========================================================
    # CONSULTA DE RESULTADOS
    # ========================================================

    eventos = eventos_base


    # ========================================================
    # BUSCADOR
    # ========================================================

    if busqueda:

        eventos = eventos.filter(

            Q(
                titulo__icontains=busqueda
            )

            |

            Q(
                descripcion__icontains=busqueda
            )

            |

            Q(
                id_apiario__nombreapiario__icontains=busqueda
            )

            |

            Q(
                id_colmena__codigocolmena__icontains=busqueda
            )

        )


    # ========================================================
    # FILTRO APIARIO
    # ========================================================

    if apiario_seleccionado.isdigit():

        eventos = eventos.filter(
            id_apiario__id_apiario=int(
                apiario_seleccionado
            )
        )


    # ========================================================
    # FILTRO TIPO
    # ========================================================

    tipos_validos = [
        EventoAgenda.TipoEvento.MANTENIMIENTO,
        EventoAgenda.TipoEvento.REVISION,
        EventoAgenda.TipoEvento.INCIDENCIA,
        EventoAgenda.TipoEvento.EVENTO,
    ]


    if (
        tipo_seleccionado
        and
        tipo_seleccionado in tipos_validos
    ):

        eventos = eventos.filter(
            tipo_evento=tipo_seleccionado
        )


    # ========================================================
    # FILTRO ESTADO
    # ========================================================

    estados_validos = [
        EventoAgenda.EstadoEvento.PROGRAMADO,
        EventoAgenda.EstadoEvento.COMPLETADO,
        EventoAgenda.EstadoEvento.CANCELADO,
    ]


    if (
        estado_seleccionado
        and
        estado_seleccionado in estados_validos
    ):

        eventos = eventos.filter(
            estado=estado_seleccionado
        )


    # ========================================================
    # FILTRO POR FECHA
    # ========================================================

    if fecha_seleccionada:

        eventos = eventos.filter(
            fecha=fecha_seleccionada
        )


    # ========================================================
    # ORDEN
    # ========================================================

    eventos = eventos.order_by(
        "fecha",
        "hora"
    )


    # ========================================================
    # PAGINACIÓN
    # ========================================================

    paginator = Paginator(
        eventos,
        10
    )


    pagina = request.GET.get(
        "page"
    )


    eventos_pagina = paginator.get_page(
        pagina
    )


    # ========================================================
    # EVENTOS PARA EL CALENDARIO
    #
    # Estos no están paginados porque el calendario necesita
    # conocer todos los eventos disponibles.
    # ========================================================

    eventos_calendario = []


    for evento in eventos_base.order_by(
        "fecha",
        "hora"
    ):

        eventos_calendario.append({

            "id":
                evento.id_evento,

            "titulo":
                evento.titulo,

            "tipo":
                evento.tipo_evento,

            "estado":
                evento.estado,

            "fecha":
                evento.fecha.strftime(
                    "%Y-%m-%d"
                ),

            "hora":
                evento.hora.strftime(
                    "%H:%M"
                ),

            "apiario":
                evento.id_apiario.nombreapiario
                if evento.id_apiario
                else "",

            "colmena":
                evento.id_colmena.codigocolmena
                if evento.id_colmena
                else "",

            "descripcion":
                evento.descripcion or "",

        })


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "apiarios":
            apiarios,


        # EVENTOS

        "eventos":
            eventos_pagina,

        "eventos_hoy":
            eventos_hoy,

        "proximos_eventos":
            proximos_eventos,

        "eventos_calendario":
            eventos_calendario,


        # CONTADORES

        "total_eventos":
            total_eventos,

        "total_programados":
            total_programados,

        "total_completados":
            total_completados,

        "total_cancelados":
            total_cancelados,

        "total_hoy":
            total_hoy,

        "total_resultados":
            paginator.count,


        # OPCIONES

        "tipos_disponibles":
            tipos_disponibles,

        "estados_disponibles":
            estados_disponibles,


        # FILTROS

        "busqueda":
            busqueda,

        "apiario_seleccionado":
            apiario_seleccionado,

        "tipo_seleccionado":
            tipo_seleccionado,

        "estado_seleccionado":
            estado_seleccionado,

        "fecha_seleccionada":
            fecha_seleccionada,


        # FECHA

        "hoy":
            hoy,

    }


    return render(
        request,
        "panel_apicultor/agenda.html",
        contexto
    )



# ============================================================
# CREAR EVENTO
# PANEL APICULTOR
# ============================================================

@login_required
def crear_evento_apicultor(request):

    # ========================================================
    # APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # APIARIOS ASIGNADOS
    # ========================================================

    apiarios = (
        Apiario.objects
        .filter(
            id_apicultor=apicultor
        )
        .order_by(
            "nombreapiario"
        )
    )


    # ========================================================
    # COLMENAS ASIGNADAS
    # ========================================================

    colmenas = (
        Colmena.objects
        .filter(
            id_apiario__id_apicultor=apicultor
        )
        .select_related(
            "id_apiario"
        )
        .order_by(
            "id_apiario__nombreapiario",
            "codigocolmena"
        )
    )


    # ========================================================
    # TIPOS DE EVENTOS DISPONIBLES
    # ========================================================

    tipos_disponibles = [

        {
            "valor": EventoAgenda.TipoEvento.MANTENIMIENTO,
            "nombre": "Mantenimiento",
        },

        {
            "valor": EventoAgenda.TipoEvento.REVISION,
            "nombre": "Revisión",
        },

        {
            "valor": EventoAgenda.TipoEvento.INCIDENCIA,
            "nombre": "Incidencia",
        },

        {
            "valor": EventoAgenda.TipoEvento.EVENTO,
            "nombre": "Evento general",
        },

    ]


    # ========================================================
    # POST
    # ========================================================

    if request.method == "POST":

        titulo = request.POST.get(
            "titulo",
            ""
        ).strip()


        tipo_evento = request.POST.get(
            "tipo_evento",
            ""
        ).strip()


        id_apiario = request.POST.get(
            "apiario",
            ""
        ).strip()


        id_colmena = request.POST.get(
            "colmena",
            ""
        ).strip()


        fecha = request.POST.get(
            "fecha",
            ""
        ).strip()


        hora = request.POST.get(
            "hora",
            ""
        ).strip()


        descripcion = request.POST.get(
            "descripcion",
            ""
        ).strip()


        errores = []


        # ====================================================
        # TÍTULO
        # ====================================================

        if not titulo:

            errores.append(
                "Debes ingresar un título para el evento."
            )


        elif len(titulo) > 150:

            errores.append(
                "El título no puede superar los 150 caracteres."
            )


        # ====================================================
        # TIPO
        # ====================================================

        tipos_validos = [

            EventoAgenda.TipoEvento.MANTENIMIENTO,

            EventoAgenda.TipoEvento.REVISION,

            EventoAgenda.TipoEvento.INCIDENCIA,

            EventoAgenda.TipoEvento.EVENTO,

        ]


        if tipo_evento not in tipos_validos:

            errores.append(
                "Selecciona un tipo de evento válido."
            )


        # ====================================================
        # APIARIO
        #
        # Solo buscamos dentro de SUS apiarios.
        # ====================================================

        apiario = None


        if not id_apiario.isdigit():

            errores.append(
                "Debes seleccionar un apiario."
            )

        else:

            apiario = (
                apiarios
                .filter(
                    id_apiario=int(
                        id_apiario
                    )
                )
                .first()
            )


            if not apiario:

                errores.append(
                    "El apiario seleccionado no pertenece "
                    "a tus apiarios asignados."
                )


        # ====================================================
        # COLMENA
        #
        # Es opcional.
        # ====================================================

        colmena = None


        if id_colmena:

            if not id_colmena.isdigit():

                errores.append(
                    "La colmena seleccionada no es válida."
                )

            elif apiario:

                colmena = (
                    Colmena.objects
                    .filter(
                        id_colmena=int(
                            id_colmena
                        ),
                        id_apiario=apiario,
                        id_apiario__id_apicultor=apicultor
                    )
                    .first()
                )


                if not colmena:

                    errores.append(
                        "La colmena seleccionada no pertenece "
                        "al apiario indicado."
                    )


        # ====================================================
        # FECHA
        # ====================================================

        fecha_evento = None


        if not fecha:

            errores.append(
                "Debes seleccionar la fecha del evento."
            )

        else:

            try:

                fecha_evento = datetime.strptime(
                    fecha,
                    "%Y-%m-%d"
                ).date()

            except ValueError:

                errores.append(
                    "La fecha seleccionada no es válida."
                )


        # ====================================================
        # NO PROGRAMAR EN EL PASADO
        # ====================================================

        if (
            fecha_evento
            and
            fecha_evento < timezone.localdate()
        ):

            errores.append(
                "No puedes programar un evento en una fecha pasada."
            )


        # ====================================================
        # HORA
        # ====================================================

        hora_evento = None


        if not hora:

            errores.append(
                "Debes seleccionar la hora del evento."
            )

        else:

            try:

                hora_evento = datetime.strptime(
                    hora,
                    "%H:%M"
                ).time()

            except ValueError:

                errores.append(
                    "La hora seleccionada no es válida."
                )


        # ====================================================
        # DESCRIPCIÓN
        # ====================================================

        if len(descripcion) > 500:

            errores.append(
                "La descripción no puede superar "
                "los 500 caracteres."
            )


        # ====================================================
        # ERRORES
        # ====================================================

        if errores:

            for error in errores:

                messages.error(
                    request,
                    error
                )


            return render(
                request,
                "panel_apicultor/crear_evento.html",
                {

                    "apicultor":
                        apicultor,

                    "apiarios":
                        apiarios,

                    "colmenas":
                        colmenas,

                    "tipos_disponibles":
                        tipos_disponibles,

                    "fecha_hoy":
                        timezone.localdate(),

                    "valores_formulario": {

                        "titulo":
                            titulo,

                        "tipo_evento":
                            tipo_evento,

                        "apiario":
                            id_apiario,

                        "colmena":
                            id_colmena,

                        "fecha":
                            fecha,

                        "hora":
                            hora,

                        "descripcion":
                            descripcion,

                    },

                }
            )


        # ====================================================
        # CREAR EVENTO
        # ====================================================

        EventoAgenda.objects.create(

            titulo=titulo,

            tipo_evento=tipo_evento,

            id_apiario=apiario,

            id_colmena=colmena,

            # El mismo apicultor será responsable
            responsable=apicultor,

            fecha=fecha_evento,

            hora=hora_evento,

            descripcion=descripcion,

            estado=EventoAgenda.EstadoEvento.PROGRAMADO,

            # Permite saber quién lo creó
            creado_por=request.user,

        )


        messages.success(
            request,
            "El evento fue agregado a tu agenda correctamente."
        )


        return redirect(
            "agenda_apicultor"
        )


    # ========================================================
    # GET
    # ========================================================

    return render(
        request,
        "panel_apicultor/crear_evento.html",
        {

            "apicultor":
                apicultor,

            "apiarios":
                apiarios,

            "colmenas":
                colmenas,

            "tipos_disponibles":
                tipos_disponibles,

            "fecha_hoy":
                timezone.localdate(),

            "valores_formulario":
                {},

        }
    )



# ============================================================
# CREAR EVENTO
# PANEL APICULTOR
# ============================================================

@login_required
def crear_evento_apicultor(request):

    # ========================================================
    # 1. APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # 2. APIARIOS ASIGNADOS AL APICULTOR
    #
    # El apicultor únicamente puede crear eventos
    # relacionados con sus propios apiarios.
    # ========================================================

    apiarios = (
        Apiario.objects
        .filter(
            id_apicultor=apicultor
        )
        .order_by(
            "nombreapiario"
        )
    )


    # ========================================================
    # 3. COLMENAS DE LOS APIARIOS ASIGNADOS
    # ========================================================

    colmenas = (
        Colmena.objects
        .filter(
            id_apiario__id_apicultor=apicultor
        )
        .select_related(
            "id_apiario"
        )
        .order_by(
            "id_apiario__nombreapiario",
            "codigocolmena"
        )
    )


    # ========================================================
    # 4. TIPOS DE EVENTO DISPONIBLES
    #
    # Estos deben coincidir con EventoAgenda.TipoEvento
    # y con crear_evento.html / crear_evento.js.
    # ========================================================

    tipos_disponibles = [

        {
            "valor": EventoAgenda.TipoEvento.MANTENIMIENTO,
            "nombre": "Mantenimiento",
        },

        {
            "valor": EventoAgenda.TipoEvento.REVISION,
            "nombre": "Revisión",
        },

        {
            "valor": EventoAgenda.TipoEvento.INCIDENCIA,
            "nombre": "Incidencia",
        },

        {
            "valor": EventoAgenda.TipoEvento.EVENTO,
            "nombre": "Evento general",
        },

    ]


    # ========================================================
    # 5. TIPOS VÁLIDOS PARA EL BACKEND
    #
    # No confiamos solamente en el HTML.
    # Si alguien modifica manualmente el POST,
    # solo permitimos estos valores.
    # ========================================================

    tipos_validos = [

        EventoAgenda.TipoEvento.MANTENIMIENTO,

        EventoAgenda.TipoEvento.REVISION,

        EventoAgenda.TipoEvento.INCIDENCIA,

        EventoAgenda.TipoEvento.EVENTO,

    ]


    # ========================================================
    # 6. FECHA ACTUAL
    # ========================================================

    fecha_hoy = timezone.localdate()


    # ========================================================
    # 7. PROCESAR FORMULARIO
    # ========================================================

    if request.method == "POST":


        # ====================================================
        # 7.1. RECIBIR DATOS
        # ====================================================

        titulo = request.POST.get(
            "titulo",
            ""
        ).strip()


        tipo_evento = request.POST.get(
            "tipo_evento",
            ""
        ).strip()


        id_apiario = request.POST.get(
            "apiario",
            ""
        ).strip()


        id_colmena = request.POST.get(
            "colmena",
            ""
        ).strip()


        fecha = request.POST.get(
            "fecha",
            ""
        ).strip()


        hora = request.POST.get(
            "hora",
            ""
        ).strip()


        descripcion = request.POST.get(
            "descripcion",
            ""
        ).strip()


        # ====================================================
        # 7.2. CONSERVAR DATOS DEL FORMULARIO
        #
        # Si existe un error, Django vuelve a renderizar
        # el formulario sin borrar lo que escribió el usuario.
        # ====================================================

        valores_formulario = {

            "titulo":
                titulo,

            "tipo_evento":
                tipo_evento,

            "apiario":
                id_apiario,

            "colmena":
                id_colmena,

            "fecha":
                fecha,

            "hora":
                hora,

            "descripcion":
                descripcion,

        }


        # ====================================================
        # 7.3. LISTA DE ERRORES
        # ====================================================

        errores = []


        # ====================================================
        # 8. VALIDAR TÍTULO
        # ====================================================

        if not titulo:

            errores.append(
                "Debes ingresar un título para el evento."
            )


        elif len(titulo) < 3:

            errores.append(
                "El título debe tener al menos 3 caracteres."
            )


        elif len(titulo) > 150:

            errores.append(
                "El título no puede superar los 150 caracteres."
            )


        # ====================================================
        # 9. VALIDAR TIPO DE EVENTO
        # ====================================================

        if tipo_evento not in tipos_validos:

            errores.append(
                "Selecciona un tipo de evento válido."
            )


        # ====================================================
        # 10. VALIDAR APIARIO
        #
        # La búsqueda se hace únicamente dentro de los
        # apiarios asignados al apicultor autenticado.
        # ====================================================

        apiario = None


        if not id_apiario:

            errores.append(
                "Debes seleccionar un apiario."
            )


        elif not id_apiario.isdigit():

            errores.append(
                "El apiario seleccionado no es válido."
            )


        else:

            apiario = (
                apiarios
                .filter(
                    id_apiario=int(
                        id_apiario
                    )
                )
                .first()
            )


            if not apiario:

                errores.append(
                    "El apiario seleccionado no pertenece "
                    "a tus apiarios asignados."
                )


        # ====================================================
        # 11. VALIDAR COLMENA
        #
        # La colmena es opcional.
        #
        # Si queda vacía:
        #     id_colmena = None
        #
        # y el evento se considera general del apiario.
        # ====================================================

        colmena = None


        if id_colmena:


            # ------------------------------------------------
            # ID válido
            # ------------------------------------------------

            if not id_colmena.isdigit():

                errores.append(
                    "La colmena seleccionada no es válida."
                )


            # ------------------------------------------------
            # Solo validamos la colmena si ya encontramos
            # correctamente el apiario.
            # ------------------------------------------------

            elif apiario:

                colmena = (
                    Colmena.objects
                    .filter(

                        id_colmena=int(
                            id_colmena
                        ),

                        id_apiario=apiario,

                        id_apiario__id_apicultor=apicultor,

                    )
                    .first()
                )


                if not colmena:

                    errores.append(
                        "La colmena seleccionada no pertenece "
                        "al apiario indicado."
                    )


        # ====================================================
        # 12. VALIDAR FECHA
        # ====================================================

        fecha_evento = None


        if not fecha:

            errores.append(
                "Debes seleccionar la fecha del evento."
            )


        else:

            try:

                fecha_evento = datetime.strptime(
                    fecha,
                    "%Y-%m-%d"
                ).date()


            except ValueError:

                errores.append(
                    "La fecha seleccionada no es válida."
                )


        # ====================================================
        # 13. NO PERMITIR FECHAS PASADAS
        # ====================================================

        if (
            fecha_evento
            and
            fecha_evento < fecha_hoy
        ):

            errores.append(
                "No puedes programar un evento "
                "en una fecha pasada."
            )


        # ====================================================
        # 14. VALIDAR HORA
        # ====================================================

        hora_evento = None


        if not hora:

            errores.append(
                "Debes seleccionar la hora del evento."
            )


        else:

            try:

                hora_evento = datetime.strptime(
                    hora,
                    "%H:%M"
                ).time()


            except ValueError:

                errores.append(
                    "La hora seleccionada no es válida."
                )


        # ====================================================
        # 15. SI EL EVENTO ES HOY
        #
        # No permitimos crear un evento para una hora
        # que ya pasó.
        # ====================================================

        if (
            fecha_evento
            and
            hora_evento
            and
            fecha_evento == fecha_hoy
        ):

            hora_actual = (
                timezone.localtime()
                .replace(
                    second=0,
                    microsecond=0
                )
                .time()
            )


            if hora_evento <= hora_actual:

                errores.append(
                    "Si el evento es para hoy, debes seleccionar "
                    "una hora posterior a la actual."
                )


        # ====================================================
        # 16. VALIDAR DESCRIPCIÓN
        # ====================================================

        if len(descripcion) > 500:

            errores.append(
                "La descripción no puede superar "
                "los 500 caracteres."
            )


        # ====================================================
        # 17. SI HAY ERRORES
        #
        # No guardamos nada y devolvemos el formulario
        # conservando todos los campos.
        # ====================================================

        if errores:


            for error in errores:

                messages.error(
                    request,
                    error
                )


            contexto = {

                "apicultor":
                    apicultor,

                "apiarios":
                    apiarios,

                "colmenas":
                    colmenas,

                "tipos_disponibles":
                    tipos_disponibles,

                "fecha_hoy":
                    fecha_hoy,

                "valores_formulario":
                    valores_formulario,

            }


            return render(
                request,
                "panel_apicultor/crear_evento.html",
                contexto
            )


        # ====================================================
        # 18. CREAR EVENTO
        # ====================================================

        EventoAgenda.objects.create(


            # ------------------------------------------------
            # INFORMACIÓN DEL EVENTO
            # ------------------------------------------------

            titulo=
                titulo,

            tipo_evento=
                tipo_evento,


            # ------------------------------------------------
            # UBICACIÓN
            # ------------------------------------------------

            id_apiario=
                apiario,

            id_colmena=
                colmena,


            # ------------------------------------------------
            # RESPONSABLE
            #
            # Si el apicultor crea el evento,
            # el mismo queda como responsable.
            # ------------------------------------------------

            responsable=
                apicultor,


            # ------------------------------------------------
            # PROGRAMACIÓN
            # ------------------------------------------------

            fecha=
                fecha_evento,

            hora=
                hora_evento,


            # ------------------------------------------------
            # DESCRIPCIÓN
            # ------------------------------------------------

            descripcion=
                descripcion,


            # ------------------------------------------------
            # ESTADO INICIAL
            # ------------------------------------------------

            estado=
                EventoAgenda.EstadoEvento.PROGRAMADO,


            # ------------------------------------------------
            # USUARIO QUE CREÓ EL EVENTO
            # ------------------------------------------------

            creado_por=
                request.user,

        )


        # ====================================================
        # 19. MENSAJE DE ÉXITO
        # ====================================================

        messages.success(
            request,
            "El evento fue agregado a tu agenda correctamente."
        )


        # ====================================================
        # 20. REGRESAR A LA AGENDA
        # ====================================================

        return redirect(
            "agenda_apicultor"
        )


    # ========================================================
    # 21. GET
    #
    # Primera vez que el usuario abre Crear evento.
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "apiarios":
            apiarios,

        "colmenas":
            colmenas,

        "tipos_disponibles":
            tipos_disponibles,

        "fecha_hoy":
            fecha_hoy,

        "valores_formulario":
            {},

    }


    return render(
        request,
        "panel_apicultor/crear_evento.html",
        contexto
    )
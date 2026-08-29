from django.shortcuts import render, redirect, get_object_or_404
from dbmicolmena.models import Apiario, Apicultor, Colmena, Mantenimiento, Incidencia, Administrador, Rol,  EventoAgenda, HistorialReporte
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.db.models import Q, Count, Sum
from django.core.paginator import Paginator
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from functools import wraps
from django.contrib.auth import update_session_auth_hash
import traceback
import json
from calendar import monthrange
from django.utils import timezone
from django.views.decorators.http import require_POST
from panel_admin.forms import (VinculacionApicultorForm,RegistroLaboralMensualForm,)
from dbmicolmena.models import (VinculacionApicultor,RegistroLaboralMensual,)
from django.utils.text import slugify
from django.views.decorators.http import require_GET
from django.template.loader import render_to_string
from django.http import HttpResponse, FileResponse, JsonResponse
from datetime import datetime, date
from collections import defaultdict
from calendar import Calendar
from panel_admin.forms import EventoAgendaForm
from pathlib import Path
from django.urls import reverse
from usuarios.models import HistorialAcceso
from django.core.files.base import ContentFile
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from panel_admin.models import ConfiguracionSistema,ConfiguracionNotificaciones, Notificacion

from panel_admin.reportes.estado_colmenas import (
    generar_reporte_estado_colmenas_pdf,
)
from panel_admin.reportes.incidencias import (
    generar_reporte_incidencias_pdf,
)

from panel_admin.reportes.mantenimientos import (
    generar_reporte_mantenimientos_pdf,
)

from panel_admin.reportes.actividad_apicultores import (
    generar_reporte_actividad_apicultores_pdf,
)

from panel_admin.reportes.actividad_mensual import (
    generar_reporte_actividad_mensual_pdf,
)

from panel_admin.reportes.reporte_corporativo import (
    generar_reporte_corporativo_pdf,
)

from panel_admin.permisos import (
    permiso_requerido,
    usuario_tiene_permiso,
    alguno_permiso_requerido,
)

from panel_admin.notificaciones import (
    notificar_incidencia_creada,
    notificar_mantenimiento_creado,
    revisar_alertas_mantenimientos,
    revisar_alertas_mantenimientos,
    revisar_alertas_agenda,
    revisar_evento_agenda,
    notificar_colmena_en_riesgo,
    revisar_cambio_estado_colmena,
    notificar_cambio_password,
)


from panel_admin.models import (
    ConfiguracionSistema,
    ConfiguracionNotificaciones,
    ConfiguracionSeguridad,
)

from usuarios.services import (
    obtener_sesiones_activas_usuario,
    registrar_historial_acceso,
    sincronizar_session_key,
    obtener_politica_2fa,
)

from django.contrib.auth.password_validation import (
    validate_password,
)

from usuarios.models import (
    HistorialAcceso,
    Configuracion2FA,
)


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

# =========================================================
# LÓGICA DEL DASHBOARD / INICIO
# =========================================================

def obtener_datos_dashboard():
    """
    Reúne los datos "en vivo" del panel administrador:
    tarjetas de resumen y las 3 notificaciones más recientes
    (Mantenimientos + Incidencias combinadas y ordenadas por fecha).

    Se usa tanto en la carga normal de la página (dashboard_admin)
    como en el endpoint de actualización periódica (dashboard_datos_json),
    para no repetir la lógica.
    """

    total_apicultores = Apicultor.objects.count()
    total_apiarios = Apiario.objects.count()
    total_colmenas = Colmena.objects.count()
    total_incidencias_activas = (
        Incidencia.objects.exclude(estado="Resuelta").count()
    )

    notificaciones = []

    ultimos_mantenimientos = (
        Mantenimiento.objects
        .select_related("id_apiario", "id_colmena")
        .order_by("-fechaejecucion", "-id_mantenimiento")[:5]
    )

    for m in ultimos_mantenimientos:

        if m.id_apiario:
            lugar = m.id_apiario.nombreapiario
        elif m.id_colmena:
            lugar = m.id_colmena.codigocolmena
        else:
            lugar = "N/D"

        notificaciones.append({
            "id": f"mantenimiento-{m.id_mantenimiento}",
            "titulo": "Mantenimiento",
            "descripcion": f'Programado en "{lugar}"',
            "fecha": m.fechaejecucion.isoformat() if m.fechaejecucion else None,
            "orden": m.id_mantenimiento,
            "icono": "bi-tools",
        })

    ultimas_incidencias = (
        Incidencia.objects
        .select_related("id_apiario", "id_colmena")
        .order_by("-fechadeteccion", "-id_incidencia")[:5]
    )

    for inc in ultimas_incidencias:

        if inc.id_colmena:
            descripcion = f'Colmena {inc.id_colmena.codigocolmena} requiere atención'
        elif inc.id_apiario:
            descripcion = f'Reportada en "{inc.id_apiario.nombreapiario}"'
        else:
            descripcion = inc.titulo

        notificaciones.append({
            "id": f"incidencia-{inc.id_incidencia}",
            "titulo": "Nueva incidencia",
            "descripcion": descripcion,
            "fecha": inc.fechadeteccion.isoformat() if inc.fechadeteccion else None,
            "orden": inc.id_incidencia,
            "icono": "bi-exclamation-triangle-fill",
        })

    # Se ordenan TODAS por fecha y solo se dejan las 3 más recientes.
    # Como esta función se vuelve a ejecutar en cada petición (ya sea
    # la carga normal o el polling), el resultado siempre refleja
    # el estado actual de la base de datos: al entrar un registro nuevo
    # al top 3, el más viejo automáticamente deja de calificar.
    notificaciones.sort(
        key=lambda n: (n["fecha"] or "", n["orden"]),
        reverse=True
    )
    notificaciones = notificaciones[:3]

    return {
        "total_apicultores": total_apicultores,
        "total_apiarios": total_apiarios,
        "total_colmenas": total_colmenas,
        "total_incidencias_activas": total_incidencias_activas,
        "notificaciones": notificaciones,
    }


@administrador_requerido
def dashboard_admin(request):

    # ========================================================
    # REVISAR ALERTAS AUTOMÁTICAS DE MANTENIMIENTO
    # ========================================================

    try:

        resultado_alertas = (
            revisar_alertas_mantenimientos()
        )


        if (
            resultado_alertas["proximos"] > 0
            or
            resultado_alertas["vencidos"] > 0
        ):

            print(
                "ALERTAS DE MANTENIMIENTO GENERADAS:",
                resultado_alertas
            )


    except Exception as error:

        print(
            "ERROR REVISANDO MANTENIMIENTOS:",
            error
        )


    # ========================================================
    # REVISAR ALERTAS AUTOMÁTICAS DE AGENDA
    # ========================================================

    try:

        resultado_agenda = (
            revisar_alertas_agenda()
        )


        if (
            resultado_agenda["hoy"] > 0
            or
            resultado_agenda["manana"] > 0
        ):

            print(
                "ALERTAS DE AGENDA GENERADAS:",
                resultado_agenda
            )


    except Exception as error:

        print(
            "ERROR REVISANDO ALERTAS DE AGENDA:",
            error
        )

    # ========================================================
    # FECHA ACTUAL
    # ========================================================

    hoy = timezone.localdate()


    # ========================================================
    # DATOS DEL DASHBOARD
    # ========================================================

    datos = obtener_datos_dashboard()


    def rango_mes(fecha_mes):

        inicio = fecha_mes.replace(
            day=1
        )

        fin = desplazar_mes(
            inicio,
            1
        )

        return inicio, fin

    # ---------- GRÁFICA DE ACTIVIDAD (últimos 6 meses, 3 líneas) ----------

    etiquetas_actividad = []
    valores_mantenimientos_actividad = []
    valores_incidencias_actividad = []

    mes_cursor = desplazar_mes(
        hoy.replace(day=1),
        -5
    )

    for _ in range(6):

        inicio_mes, fin_mes = rango_mes(
            mes_cursor
        )

        cantidad_mantenimientos = (
            Mantenimiento.objects.filter(
                fechaejecucion__gte=inicio_mes,
                fechaejecucion__lt=fin_mes
            )
            .count()
        )

        cantidad_incidencias = (
            Incidencia.objects.filter(
                fechadeteccion__gte=inicio_mes,
                fechadeteccion__lt=fin_mes
            )
            .count()
        )

        etiquetas_actividad.append(
            MESES_ESPANOL[
                inicio_mes.month
            ][:3]
        )

        valores_mantenimientos_actividad.append(
            cantidad_mantenimientos
        )

        valores_incidencias_actividad.append(
            cantidad_incidencias
        )

        mes_cursor = desplazar_mes(
            mes_cursor,
            1
        )


    # ---------- INCIDENCIAS POR PRIORIDAD (estado actual) ----------

    prioridades_orden = [
        "Baja",
        "Media",
        "Alta",
        "Crítica"
    ]

    conteo_prioridad = (
        Incidencia.objects
        .exclude(
            estado="Resuelta"
        )
        .values(
            "prioridad"
        )
        .annotate(
            total=Count(
                "id_incidencia"
            )
        )
    )

    mapa_conteo_prioridad = {
        item["prioridad"]:
            item["total"]

        for item
        in conteo_prioridad
    }

    valores_prioridad_incidencias = [

        mapa_conteo_prioridad.get(
            prioridad,
            0
        )

        for prioridad
        in prioridades_orden

    ]


    # ---------- GRÁFICA DE MANTENIMIENTOS (últimos 3 meses) ----------

    etiquetas_mantenimientos = []
    valores_mantenimientos = []

    mes_cursor = desplazar_mes(
        hoy.replace(day=1),
        -2
    )

    for _ in range(3):

        inicio_mes, fin_mes = rango_mes(
            mes_cursor
        )

        cantidad = (
            Mantenimiento.objects.filter(
                fechaejecucion__gte=inicio_mes,
                fechaejecucion__lt=fin_mes
            )
            .count()
        )

        etiquetas_mantenimientos.append(
            MESES_ESPANOL[
                inicio_mes.month
            ][:3]
        )

        valores_mantenimientos.append(
            cantidad
        )

        mes_cursor = desplazar_mes(
            mes_cursor,
            1
        )


    contexto = {

        "nombre_usuario":
            request.user.get_full_name()
            or request.user.username,

        **datos,

        "etiquetas_actividad_json":
            json.dumps(
                etiquetas_actividad
            ),

        "valores_mantenimientos_actividad_json":
            json.dumps(
                valores_mantenimientos_actividad
            ),

        "valores_incidencias_actividad_json":
            json.dumps(
                valores_incidencias_actividad
            ),

        "etiquetas_prioridad_incidencias_json":
            json.dumps(
                prioridades_orden
            ),

        "valores_prioridad_incidencias_json":
            json.dumps(
                valores_prioridad_incidencias
            ),

        "etiquetas_mantenimientos_json":
            json.dumps(
                etiquetas_mantenimientos
            ),

        "valores_mantenimientos_json":
            json.dumps(
                valores_mantenimientos
            ),

    }


    return render(
        request,
        "admin_panel/dashboard.html",
        contexto
    )


@administrador_requerido
def dashboard_datos_json(request):
    """
    Endpoint consultado periódicamente (polling) desde dashboard.js
    para refrescar las tarjetas y la actividad reciente sin recargar
    la página.
    """
    return JsonResponse(obtener_datos_dashboard())


#LOGICA DE LOS APIARIOS
@administrador_requerido
@permiso_requerido("av")
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

#Verificar mientras se escribe si el apiario existe o no en la database
@administrador_requerido
@permiso_requerido("av")
def verificar_nombre_apiario(request):
    """
    Endpoint de solo consulta (no modifica nada) usado para
    validar en tiempo real si un nombre de apiario ya existe.
    Se usa desde apiarios_vista.js mientras el usuario escribe.
    """
    nombre = request.GET.get("nombre", "").strip()
    id_apiario_actual = request.GET.get("id_apiario", "").strip()

    if not nombre:
        return JsonResponse({"existe": False})

    consulta = Apiario.objects.filter(nombreapiario__iexact=nombre)

    if id_apiario_actual:
        consulta = consulta.exclude(id_apiario=id_apiario_actual)

    return JsonResponse({"existe": consulta.exists()})

@administrador_requerido
@permiso_requerido("ag",redireccion="apiarios_admin")
def crear_apiario(request):
    if request.method == "POST":

        nombre = request.POST.get("nombre_apiario", "").strip()

        if Apiario.objects.filter(nombreapiario__iexact=nombre).exists():
            messages.error(request, "Ya existe un apiario con ese nombre.")
            return redirect("apiarios_admin")

        Apiario.objects.create(
            nombreapiario=nombre,
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
@permiso_requerido("ag",redireccion="apiarios_admin")
def editar_apiario(request, id):
    apiario = get_object_or_404(Apiario, id_apiario=id)

    if request.method == "POST":

        nombre = request.POST.get("nombre_apiario", "").strip()

        nombre_duplicado = (
            Apiario.objects
            .filter(nombreapiario__iexact=nombre)
            .exclude(id_apiario=apiario.id_apiario)
            .exists()
        )

        if nombre_duplicado:
            messages.error(request, "Ya existe un apiario con ese nombre.")
            return redirect("apiarios_admin")

        apiario.nombreapiario = nombre
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
@permiso_requerido("ag",redireccion="apiarios_admin")
def eliminar_apiario(request, id):
    apiario = get_object_or_404(Apiario, id_apiario=id)

    if request.method == "POST":
        apiario.delete()

    return redirect("apiarios_admin")


#LOGICA DE LOS COLMENAS
@administrador_requerido
@permiso_requerido("cv")
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
@permiso_requerido(
    "cg",
    redireccion="colmenas_admin"
)
def crear_colmena(request):

    if request.method == "POST":

        ultima_colmena = (
            Colmena.objects
            .order_by(
                "-id_colmena"
            )
            .first()
        )


        if ultima_colmena:

            nuevo_numero = (
                ultima_colmena.id_colmena
                + 1
            )

        else:

            nuevo_numero = 1


        codigo = (
            f"CM{nuevo_numero:08d}"
        )


        # ====================================================
        # CREAR COLMENA
        # ====================================================

        colmena = (
            Colmena.objects.create(

                id_apiario_id=
                    request.POST.get(
                        "id_apiario"
                    ),

                codigocolmena=
                    codigo,

                estadocolmena=
                    request.POST.get(
                        "estado_colmena"
                    ),

                fecharegistro=
                    request.POST.get(
                        "fecha_registro"
                    ),

                descripcion=
                    request.POST.get(
                        "descripcion"
                    ),

                imagen=
                    request.FILES.get(
                        "imagen"
                    )

            )
        )


        # ====================================================
        # NOTIFICAR SI NACE EN ESTADO RIESGO
        # ====================================================

        try:

            notificar_colmena_en_riesgo(
                colmena
            )

        except Exception as error:

            print(
                "ERROR GENERANDO ALERTA DE COLMENA:",
                error
            )


    return redirect(
        "colmenas_admin"
    )


@administrador_requerido
@permiso_requerido(
    "cg",
    redireccion="colmenas_admin"
)
def editar_colmena(request, id):

    colmena = get_object_or_404(
        Colmena,
        id_colmena=id
    )


    if request.method == "POST":

        # ====================================================
        # GUARDAR ESTADO ANTERIOR
        # ====================================================

        estado_anterior = (
            colmena.estadocolmena
        )


        # ====================================================
        # ACTUALIZAR DATOS
        # ====================================================

        colmena.id_apiario_id = (
            request.POST.get(
                "id_apiario"
            )
        )


        colmena.estadocolmena = (
            request.POST.get(
                "estado_colmena"
            )
        )


        colmena.fecharegistro = (
            request.POST.get(
                "fecha_registro"
            )
        )


        colmena.descripcion = (
            request.POST.get(
                "descripcion"
            )
        )


        # ====================================================
        # IMAGEN
        # ====================================================

        if request.FILES.get(
            "imagen"
        ):

            colmena.imagen = (
                request.FILES.get(
                    "imagen"
                )
            )


        # ====================================================
        # GUARDAR COLMENA
        # ====================================================

        colmena.save()


        # ====================================================
        # REVISAR CAMBIO A ESTADO RIESGO
        # ====================================================

        try:

            revisar_cambio_estado_colmena(
                colmena,
                estado_anterior
            )

        except Exception as error:

            print(
                "ERROR REVISANDO ESTADO DE COLMENA:",
                error
            )


    return redirect(
        "colmenas_admin"
    )



@administrador_requerido
@permiso_requerido("cg",redireccion="colmenas_admin")
def eliminar_colmena(request, id):
    colmena = get_object_or_404(Colmena, id_colmena=id)

    if request.method == "POST":
        colmena.delete()

    return redirect("colmenas_admin")

#LOGICA DE MATENIMIENTOS
@administrador_requerido
@permiso_requerido("mg")
def mantenimientos_admin(request):

    apicultores = (
        Apicultor.objects
        .select_related("user")
        .all()
    )

    apiarios = Apiario.objects.all()

    colmenas = (
        Colmena.objects
        .select_related("id_apiario")
        .all()
    )

    mantenimientos_lista = (
        Mantenimiento.objects
        .select_related(
            "id_apiario",
            "id_colmena",
            "id_colmena__id_apiario"
        )
        .all()
        .order_by("id_mantenimiento")
    )

    apiario_id = request.GET.get("apiario")
    colmena_id = request.GET.get("colmena")
    estado = request.GET.get("estado")

    if apiario_id:
        mantenimientos_lista = (
            mantenimientos_lista.filter(
                id_apiario_id=apiario_id
            )
        )

    if colmena_id:
        mantenimientos_lista = (
            mantenimientos_lista.filter(
                id_colmena_id=colmena_id
            )
        )

    if estado:
        mantenimientos_lista = (
            mantenimientos_lista.filter(
                estado=estado
            )
        )

    paginator = Paginator(
        mantenimientos_lista,
        5
    )

    page_number = request.GET.get("page")

    mantenimientos = paginator.get_page(
        page_number
    )

    return render(
        request,
        "admin_panel/mantenimientos.html",
        {
            "mantenimientos": mantenimientos,
            "apicultores": apicultores,
            "apiarios": apiarios,
            "colmenas": colmenas,
        }
    )




@administrador_requerido
@permiso_requerido(
    "mr",
    redireccion="mantenimientos_admin"
)
def crear_mantenimiento(request):

    if request.method == "POST":

        entidad = request.POST.get(
            "entidad_mantenimiento"
        )

        responsable_id = request.POST.get(
            "responsable_id"
        )

        id_apiario = None
        id_colmena = None

        responsable = "Sin Responsable"


        # ====================================================
        # RESPONSABLE
        # ====================================================

        if responsable_id:

            apicultor_responsable = (
                Apicultor.objects
                .select_related("user")
                .filter(
                    pk=responsable_id
                )
                .first()
            )


            if (
                apicultor_responsable
                and apicultor_responsable.user
            ):

                responsable = (
                    apicultor_responsable
                    .user
                    .get_full_name()
                    .strip()
                    or
                    apicultor_responsable
                    .user
                    .username
                )


        # ====================================================
        # ENTIDAD
        # ====================================================

        if entidad == "Apiario":

            id_apiario = request.POST.get(
                "id_apiario"
            )


        elif entidad == "Colmena":

            id_colmena = request.POST.get(
                "id_colmena"
            )

            colmena = (
                Colmena.objects
                .filter(
                    id_colmena=id_colmena
                )
                .first()
            )

            if (
                colmena
                and colmena.id_apiario
            ):

                id_apiario = (
                    colmena.id_apiario_id
                )


        # ====================================================
        # CREAR
        # ====================================================

        mantenimiento = (
            Mantenimiento.objects.create(

                entidadmantenimiento=entidad,

                id_apiario_id=id_apiario,

                id_colmena_id=id_colmena,

                tipo=request.POST.get(
                    "tipo"
                ),

                fechaejecucion=request.POST.get(
                    "fecha_ejecucion"
                ),

                estado="Pendiente",

                prioridad=request.POST.get(
                    "prioridad"
                ),

                observaciones=request.POST.get(
                    "observaciones"
                ),

                responsable=responsable
            )
        )


        # ====================================================
        # NOTIFICACIÓN
        # ====================================================

        try:

            notificar_mantenimiento_creado(
                mantenimiento
            )

        except Exception as error:

            print(
                "ERROR GENERANDO NOTIFICACIÓN DE MANTENIMIENTO:",
                error
            )


        messages.success(
            request,
            "Mantenimiento creado correctamente."
        )


    return redirect(
        "mantenimientos_admin"
    )




@administrador_requerido
@permiso_requerido("mg",redireccion="mantenimientos_admin")
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
@require_POST
@permiso_requerido("mg",redireccion="mantenimientos_admin")
def eliminar_mantenimiento(request, id):

    mantenimiento = get_object_or_404(
        Mantenimiento,
        id_mantenimiento=id
    )

    mantenimiento.delete()

    messages.success(
        request,
        "Mantenimiento eliminado correctamente."
    )

    return redirect("mantenimientos_admin")


# LOGICO DE INCIDENCIAS 

@administrador_requerido
@permiso_requerido("ig")
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
@permiso_requerido("ir",redireccion="incidencias_admin")
def crear_incidencia(request):
    if request.method != "POST":
        return redirect("incidencias_admin")

    entidad = request.POST.get("entidadincidencia", "").strip()
    titulo = request.POST.get("titulo", "").strip()
    prioridad = request.POST.get("prioridad", "").strip()
    fecha_deteccion = request.POST.get("fechadeteccion", "").strip()
    estado = "Pendiente"  # toda incidencia nace como Pendiente, sin importar el POST
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


    # ============================================================
    # GENERAR NOTIFICACIÓN AUTOMÁTICA
    # ============================================================

    try:

        notificar_incidencia_creada(
            incidencia
        )

    except Exception as error:

        print(
            "ERROR GENERANDO NOTIFICACIÓN DE INCIDENCIA:",
            error
        )


    # ============================================================
    # MENSAJE DE ÉXITO
    # ============================================================

    messages.success(
        request,
        "La incidencia fue registrada correctamente."
    )

    return redirect("incidencias_admin")

#editar incidencias 

@administrador_requerido
@permiso_requerido("ig",redireccion="incidencias_admin")
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
@permiso_requerido("ig",redireccion="incidencias_admin")
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

#Verificar en vivo si username, correo o identificación ya existen
@administrador_requerido
def verificar_dato_apicultor(request):
    """
    Endpoint de solo consulta (no modifica nada) usado para
    validar en tiempo real si un username, correo o identificación
    ya están en uso. Se usa desde apicultor.js mientras el usuario
    escribe, tanto en Agregar como en Editar.
    """
    campo = request.GET.get("campo", "").strip()
    valor = request.GET.get("valor", "").strip()
    id_apicultor_actual = request.GET.get("id_apicultor", "").strip()

    if not campo or not valor:
        return JsonResponse({"existe": False})

    if campo == "username":
        consulta = User.objects.filter(username__iexact=valor)

        if id_apicultor_actual:
            apicultor_actual = Apicultor.objects.filter(pk=id_apicultor_actual).first()
            if apicultor_actual and apicultor_actual.user:
                consulta = consulta.exclude(pk=apicultor_actual.user_id)

        return JsonResponse({"existe": consulta.exists()})

    if campo == "correo":
        consulta = User.objects.filter(email__iexact=valor)

        if id_apicultor_actual:
            apicultor_actual = Apicultor.objects.filter(pk=id_apicultor_actual).first()
            if apicultor_actual and apicultor_actual.user:
                consulta = consulta.exclude(pk=apicultor_actual.user_id)

        return JsonResponse({"existe": consulta.exists()})

    if campo == "identificacion":
        consulta = Apicultor.objects.filter(identificacion=valor)

        if id_apicultor_actual:
            consulta = consulta.exclude(pk=id_apicultor_actual)

        return JsonResponse({"existe": consulta.exists()})

    return JsonResponse({"existe": False})

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

#LOGICA DE LA AGENDA

MESES_ESPANOL = [
    "",
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


def obtener_mes_agenda(valor=None):

    if valor:

        try:
            return datetime.strptime(
                valor,
                "%Y-%m"
            ).date().replace(day=1)

        except ValueError:
            pass

    return timezone.localdate().replace(day=1)


def desplazar_mes(fecha, cantidad):

    numero_mes = fecha.month - 1 + cantidad

    anio = fecha.year + numero_mes // 12
    mes = numero_mes % 12 + 1

    return date(anio, mes, 1)


def agregar_errores_formulario(request, formulario):

    for campo, errores in formulario.errors.items():

        for error in errores:

            if campo == "__all__":
                messages.error(request, error)
            else:
                etiqueta = (
                    formulario.fields[campo].label
                    if campo in formulario.fields
                    else campo
                )

                messages.error(
                    request,
                    f"{etiqueta}: {error}"
                )

@administrador_requerido
@permiso_requerido("agenda")
def agenda_admin(request):

    mes_actual = obtener_mes_agenda(
        request.GET.get("mes")
    )

    mes_siguiente = desplazar_mes(
        mes_actual,
        1
    )

    mes_anterior = desplazar_mes(
        mes_actual,
        -1
    )

    filtro_tipo = request.GET.get(
        "tipo",
        ""
    ).strip()

    filtro_apiario = request.GET.get(
        "apiario",
        ""
    ).strip()

    busqueda = request.GET.get(
        "buscar",
        ""
    ).strip()

    eventos = (
        EventoAgenda.objects
        .select_related(
            "id_apiario",
            "id_colmena",
            "responsable",
            "responsable__user",
        )
        .filter(
            fecha__gte=mes_actual,
            fecha__lt=mes_siguiente
        )
    )

    if filtro_tipo:

        eventos = eventos.filter(
            tipo_evento=filtro_tipo
        )

    if filtro_apiario.isdigit():

        eventos = eventos.filter(
            id_apiario_id=int(filtro_apiario)
        )

    if busqueda:

        eventos = eventos.filter(
            Q(titulo__icontains=busqueda)
            | Q(descripcion__icontains=busqueda)
            | Q(id_apiario__nombreapiario__icontains=busqueda)
            | Q(id_colmena__codigocolmena__icontains=busqueda)
            | Q(responsable__user__first_name__icontains=busqueda)
            | Q(responsable__user__last_name__icontains=busqueda)
        )

    eventos = eventos.order_by(
        "fecha",
        "hora"
    )

    eventos_por_fecha = defaultdict(list)

    for evento in eventos:
        eventos_por_fecha[evento.fecha].append(evento)

    calendario = Calendar(
        firstweekday=0
    )

    semanas_calendario = []

    for semana in calendario.monthdatescalendar(
        mes_actual.year,
        mes_actual.month
    ):

        dias_semana = []

        for fecha_dia in semana:

            dias_semana.append({
                "fecha": fecha_dia,
                "es_mes_actual": (
                    fecha_dia.month == mes_actual.month
                ),
                "es_hoy": (
                    fecha_dia == timezone.localdate()
                ),
                "eventos": eventos_por_fecha.get(
                    fecha_dia,
                    []
                ),
            })

        semanas_calendario.append(
            dias_semana
        )

    apiarios = (
        Apiario.objects.all()
        .order_by("nombreapiario")
    )

    colmenas = (
        Colmena.objects.select_related("id_apiario")
        .all()
        .order_by("codigocolmena")
    )

    responsables = (
        Apicultor.objects.select_related("user")
        .all()
        .order_by("user__first_name", "user__last_name")
    )

    return render(
        request,
        "admin_panel/agenda/agenda.html",
        {
            "semanas_calendario": semanas_calendario,
            "mes_actual": mes_actual,
            "mes_valor": mes_actual.strftime("%Y-%m"),
            "mes_anterior": mes_anterior.strftime("%Y-%m"),
            "mes_siguiente": mes_siguiente.strftime("%Y-%m"),
            "nombre_mes": (
                f"{MESES_ESPANOL[mes_actual.month]} "
                f"{mes_actual.year}"
            ),

            "apiarios": apiarios,
            "colmenas": colmenas,
            "responsables": responsables,

            "tipos_evento": EventoAgenda.TipoEvento.choices,
            "estados_evento": EventoAgenda.EstadoEvento.choices,

            "filtro_tipo": filtro_tipo,
            "filtro_apiario": filtro_apiario,
            "busqueda": busqueda,
        }
    )

@administrador_requerido
@permiso_requerido("agenda")
@require_POST
def crear_evento_agenda(request):

    formulario = EventoAgendaForm(
        request.POST
    )

    if formulario.is_valid():

        evento = formulario.save(
            commit=False
        )

        evento.creado_por = (
            request.user
        )

        evento.save()


        # ========================================================
        # GENERAR RECORDATORIO SI ES HOY O MAÑANA
        # ========================================================

        try:

            revisar_evento_agenda(
                evento
            )

        except Exception as error:

            print(
                "ERROR GENERANDO ALERTA DE AGENDA:",
                error
            )

        messages.success(
            request,
            "El evento fue creado correctamente."
        )

        mes = evento.fecha.strftime("%Y-%m")

    else:

        agregar_errores_formulario(
            request,
            formulario
        )

        mes = request.POST.get(
            "mes_retorno",
            ""
        )

    return redirect(
        f"{reverse('agenda_admin')}?mes={mes}"
    )

@administrador_requerido
@permiso_requerido("agenda")
@require_POST
def editar_evento_agenda(
    request,
    id_evento
):

    evento = get_object_or_404(
        EventoAgenda,
        pk=id_evento
    )

    formulario = EventoAgendaForm(
        request.POST,
        instance=evento
    )

    if formulario.is_valid():

        evento = formulario.save()

        messages.success(
            request,
            "El evento fue actualizado correctamente."
        )

        mes = evento.fecha.strftime("%Y-%m")

    else:

        agregar_errores_formulario(
            request,
            formulario
        )

        mes = request.POST.get(
            "mes_retorno",
            evento.fecha.strftime("%Y-%m")
        )

    return redirect(
        f"{reverse('agenda_admin')}?mes={mes}"
    )

@administrador_requerido
@permiso_requerido("agenda")
@require_POST
def eliminar_evento_agenda(
    request,
    id_evento
):

    evento = get_object_or_404(
        EventoAgenda,
        pk=id_evento
    )

    mes = evento.fecha.strftime("%Y-%m")
    titulo = evento.titulo

    evento.delete()

    messages.success(
        request,
        f'El evento "{titulo}" fue eliminado correctamente.'
    )

    return redirect(
        f"{reverse('agenda_admin')}?mes={mes}"
    )

#LOGICA DE LOS REPORTES

@administrador_requerido
@permiso_requerido("rv")
def reportes_admin(request):

    apiarios = (
        Apiario.objects
        .all()
        .order_by("nombreapiario")
    )

    historial = (
        HistorialReporte.objects
        .select_related("usuario")
        .order_by("-fecha_generacion")[:6]
    )

    tipos_reportes = [
        {
            "clave": "estado_colmenas",
            "nombre": "Estado de colmenas",
            "descripcion": (
                "Distribución, estado actual y colmenas "
                "que requieren seguimiento."
            ),
            "icono": "bi-hexagon-half",
            "clase": "reporte-colmenas",
            "disponible": True,
        },
        {
            "clave": "incidencias",
            "nombre": "Incidencias",
            "descripcion": (
                "Incidencias por tipo, prioridad, estado "
                "y tendencia histórica."
            ),
            "icono": "bi-exclamation-triangle-fill",
            "clase": "reporte-incidencias",
            "disponible": True,
        },
        {
            "clave": "mantenimientos",
            "nombre": "Mantenimientos",
            "descripcion": (
                "Actividades programadas, realizadas, "
                "vencidas y responsables."
            ),
            "icono": "bi-wrench-adjustable",
            "clase": "reporte-mantenimientos",
            "disponible": True,
        },
        {
            "clave": "actividad_apicultores",
            "nombre": "Actividad de apicultores",
            "descripcion": (
                "Carga de trabajo, apiarios asignados "
                "y actividades realizadas."
            ),
            "icono": "bi-people-fill",
            "clase": "reporte-apicultores",
            "disponible": True,
        },
        {
            "clave": "actividad_mensual",
            "nombre": "Actividad mensual",
            "descripcion": (
                "Resumen general de las actividades "
                "registradas durante el mes."
            ),
            "icono": "bi-graph-up-arrow",
            "clase": "reporte-mensual",
            "disponible": True,
        },
        {
            "clave": "comparativo",
            "nombre": "Reporte comparativo",
            "descripcion": (
                "Comparación entre meses, apiarios "
                "y principales indicadores."
            ),
            "icono": "bi-layout-text-window-reverse",
            "clase": "reporte-comparativo",
            "disponible": True,
        },
    ]

    prioridades_incidencia = (
        Incidencia.objects
        .exclude(prioridad__isnull=True)
        .exclude(prioridad="")
        .values_list(
            "prioridad",
            flat=True
        )
        .distinct()
        .order_by("prioridad")
    )

    estados_incidencia = (
        Incidencia.objects
        .exclude(estado__isnull=True)
        .exclude(estado="")
        .values_list(
            "estado",
            flat=True
        )
        .distinct()
        .order_by("estado")
    )

    apicultores = (
        Apicultor.objects
        .select_related("user")
        .all()
        .order_by(
            "user__first_name",
            "user__last_name",
            "id_apicultor"
        )
    )

    return render(
        request,
        "admin_panel/reportes/reportes.html",
        {
            "apiarios": apiarios,
            "apicultores": apicultores,
            "historial": historial,
            "tipos_reportes": tipos_reportes,
            "prioridades_incidencia": prioridades_incidencia,
            "estados_incidencia": estados_incidencia,
        }
    )

@administrador_requerido
@permiso_requerido("rg",redireccion="reportes_admin")
@require_POST
def generar_reporte_sistema(request):

    tipo_reporte = request.POST.get(
        "tipo_reporte",
        ""
    ).strip()

    mes_actividad_texto = request.POST.get(
        "mes_actividad",
        ""
    ).strip()

    fecha_desde_texto = request.POST.get(
        "fecha_desde",
        ""
    ).strip()

    fecha_hasta_texto = request.POST.get(
        "fecha_hasta",
        ""
    ).strip()

    apiario_texto = request.POST.get(
        "apiario",
        ""
    ).strip()

    incluir_graficos = (
        request.POST.get(
            "incluir_graficos"
        ) == "1"
    )

    incluir_tabla = (
        request.POST.get(
            "incluir_tabla"
        ) == "1"
    )

    incluir_resumen = (
        request.POST.get(
            "incluir_resumen"
        ) == "1"
    )

    incluir_conclusiones = (
        request.POST.get(
            "incluir_conclusiones"
        ) == "1"
    )

    solo_activas = (
        request.POST.get(
            "solo_activas"
        ) == "1"
    )

    solo_abiertas = (
        request.POST.get(
            "solo_abiertas"
        ) == "1"
    )

    comparar_periodo_anterior = (
        request.POST.get(
            "comparar_periodo_anterior"
        ) == "1"
    )

    solo_pendientes = (
        request.POST.get(
            "solo_pendientes"
        ) == "1"
    )

    apicultor_texto = request.POST.get(
        "apicultor",
        ""
    ).strip()

    # =========================================================
    # VALIDAR FECHAS
    # =========================================================

    try:

        fecha_desde = (
            datetime.strptime(
                fecha_desde_texto,
                "%Y-%m-%d"
            ).date()
            if fecha_desde_texto
            else None
        )

        fecha_hasta = (
            datetime.strptime(
                fecha_hasta_texto,
                "%Y-%m-%d"
            ).date()
            if fecha_hasta_texto
            else None
        )

    except ValueError:

        messages.error(
            request,
            "Las fechas seleccionadas no son válidas."
        )

        return redirect(
            "reportes_admin"
        )

    if (
        fecha_desde
        and fecha_hasta
        and fecha_desde > fecha_hasta
    ):

        messages.error(
            request,
            (
                "La fecha inicial no puede ser "
                "posterior a la fecha final."
            )
        )

        return redirect(
            "reportes_admin"
        )

    # =========================================================
    # VALIDAR APIARIO
    # =========================================================

    apiario_id = None
    apiario = None

    if apiario_texto:

        if not apiario_texto.isdigit():

            messages.error(
                request,
                "El apiario seleccionado no es válido."
            )

            return redirect(
                "reportes_admin"
            )

        apiario_id = int(
            apiario_texto
        )

        apiario = Apiario.objects.filter(
            pk=apiario_id
        ).first()

        if not apiario:

            messages.error(
                request,
                "El apiario seleccionado no existe."
            )

            return redirect(
                "reportes_admin"
            )

    # =========================================================
    # VALIDAR APIcultor
    # =========================================================

    apicultor_id = None
    apicultor = None

    if apicultor_texto:

        if not apicultor_texto.isdigit():

            messages.error(
                request,
                "El apicultor seleccionado no es válido."
            )

            return redirect("reportes_admin")

        apicultor_id = int(apicultor_texto)

        apicultor = (
            Apicultor.objects
            .select_related("user")
            .filter(pk=apicultor_id)
            .first()
        )

        if not apicultor:

            messages.error(
                request,
                "El apicultor seleccionado no existe."
            )

            return redirect("reportes_admin")

    # =========================================================
    # GENERAR REPORTE SEGÚN EL TIPO
    # =========================================================

    try:

        if tipo_reporte == "estado_colmenas":

            resultado = (
                generar_reporte_estado_colmenas_pdf(
                    request=request,
                    fecha_desde=fecha_desde,
                    fecha_hasta=fecha_hasta,
                    apiario_id=apiario_id,
                    incluir_graficos=incluir_graficos,
                    incluir_tabla=incluir_tabla,
                    incluir_resumen=incluir_resumen,
                    incluir_conclusiones=(
                        incluir_conclusiones
                    ),
                    solo_activas=solo_activas
                )
            )

        elif tipo_reporte == "incidencias":

            resultado = (
                generar_reporte_incidencias_pdf(
                    request=request,
                    fecha_desde=fecha_desde,
                    fecha_hasta=fecha_hasta,
                    apiario_id=apiario_id,
                    incluir_graficos=incluir_graficos,
                    incluir_tabla=incluir_tabla,
                    incluir_resumen=incluir_resumen,
                    incluir_conclusiones=(
                        incluir_conclusiones
                    ),
                    solo_abiertas=solo_abiertas,
                    comparar_periodo_anterior=(
                        comparar_periodo_anterior
                    )
                )
            )

        elif tipo_reporte == "mantenimientos":
                resultado = generar_reporte_mantenimientos_pdf(
                    request=request,
                    fecha_desde=fecha_desde,
                    fecha_hasta=fecha_hasta,
                    apiario_id=apiario_id,
                    incluir_graficos=incluir_graficos,
                    incluir_tabla=incluir_tabla,
                    incluir_resumen=incluir_resumen,
                    incluir_conclusiones=incluir_conclusiones,
                    solo_pendientes=solo_pendientes,
                    comparar_periodo_anterior=(
                        comparar_periodo_anterior
                    )
                )

        elif tipo_reporte == "actividad_apicultores":

            resultado = (
                generar_reporte_actividad_apicultores_pdf(
                    request=request,
                    fecha_desde=fecha_desde,
                    fecha_hasta=fecha_hasta,
                    apiario_id=apiario_id,
                    apicultor_id=apicultor_id,
                    incluir_graficos=incluir_graficos,
                    incluir_tabla=incluir_tabla,
                    incluir_resumen=incluir_resumen,
                    incluir_conclusiones=(
                        incluir_conclusiones
                    ),
                    comparar_periodo_anterior=(
                        comparar_periodo_anterior
                    )
                )
            )

        elif tipo_reporte == "actividad_mensual":

            if not mes_actividad_texto:

                messages.error(
                    request,
                    "Debes seleccionar el mes del reporte."
                )

                return redirect("reportes_admin")

            try:

                anio_texto, mes_texto = (
                    mes_actividad_texto.split("-")
                )

                anio = int(anio_texto)
                mes = int(mes_texto)

                if mes < 1 or mes > 12:
                    raise ValueError

                ultimo_dia = monthrange(
                    anio,
                    mes
                )[1]

                fecha_desde = date(
                    anio,
                    mes,
                    1
                )

                fecha_hasta = date(
                    anio,
                    mes,
                    ultimo_dia
                )

            except (ValueError, TypeError):

                messages.error(
                    request,
                    "El mes seleccionado no es válido."
                )

                return redirect("reportes_admin")


            resultado = generar_reporte_actividad_mensual_pdf(
                request=request,
                fecha_desde=fecha_desde,
                fecha_hasta=fecha_hasta,
                apiario_id=apiario_id,
                incluir_graficos=incluir_graficos,
                incluir_tabla=incluir_tabla,
                incluir_resumen=incluir_resumen,
                incluir_conclusiones=incluir_conclusiones,
                comparar_periodo_anterior=(
                    comparar_periodo_anterior
                )
            )

        elif tipo_reporte == "comparativo":

            resultado = generar_reporte_corporativo_pdf(
                request=request,
                fecha_desde=fecha_desde,
                fecha_hasta=fecha_hasta,
                apiario_id=apiario_id,
                incluir_graficos=incluir_graficos,
                incluir_tabla=incluir_tabla,
                incluir_resumen=incluir_resumen,
                incluir_conclusiones=incluir_conclusiones,
                comparar_periodo_anterior=(
                    comparar_periodo_anterior
                )
            )

        else:

            messages.warning(
                request,
                "Este reporte todavía no está habilitado."
            )

            return redirect(
                "reportes_admin"
            )

        pdf = resultado["pdf"]

        # =====================================================
        # NOMBRE DEL ARCHIVO
        # =====================================================

        marca_tiempo = (
            timezone.localtime()
            .strftime("%Y%m%d-%H%M%S")
        )

        nombre_tipo_archivo = (
            tipo_reporte.replace(
                "_",
                "-"
            )
        )

        nombre_archivo = (
            f"reporte-{nombre_tipo_archivo}-"
            f"{marca_tiempo}.pdf"
        )

        # =====================================================
        # FILTROS APLICADOS
        # =====================================================

        filtros = []

        if fecha_desde:

            filtros.append(
                f"Desde: {fecha_desde:%d/%m/%Y}"
            )

        if fecha_hasta:

            filtros.append(
                f"Hasta: {fecha_hasta:%d/%m/%Y}"
            )

        if apiario:

            filtros.append(
                f"Apiario: {apiario.nombreapiario}"
            )

        if (
            tipo_reporte == "estado_colmenas"
            and solo_activas
        ):

            filtros.append(
                "Solo colmenas activas"
            )

        if (
            tipo_reporte == "incidencias"
            and solo_abiertas
        ):

            filtros.append(
                "Solo incidencias abiertas"
            )

        if comparar_periodo_anterior:

            filtros.append(
                "Comparado con el periodo anterior"
            )

        if (
            tipo_reporte == "mantenimientos"
            and solo_pendientes
        ):
            filtros.append(
                "Solo mantenimientos pendientes"
            )

        if (
            tipo_reporte == "actividad_apicultores"
            and apicultor
        ):
            nombre_apicultor = (
                apicultor.user.get_full_name().strip()
                if apicultor.user
                else ""
            )

            if not nombre_apicultor:
                nombre_apicultor = (
                    apicultor.user.username
                    if apicultor.user
                    else f"Apicultor {apicultor.pk}"
                )

            filtros.append(
                f"Apicultor: {nombre_apicultor}"
            )

        # =====================================================
        # GUARDAR EN HISTORIAL
        # =====================================================


        historial = HistorialReporte(
            usuario=request.user,
            tipo_reporte=tipo_reporte,
            titulo=resultado["titulo"],
            formato="pdf",
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta,
            filtros_aplicados=" | ".join(
                filtros
            ),
            total_registros=(
                resultado["total_registros"]
            ),
            nombre_archivo=nombre_archivo,
            tamano_bytes=len(pdf),
        )

        historial.archivo.save(
            nombre_archivo,
            ContentFile(pdf),
            save=False
        )

        historial.save()


        # =====================================================
        # ABRIR PDF EN EL NAVEGADOR
        # =====================================================

        response = HttpResponse(
            pdf,
            content_type="application/pdf"
        )

        response["Content-Disposition"] = (
            f'inline; filename="{nombre_archivo}"'
        )

        return response

    except Exception as error:

        import traceback

        print("\n" + "=" * 80)
        print("ERROR COMPLETO AL GENERAR EL REPORTE")
        print("Tipo de reporte:", tipo_reporte)
        print("Mes recibido:", mes_actividad_texto)
        print("POST recibido:", request.POST.dict())
        print("Tipo de error:", type(error).__name__)
        print("Mensaje:", str(error))

        traceback.print_exc()

        print("=" * 80 + "\n")

        # Durante la depuración dejamos que Django muestre
        # la pantalla completa del error.
        raise

@administrador_requerido
@permiso_requerido("rv",redireccion="reportes_admin")
def abrir_reporte_sistema(
    request,
    id_reporte
):

    reporte = get_object_or_404(
        HistorialReporte,
        pk=id_reporte
    )

    if not reporte.archivo:

        messages.error(
            request,
            "El archivo del reporte ya no está disponible."
        )

        return redirect("reportes_admin")

    return FileResponse(
        reporte.archivo.open("rb"),
        as_attachment=False,
        filename=reporte.nombre_archivo,
        content_type="application/pdf"
    )


#___________________________________________________
# Vista de perfil y roles 
#___________________________________________________

# ============================================================
# PERMISOS DEL SISTEMA
# ============================================================

PERMISOS_SISTEMA = [
    {
        "codigo": "av",
        "nombre": "Ver apiarios",
    },
    {
        "codigo": "ag",
        "nombre": "Administrar apiarios",
    },
    {
        "codigo": "cv",
        "nombre": "Ver colmenas",
    },
    {
        "codigo": "cg",
        "nombre": "Crear / editar colmenas",
    },
    {
        "codigo": "mr",
        "nombre": "Registrar mantenimientos",
    },
    {
        "codigo": "mg",
        "nombre": "Gestionar mantenimientos",
    },
    {
        "codigo": "ir",
        "nombre": "Reportar incidencias",
    },
    {
        "codigo": "ig",
        "nombre": "Gestionar incidencias",
    },
    {
        "codigo": "agenda",
        "nombre": "Acceder a agenda",
    },
    {
        "codigo": "rv",
        "nombre": "Ver reportes",
    },
    {
        "codigo": "rg",
        "nombre": "Generar reportes",
    },
    {
        "codigo": "ug",
        "nombre": "Administrar usuarios",
    },
    {
        "codigo": "roles",
        "nombre": "Administrar roles",
    },
    {
        "codigo": "cfg",
        "nombre": "Configuración del sistema",
    },
    {
        "codigo": "perfil",
        "nombre": "Mi perfil",
    },
]


PERMISOS_ADMIN_DEFAULT = {
    "av",
    "ag",
    "cv",
    "cg",
    "mr",
    "mg",
    "ir",
    "ig",
    "agenda",
    "rv",
    "rg",
    "ug",
    "roles",
    "cfg",
    "perfil",
}


PERMISOS_APICULTOR_DEFAULT = {
    "av",
    "cv",
    "mr",
    "ir",
    "agenda",
    "perfil",
}

@administrador_requerido
@alguno_permiso_requerido(
    "ug",
    "roles"
)
def usuarios_roles_admin(request):

    # ========================================================
    # 1. USUARIOS DJANGO
    # ========================================================

    usuarios_django = (
        User.objects
        .all()
        .order_by(
            "first_name",
            "last_name",
            "username"
        )
    )


    # ========================================================
    # 2. PERFILES ADMINISTRADORES
    # ========================================================

    administradores = {
        administrador.user_id: administrador

        for administrador in (
            Administrador.objects
            .select_related(
                "user",
                "id_rol"
            )
            .exclude(
                user__isnull=True
            )
        )
    }


    # ========================================================
    # 3. PERFILES APICULTORES
    # ========================================================

    apicultores = {
        apicultor.user_id: apicultor

        for apicultor in (
            Apicultor.objects
            .select_related(
                "user",
                "id_rol"
            )
            .exclude(
                user__isnull=True
            )
        )
    }


    # ========================================================
    # 4. CONSTRUIR LISTA DE USUARIOS
    # ========================================================

    usuarios = []


    for usuario in usuarios_django:

        # ----------------------------------------------------
        # Valores por defecto
        # ----------------------------------------------------

        perfil = None

        tipo_perfil = None

        rol_nombre = "Sin rol"

        celular = ""

        nivel_acceso = ""

        foto = ""

        puede_editar_administrador = False


        # ====================================================
        # ADMINISTRADOR
        # ====================================================

        if usuario.id in administradores:

            perfil = administradores[
                usuario.id
            ]

            tipo_perfil = (
                "administrador"
            )


            # ------------------------------------------------
            # Rol
            # ------------------------------------------------

            if perfil.id_rol:

                rol_nombre = (
                    perfil.id_rol.nombrerol
                    or "Administrador"
                )

            else:

                rol_nombre = (
                    "Administrador"
                )


            # ------------------------------------------------
            # Datos propios del Administrador
            # ------------------------------------------------

            celular = (
                perfil.celular
                or ""
            )


            nivel_acceso = (
                perfil.nivelacceso
                or "Alto"
            )


            if perfil.fotoperfil:

                try:

                    foto = (
                        perfil.fotoperfil.url
                    )

                except ValueError:

                    foto = ""


            
            # Este usuario sí tiene registro en la tabla
            # Administrador, por lo tanto puede utilizar
            # editar_administrador().
            

            puede_editar_administrador = True


        # ====================================================
        # APICULTOR
        # ====================================================

        elif usuario.id in apicultores:

            perfil = apicultores[
                usuario.id
            ]

            tipo_perfil = (
                "apicultor"
            )


            # ------------------------------------------------
            # Rol
            # ------------------------------------------------

            if perfil.id_rol:

                rol_nombre = (
                    perfil.id_rol.nombrerol
                    or "Apicultor"
                )

            else:

                rol_nombre = (
                    "Apicultor"
                )


            # ------------------------------------------------
            # Datos propios del Apicultor
            # ------------------------------------------------

            celular = (
                perfil.telefono
                or ""
            )


            if perfil.fotoperfil:

                try:

                    foto = (
                        perfil.fotoperfil.url
                    )

                except ValueError:

                    foto = ""


        # ====================================================
        # SUPERUSUARIO SIN PERFIL ADMINISTRADOR
        # ====================================================

        elif usuario.is_superuser:

            tipo_perfil = (
                "administrador"
            )

            rol_nombre = (
                "Administrador"
            )

            # 
            # Se muestra como Administrador en la tabla,
            # pero si no tiene un registro en Administrador
            # no podemos enviarlo a editar_administrador(),
            # porque esa vista trabaja con ese perfil.
            # 

            puede_editar_administrador = False


        # ====================================================
        # NOMBRE COMPLETO
        # ====================================================

        nombre_completo = (
            usuario
            .get_full_name()
            .strip()
            or usuario.username
        )


        # ====================================================
        # DATOS PARA EL TEMPLATE
        # ====================================================

        usuarios.append({

            # ------------------------------------------------
            # Identificación
            # ------------------------------------------------

            "id":
                usuario.id,


            # ------------------------------------------------
            # Información visible
            # ------------------------------------------------

            "nombre":
                nombre_completo,

            "username":
                usuario.username,

            "correo":
                (
                    usuario.email
                    or "Sin correo"
                ),

            "rol":
                rol_nombre,

            "tipo_perfil":
                tipo_perfil,


            # ------------------------------------------------
            # Datos para formularios de edición
            # ------------------------------------------------

            "nombres":
                (
                    usuario.first_name
                    or ""
                ),

            "apellidos":
                (
                    usuario.last_name
                    or ""
                ),

            "correo_editar":
                (
                    usuario.email
                    or ""
                ),

            "celular":
                celular,

            "nivel_acceso":
                nivel_acceso,

            "foto":
                foto,


            # ------------------------------------------------
            # Estado del usuario
            # ------------------------------------------------

            "activo":
                usuario.is_active,

            "ultimo_acceso":
                usuario.last_login,

            "fecha_registro":
                usuario.date_joined,


            # ------------------------------------------------
            # Seguridad / tipo de cuenta
            # ------------------------------------------------

            "es_superusuario":
                usuario.is_superuser,

            "puede_editar_administrador":
                puede_editar_administrador,

        })


    # ========================================================
    # 5. ROLES
    # ========================================================

    roles_queryset = (
        Rol.objects
        .all()
        .order_by(
            "nombrerol"
        )
    )


    roles = []


    # --------------------------------------------------------
    # Permisos que un Apicultor nunca puede activar
    # --------------------------------------------------------

    permisos_no_permitidos_apicultor = {
        "ag",
        "cg",
        "mg",
        "ig",
        "rv",
        "rg",
        "ug",
        "roles",
        "cfg",
    }


    # --------------------------------------------------------
    # Nombres antiguos guardados en BD
    # --------------------------------------------------------

    permisos_legacy = {
        "gestión completa",
        "gestion completa",
        "gestión limitada",
        "gestion limitada",
    }


    for rol in roles_queryset:

        # ====================================================
        # INFORMACIÓN DEL ROL
        # ====================================================

        nombre_rol = (
            rol.nombrerol
            or "Sin nombre"
        )


        clave_rol = (
            nombre_rol
            .strip()
            .lower()
        )


        es_administrador = (
            "admin"
            in clave_rol
        )


        es_apicultor = (
            "apicult"
            in clave_rol
        )


        # ====================================================
        # PERMISOS GUARDADOS EN BD
        # ====================================================

        permisos_guardados = {
            codigo.strip()

            for codigo in (
                rol.permisos
                or ""
            ).split(",")

            if codigo.strip()
        }


        # ====================================================
        # COMPATIBILIDAD CON PERMISOS ANTIGUOS
        # ====================================================

        usar_permisos_default = False


        if not permisos_guardados:

            usar_permisos_default = True


        elif len(
            permisos_guardados
        ) == 1:

            unico_permiso = next(
                iter(
                    permisos_guardados
                )
            )


            if (
                unico_permiso.lower()
                in permisos_legacy
            ):

                usar_permisos_default = True


        if usar_permisos_default:

            if es_administrador:

                permisos_guardados = (
                    PERMISOS_ADMIN_DEFAULT
                    .copy()
                )


            elif es_apicultor:

                permisos_guardados = (
                    PERMISOS_APICULTOR_DEFAULT
                    .copy()
                )


        # ====================================================
        # CONSTRUIR PERMISOS PARA EL TEMPLATE
        # ====================================================

        permisos_rol = []


        for permiso in PERMISOS_SISTEMA:

            codigo_permiso = (
                permiso["codigo"]
            )


            nombre_permiso = (
                permiso["nombre"]
            )


            # ------------------------------------------------
            # Nombres especiales para Apicultor
            # ------------------------------------------------

            if es_apicultor:

                nombres_apicultor = {

                    "av":
                        "Ver apiarios asignados",

                    "agenda":
                        "Ver agenda",

                    "perfil":
                        "Configurar mi perfil",

                }


                nombre_permiso = (
                    nombres_apicultor.get(
                        codigo_permiso,
                        nombre_permiso
                    )
                )


            # =================================================
            # PERMISO BLOQUEADO
            # =================================================

            bloqueado = False


            # ------------------------------------------------
            # Restricciones del Apicultor
            # ------------------------------------------------

            if (
                es_apicultor
                and codigo_permiso
                in permisos_no_permitidos_apicultor
            ):

                bloqueado = True


            # ------------------------------------------------
            # Administrador siempre conserva "roles"
            # ------------------------------------------------

            if (
                es_administrador
                and codigo_permiso
                == "roles"
            ):

                bloqueado = True


            # =================================================
            # AGREGAR PERMISO
            # =================================================

            permisos_rol.append({

                "codigo":
                    codigo_permiso,

                "nombre":
                    nombre_permiso,

                "activo":
                    (
                        codigo_permiso
                        in permisos_guardados
                    ),

                "bloqueado":
                    bloqueado,

            })


        # ====================================================
        # AGREGAR ROL
        # ====================================================

        roles.append({

            "id":
                rol.id_rol,

            "nombre":
                nombre_rol,

            "descripcion":
                (
                    rol.descripcion
                    or ""
                ),

            "nivel_acceso":
                (
                    rol.nivelacceso
                    or ""
                ),

            "activo":
                (
                    rol.estadoactivo
                    != 0
                ),

            "permisos":
                permisos_rol,

        })


    # ========================================================
    # 6. PESTAÑA ACTIVA
    # ========================================================

    tab_activa = request.GET.get(
        "tab",
        "usuarios"
    )


    tabs_validas = {
        "usuarios",
        "roles",
    }


    if (
        tab_activa
        not in tabs_validas
    ):

        tab_activa = (
            "usuarios"
        )


    # ========================================================
    # 7. CONTEXTO
    # ========================================================

    contexto = {

        "usuarios":
            usuarios,

        "roles":
            roles,

        "tab_activa":
            tab_activa,

    }


    # ========================================================
    # 8. RENDER
    # ========================================================

    return render(
        request,
        "admin_panel/usuarios_roles.html",
        contexto
    )

@administrador_requerido
@permiso_requerido("roles",redireccion="usuarios_roles_admin")
@require_POST
def guardar_permisos_roles(request):

    # ========================================================
    # PERMISOS VÁLIDOS DEL SISTEMA
    # ========================================================

    permisos_validos = {
        permiso["codigo"]
        for permiso in PERMISOS_SISTEMA
    }

    # ========================================================
    # PERMISOS QUE EL APICULTOR NUNCA DEBE TENER
    # ========================================================

    permisos_prohibidos_apicultor = {
        "ag",      # Administrar apiarios
        "cg",      # Crear / editar colmenas
        "mg",      # Gestionar mantenimientos
        "ig",      # Gestionar incidencias
        "rv",      # Ver reportes administrativos
        "rg",      # Generar reportes administrativos
        "exp",     # Exportar base de datos
        "ug",      # Administrar usuarios
        "roles",   # Administrar roles
        "cfg",     # Configuración general
    }

    roles = Rol.objects.all()

    for rol in roles:

        nombre_rol = (
            rol.nombrerol
            or ""
        ).strip().lower()

        nombre_campo = (
            f"permisos_{rol.id_rol}"
        )

        permisos_recibidos = set(
            request.POST.getlist(
                nombre_campo
            )
        )

        # Solo aceptar códigos conocidos.
        permisos_recibidos = (
            permisos_recibidos
            & permisos_validos
        )


        # ====================================================
        # REGLA DEL ADMINISTRADOR
        # ====================================================

        if "admin" in nombre_rol:

            # Siempre debe existir al menos la capacidad
            # de administrar los roles.
            permisos_recibidos.add(
                "roles"
            )
        # ====================================================
        # REGLA ESPECIAL DEL APICULTOR
        # ====================================================

        if "apicult" in nombre_rol:

            permisos_recibidos -= (
                permisos_prohibidos_apicultor
            )

            # Estos permisos mínimos sí corresponden
            # al funcionamiento normal del apicultor.
            permisos_recibidos.update({
                "av",
                "cv",
                "mr",
                "ir",
                "agenda",
                "perfil",
            })

        # ====================================================
        # GUARDAR
        # ====================================================

        rol.permisos = ",".join(
            sorted(
                permisos_recibidos
            )
        )

        rol.save(
            update_fields=["permisos"]
        )

    messages.success(
        request,
        "Los permisos de los roles se actualizaron correctamente."
    )

    url = reverse(
        "usuarios_roles_admin"
    )

    return redirect(
        f"{url}?tab=roles"
    )

# ============================================================
# VERIFICAR EN VIVO SI USERNAME O CORREO YA EXISTEN
# ============================================================

@administrador_requerido
def verificar_dato_administrador(request):
    """
    Endpoint de solo consulta (no modifica nada) usado para
    validar en tiempo real si un username o correo ya están
    en uso. Se usa desde usuarios_roles.js mientras se escribe
    en el formulario de Agregar/Editar administrador.
    """
    campo = request.GET.get("campo", "").strip()
    valor = request.GET.get("valor", "").strip()
    id_usuario_actual = request.GET.get("id_usuario", "").strip()

    if not campo or not valor:
        return JsonResponse({"existe": False})

    if campo == "username":
        consulta = User.objects.filter(username__iexact=valor)

        if id_usuario_actual:
            consulta = consulta.exclude(pk=id_usuario_actual)

        return JsonResponse({"existe": consulta.exists()})

    if campo == "correo":
        consulta = User.objects.filter(email__iexact=valor)

        if id_usuario_actual:
            consulta = consulta.exclude(pk=id_usuario_actual)

        return JsonResponse({"existe": consulta.exists()})

    return JsonResponse({"existe": False})

# ============================================================
# CREAR ADMINISTRADOR
# ============================================================

@administrador_requerido
@permiso_requerido(
    "ug",
    redireccion="usuarios_roles_admin"
)
def crear_administrador(request):

    if request.method != "POST":
        return redirect("usuarios_roles_admin")

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

    celular = request.POST.get(
        "celular",
        ""
    ).strip()

    correo = request.POST.get(
        "correo",
        ""
    ).strip().lower()

    nivel_acceso = request.POST.get(
        "nivel_acceso",
        "Alto"
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
    # VALIDACIONES
    # =========================================================

    if not primer_nombre:

        messages.error(
            request,
            "El primer nombre es obligatorio."
        )

        return redirect(
            "usuarios_roles_admin"
        )

    if not primer_apellido:

        messages.error(
            request,
            "El primer apellido es obligatorio."
        )

        return redirect(
            "usuarios_roles_admin"
        )

    if not correo:

        messages.error(
            request,
            "El correo electrónico es obligatorio."
        )

        return redirect(
            "usuarios_roles_admin"
        )

    if not username:

        messages.error(
            request,
            "El nombre de usuario es obligatorio."
        )

        return redirect(
            "usuarios_roles_admin"
        )

    if not password:

        messages.error(
            request,
            "La contraseña es obligatoria."
        )

        return redirect(
            "usuarios_roles_admin"
        )

    if len(password) < 8:

        messages.error(
            request,
            "La contraseña debe tener como mínimo 8 caracteres."
        )

        return redirect(
            "usuarios_roles_admin"
        )

    if password != confirmar_password:

        messages.error(
            request,
            "Las contraseñas no coinciden."
        )

        return redirect(
            "usuarios_roles_admin"
        )

    # =========================================================
    # VALIDAR CELULAR
    # =========================================================

    if celular and not celular.isdigit():

        messages.error(
            request,
            "El celular debe contener solamente números."
        )

        return redirect(
            "usuarios_roles_admin"
        )

    # =========================================================
    # VALIDAR NIVEL DE ACCESO
    # =========================================================

    niveles_permitidos = {
        "Alto",
        "Medio",
    }

    if nivel_acceso not in niveles_permitidos:

        messages.error(
            request,
            "El nivel de acceso seleccionado no es válido."
        )

        return redirect(
            "usuarios_roles_admin"
        )

    # =========================================================
    # FOTO
    # =========================================================

    if fotoperfil:

        tipos_permitidos = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ]

        if (
            fotoperfil.content_type
            not in tipos_permitidos
        ):

            messages.error(
                request,
                (
                    "La foto debe estar en formato "
                    "JPG, PNG o WEBP."
                )
            )

            return redirect(
                "usuarios_roles_admin"
            )

        tamano_maximo = (
            5 * 1024 * 1024
        )

        if fotoperfil.size > tamano_maximo:

            messages.error(
                request,
                (
                    "La foto de perfil no puede "
                    "superar los 5 MB."
                )
            )

            return redirect(
                "usuarios_roles_admin"
            )

    # =========================================================
    # DUPLICADOS
    # =========================================================

    if User.objects.filter(
        username__iexact=username
    ).exists():

        messages.error(
            request,
            (
                "Ese nombre de usuario "
                "ya está registrado."
            )
        )

        return redirect(
            "usuarios_roles_admin"
        )

    if User.objects.filter(
        email__iexact=correo
    ).exists():

        messages.error(
            request,
            (
                "Ese correo electrónico "
                "ya está registrado."
            )
        )

        return redirect(
            "usuarios_roles_admin"
        )

    # =========================================================
    # NOMBRES
    # =========================================================

    nombres = " ".join(
        valor
        for valor in [
            primer_nombre,
            segundo_nombre,
        ]
        if valor
    )

    apellidos = " ".join(
        valor
        for valor in [
            primer_apellido,
            segundo_apellido,
        ]
        if valor
    )

    # =========================================================
    # CREACIÓN
    # =========================================================

    try:

        with transaction.atomic():

            rol_administrador = (
                Rol.objects.get(
                    nombrerol__iexact=(
                        "Administrador"
                    )
                )
            )

            usuario = (
                User.objects.create_user(
                    username=username,
                    email=correo,
                    password=password,
                    first_name=nombres,
                    last_name=apellidos,
                    is_active=True,
                    is_staff=False,
                    is_superuser=False,
                )
            )

            Administrador.objects.create(
                user=usuario,
                id_rol=rol_administrador,
                celular=celular or None,
                fecharegistro=date.today(),
                nivelacceso=(
                    nivel_acceso
                ),
                fotoperfil=fotoperfil,
            )

        messages.success(
            request,
            (
                "El administrador fue "
                "registrado correctamente."
            )
        )

    except Rol.DoesNotExist:

        messages.error(
            request,
            (
                "No existe el rol Administrador "
                "en la base de datos."
            )
        )

    except IntegrityError:

        messages.error(
            request,
            (
                "No fue posible registrar el administrador "
                "porque alguno de los datos ya existe."
            )
        )

    except Exception as error:

        print(
            "\n"
            + "=" * 70
        )

        print(
            "ERROR AL REGISTRAR EL ADMINISTRADOR"
        )

        print(
            "Tipo de error:",
            type(error).__name__
        )

        print(
            "Mensaje:",
            str(error)
        )

        traceback.print_exc()

        print(
            "=" * 70
            + "\n"
        )

        messages.error(
            request,
            (
                "Ocurrió un error inesperado "
                "al registrar el administrador. "
                "Revisa la terminal."
            )
        )

    return redirect(
        "usuarios_roles_admin"
    )


@administrador_requerido
@permiso_requerido(
    "ug",
    redireccion="usuarios_roles_admin"
)
@require_POST
def editar_administrador(
    request,
    id_usuario
):

    # =========================================================
    # BUSCAR ADMINISTRADOR
    # =========================================================

    administrador = get_object_or_404(
        Administrador.objects.select_related(
            "user"
        ),
        user_id=id_usuario
    )

    usuario = administrador.user


    # =========================================================
    # DATOS DEL FORMULARIO
    # =========================================================

    nombres = (
        request.POST.get(
            "nombres",
            ""
        )
        .strip()
    )

    apellidos = (
        request.POST.get(
            "apellidos",
            ""
        )
        .strip()
    )

    celular = (
        request.POST.get(
            "celular",
            ""
        )
        .strip()
    )

    correo = (
        request.POST.get(
            "correo",
            ""
        )
        .strip()
    )

    nivel_acceso = (
        request.POST.get(
            "nivel_acceso",
            ""
        )
        .strip()
    )

    username = (
        request.POST.get(
            "username",
            ""
        )
        .strip()
    )

    password = request.POST.get(
        "password",
        ""
    )

    confirmar_password = request.POST.get(
        "confirmar_password",
        ""
    )

    usuario_activo = (
        request.POST.get(
            "usuario_activo"
        )
        == "on"
    )

    eliminar_foto = (
        request.POST.get(
            "eliminar_foto",
            "0"
        )
        == "1"
    )

    nueva_foto = request.FILES.get(
        "fotoperfil"
    )


    # =========================================================
    # VALIDAR CAMPOS OBLIGATORIOS
    # =========================================================

    if not nombres:

        messages.error(
            request,
            "Los nombres del administrador son obligatorios."
        )

        return _redirigir_usuarios()


    if not apellidos:

        messages.error(
            request,
            "Los apellidos del administrador son obligatorios."
        )

        return _redirigir_usuarios()


    if not correo:

        messages.error(
            request,
            "El correo electrónico es obligatorio."
        )

        return _redirigir_usuarios()


    if not username:

        messages.error(
            request,
            "El nombre de usuario es obligatorio."
        )

        return _redirigir_usuarios()


    # =========================================================
    # VALIDAR CELULAR
    # =========================================================

    if celular and not celular.isdigit():

        messages.error(
            request,
            "El celular solo puede contener números."
        )

        return _redirigir_usuarios()


    # =========================================================
    # VALIDAR NIVEL DE ACCESO
    # =========================================================

    niveles_permitidos = {
        "Alto",
        "Medio"
    }


    if nivel_acceso not in niveles_permitidos:

        messages.error(
            request,
            "El nivel de acceso seleccionado no es válido."
        )

        return _redirigir_usuarios()


    # =========================================================
    # VALIDAR USERNAME DUPLICADO
    # =========================================================

    username_existe = (
        User.objects
        .filter(
            username__iexact=username
        )
        .exclude(
            pk=usuario.pk
        )
        .exists()
    )


    if username_existe:

        messages.error(
            request,
            "Ese nombre de usuario ya está registrado."
        )

        return _redirigir_usuarios()


    # =========================================================
    # VALIDAR CORREO DUPLICADO
    # =========================================================

    correo_existe = (
        User.objects
        .filter(
            email__iexact=correo
        )
        .exclude(
            pk=usuario.pk
        )
        .exists()
    )


    if correo_existe:

        messages.error(
            request,
            "Ese correo electrónico ya está registrado."
        )

        return _redirigir_usuarios()


    # =========================================================
    # VALIDAR CONTRASEÑA
    # =========================================================

    if password or confirmar_password:

        if len(password) < 8:

            messages.error(
                request,
                "La nueva contraseña debe tener mínimo 8 caracteres."
            )

            return _redirigir_usuarios()


        if password != confirmar_password:

            messages.error(
                request,
                "Las contraseñas no coinciden."
            )

            return _redirigir_usuarios()


    # =========================================================
    # VALIDAR FOTO
    # =========================================================

    if nueva_foto:

        tipos_permitidos = {
            "image/jpeg",
            "image/png",
            "image/webp"
        }


        if nueva_foto.content_type not in tipos_permitidos:

            messages.error(
                request,
                "La fotografía debe ser JPG, PNG o WEBP."
            )

            return _redirigir_usuarios()


        tamano_maximo = (
            5 * 1024 * 1024
        )


        if nueva_foto.size > tamano_maximo:

            messages.error(
                request,
                "La fotografía no puede superar los 5 MB."
            )

            return _redirigir_usuarios()


    # =========================================================
    # GUARDAR
    # =========================================================

    try:

        with transaction.atomic():

            # -------------------------------------------------
            # USER DE DJANGO
            # -------------------------------------------------

            usuario.first_name = nombres

            usuario.last_name = apellidos

            usuario.email = correo

            usuario.username = username

            usuario.is_active = usuario_activo


            if password:

                usuario.set_password(
                    password
                )


            usuario.save()


            # -------------------------------------------------
            # PERFIL ADMINISTRADOR
            # -------------------------------------------------

            administrador.celular = (
                celular or None
            )

            administrador.nivelacceso = (
                nivel_acceso
            )


            # -------------------------------------------------
            # ELIMINAR FOTO
            # -------------------------------------------------

            if eliminar_foto:

                if administrador.fotoperfil:

                    administrador.fotoperfil.delete(
                        save=False
                    )

                administrador.fotoperfil = None


            # -------------------------------------------------
            # NUEVA FOTO
            # -------------------------------------------------

            if nueva_foto:

                if administrador.fotoperfil:

                    administrador.fotoperfil.delete(
                        save=False
                    )

                administrador.fotoperfil = (
                    nueva_foto
                )


            administrador.save()


        messages.success(
            request,
            "El administrador se actualizó correctamente."
        )


    except IntegrityError:

        messages.error(
            request,
            "No fue posible actualizar el administrador porque existe información duplicada."
        )


    except Exception as error:

        print(
            "ERROR EDITANDO ADMINISTRADOR:",
            error
        )

        messages.error(
            request,
            "Ocurrió un error al actualizar el administrador."
        )


    return _redirigir_usuarios()


@administrador_requerido
@permiso_requerido(
    "ug",
    redireccion="usuarios_roles_admin"
)
@require_POST
def cambiar_estado_administrador(
    request,
    id_usuario
):

    # ========================================================
    # BUSCAR ADMINISTRADOR
    # ========================================================

    administrador = get_object_or_404(
        Administrador.objects.select_related(
            "user"
        ),
        user_id=id_usuario
    )

    usuario = administrador.user


    # ========================================================
    # NUEVO ESTADO
    # ========================================================

    nuevo_estado = request.POST.get(
        "activo",
        ""
    )


    if nuevo_estado not in {
        "0",
        "1",
    }:

        messages.error(
            request,
            "El estado solicitado no es válido."
        )

        return _redirigir_usuarios()


    activar = (
        nuevo_estado == "1"
    )


    # ========================================================
    # EVITAR DESACTIVARSE A SÍ MISMO
    # ========================================================

    if (
        usuario.id == request.user.id
        and not activar
    ):

        messages.error(
            request,
            "No puedes desactivar tu propia cuenta."
        )

        return _redirigir_usuarios()


    # ========================================================
    # PROTEGER ÚLTIMO ADMINISTRADOR ACTIVO
    # ========================================================

    if (
        usuario.is_active
        and not activar
    ):

        administradores_activos = (
            Administrador.objects
            .filter(
                user__is_active=True
            )
            .exclude(
                user__isnull=True
            )
            .count()
        )


        if administradores_activos <= 1:

            messages.error(
                request,
                (
                    "No puedes desactivar este administrador "
                    "porque es el último administrador activo."
                )
            )

            return _redirigir_usuarios()


    # ========================================================
    # ACTUALIZAR ESTADO
    # ========================================================

    usuario.is_active = activar

    usuario.save(
        update_fields=[
            "is_active"
        ]
    )


    if activar:

        messages.success(
            request,
            "El administrador fue activado correctamente."
        )

    else:

        messages.success(
            request,
            "El administrador fue desactivado correctamente."
        )


    return _redirigir_usuarios()


@administrador_requerido
@permiso_requerido(
    "ug",
    redireccion="usuarios_roles_admin"
)
@require_POST
def eliminar_administrador(
    request,
    id_usuario
):

    # ========================================================
    # BUSCAR ADMINISTRADOR
    # ========================================================

    administrador = get_object_or_404(
        Administrador.objects.select_related(
            "user"
        ),
        user_id=id_usuario
    )

    usuario = administrador.user


    # ========================================================
    # EVITAR ELIMINARSE A SÍ MISMO
    # ========================================================

    if usuario.id == request.user.id:

        messages.error(
            request,
            "No puedes eliminar tu propia cuenta."
        )

        return _redirigir_usuarios()


    # ========================================================
    # PROTEGER ÚLTIMO ADMINISTRADOR ACTIVO
    # ========================================================

    if usuario.is_active:

        administradores_activos = (
            Administrador.objects
            .filter(
                user__is_active=True
            )
            .exclude(
                user__isnull=True
            )
            .count()
        )


        if administradores_activos <= 1:

            messages.error(
                request,
                (
                    "No puedes eliminar este administrador "
                    "porque es el último administrador activo."
                )
            )

            return _redirigir_usuarios()


    # ========================================================
    # DATOS PARA MENSAJE
    # ========================================================

    nombre = (
        usuario.get_full_name().strip()
        or usuario.username
    )


    # ========================================================
    # ELIMINAR
    # ========================================================

    try:

        with transaction.atomic():

            # ------------------------------------------------
            # FOTO DE PERFIL
            # ------------------------------------------------

            if administrador.fotoperfil:

                administrador.fotoperfil.delete(
                    save=False
                )


            # ------------------------------------------------
            # PERFIL
            # ------------------------------------------------

            administrador.delete()


            # ------------------------------------------------
            # USUARIO DJANGO
            # ------------------------------------------------

            usuario.delete()


        messages.success(
            request,
            (
                f'El administrador "{nombre}" '
                "fue eliminado correctamente."
            )
        )


    except Exception as error:

        print(
            "ERROR ELIMINANDO ADMINISTRADOR:",
            error
        )

        messages.error(
            request,
            "No fue posible eliminar el administrador."
        )


    return _redirigir_usuarios()


def _redirigir_usuarios():

    url = reverse(
        "usuarios_roles_admin"
    )

    return redirect(
        f"{url}?tab=usuarios"
    )


@login_required
@permiso_requerido(
    "perfil",
    redireccion="dashboard_admin"
)
def mi_perfil(request):

    usuario = request.user


    # ========================================================
    # DATOS POR DEFECTO
    # ========================================================

    perfil = None

    tipo_perfil = None

    rol = "Sin rol"

    telefono = ""

    foto = ""

    datos_extra = {}


    # ========================================================
    # BUSCAR ADMINISTRADOR
    # ========================================================

    administrador = (
        Administrador.objects
        .select_related(
            "id_rol"
        )
        .filter(
            user=usuario
        )
        .first()
    )


    # ========================================================
    # BUSCAR APICULTOR
    # ========================================================

    apicultor = (
        Apicultor.objects
        .select_related(
            "id_rol"
        )
        .filter(
            user=usuario
        )
        .first()
    )


    # ========================================================
    # ADMINISTRADOR
    # ========================================================

    if administrador:

        perfil = administrador

        tipo_perfil = (
            "administrador"
        )

        telefono = (
            administrador.celular
            or ""
        )


        if administrador.id_rol:

            rol = (
                administrador.id_rol.nombrerol
                or "Administrador"
            )

        else:

            rol = (
                "Administrador"
            )


        if administrador.fotoperfil:

            try:

                foto = (
                    administrador.fotoperfil.url
                )

            except ValueError:

                foto = ""


        datos_extra = {

            "nivel_acceso":
                administrador.nivelacceso
                or "Sin registrar",

        }


    # ========================================================
    # APICULTOR
    # ========================================================

    elif apicultor:

        perfil = apicultor

        tipo_perfil = (
            "apicultor"
        )

        telefono = (
            apicultor.telefono
            or ""
        )


        if apicultor.id_rol:

            rol = (
                apicultor.id_rol.nombrerol
                or "Apicultor"
            )

        else:

            rol = (
                "Apicultor"
            )


        if apicultor.fotoperfil:

            try:

                foto = (
                    apicultor.fotoperfil.url
                )

            except ValueError:

                foto = ""


        datos_extra = {

            "identificacion":
                apicultor.identificacion
                or "",

            "zona_trabajo":
                apicultor.zona_trabajo
                or "",

            "experiencia":
                apicultor.experienciaanios,

        }


    # ========================================================
    # SUPERUSUARIO SIN PERFIL
    # ========================================================

    elif usuario.is_superuser:

        tipo_perfil = (
            "administrador"
        )

        rol = (
            "Administrador"
        )


    # ============================================================
    # SESIONES ACTIVAS DEL USUARIO
    # ============================================================

    sesiones_activas = (
        obtener_sesiones_activas_usuario(
            request.user,
            request.session.session_key
        )
    )

    # ============================================================
    # HISTORIAL DE ACCESOS
    # ============================================================

    historial_accesos = (
        HistorialAcceso.objects
        .filter(
            usuario=request.user
        )
        .order_by(
            "-fecha"
        )[:10]
    )

    # ============================================================
    # CONFIGURACIÓN 2FA DEL USUARIO
    # ============================================================

    config_2fa, creado = (
        Configuracion2FA.objects
        .get_or_create(
            usuario=request.user
        )
    )

    politica_2fa = obtener_politica_2fa(
        request.user
    )


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "usuario":
            usuario,

        "perfil":
            perfil,

        "tipo_perfil":
            tipo_perfil,

        "rol":
            rol,

        "telefono":
            telefono,

        "foto":
            foto,

        "datos_extra":
            datos_extra,

        "sesiones_activas": sesiones_activas,

        "cantidad_sesiones_activas": len(
            sesiones_activas
        ),

        "sesiones_activas":
            sesiones_activas,

        "cantidad_sesiones_activas":
            len(sesiones_activas),

        "historial_accesos":
            historial_accesos,

        "config_2fa": config_2fa,

        "config_2fa": config_2fa,

        "politica_2fa": politica_2fa,
    }


    return render(
        request,
        "admin_panel/mi_perfil.html",
        contexto
    )


@login_required
@permiso_requerido(
    "perfil",
    redireccion="dashboard_admin"
)
@require_POST
def actualizar_mi_perfil(request):

    usuario = request.user


    # ========================================================
    # DATOS
    # ========================================================

    nombres = (
        request.POST.get(
            "nombres",
            ""
        )
        .strip()
    )


    apellidos = (
        request.POST.get(
            "apellidos",
            ""
        )
        .strip()
    )


    correo = (
        request.POST.get(
            "correo",
            ""
        )
        .strip()
        .lower()
    )


    telefono = (
        request.POST.get(
            "telefono",
            ""
        )
        .strip()
    )


    foto = request.FILES.get(
        "fotoperfil"
    )


    eliminar_foto = (
        request.POST.get(
            "eliminar_foto",
            "0"
        )
        == "1"
    )


    # ========================================================
    # VALIDACIONES
    # ========================================================

    if not nombres:

        messages.error(
            request,
            "El nombre es obligatorio."
        )

        return redirect(
            "mi_perfil"
        )


    if not apellidos:

        messages.error(
            request,
            "El apellido es obligatorio."
        )

        return redirect(
            "mi_perfil"
        )


    if not correo:

        messages.error(
            request,
            "El correo electrónico es obligatorio."
        )

        return redirect(
            "mi_perfil"
        )


    if (
        telefono
        and not telefono.isdigit()
    ):

        messages.error(
            request,
            "El teléfono solo puede contener números."
        )

        return redirect(
            "mi_perfil"
        )


    # ========================================================
    # CORREO DUPLICADO
    # ========================================================

    correo_existe = (
        User.objects
        .filter(
            email__iexact=correo
        )
        .exclude(
            pk=usuario.pk
        )
        .exists()
    )


    if correo_existe:

        messages.error(
            request,
            "Este correo electrónico ya pertenece a otro usuario."
        )

        return redirect(
            "mi_perfil"
        )


    # ========================================================
    # VALIDAR FOTO
    # ========================================================

    if foto:

        tipos_permitidos = {
            "image/jpeg",
            "image/png",
            "image/webp",
        }


        if (
            foto.content_type
            not in tipos_permitidos
        ):

            messages.error(
                request,
                "La fotografía debe estar en formato JPG, PNG o WEBP."
            )

            return redirect(
                "mi_perfil"
            )


        tamano_maximo = (
            5 * 1024 * 1024
        )


        if (
            foto.size >
            tamano_maximo
        ):

            messages.error(
                request,
                "La fotografía no puede superar los 5 MB."
            )

            return redirect(
                "mi_perfil"
            )


    # ========================================================
    # BUSCAR PERFIL
    # ========================================================

    administrador = (
        Administrador.objects
        .filter(
            user=usuario
        )
        .first()
    )


    apicultor = (
        Apicultor.objects
        .filter(
            user=usuario
        )
        .first()
    )


    # ========================================================
    # GUARDAR
    # ========================================================

    try:

        with transaction.atomic():

            # ------------------------------------------------
            # USER DJANGO
            # ------------------------------------------------

            usuario.first_name = (
                nombres
            )

            usuario.last_name = (
                apellidos
            )

            usuario.email = (
                correo
            )

            usuario.save(
                update_fields=[
                    "first_name",
                    "last_name",
                    "email",
                ]
            )


            # =================================================
            # ADMINISTRADOR
            # =================================================

            if administrador:

                administrador.celular = (
                    telefono
                    or None
                )


                if eliminar_foto:

                    if administrador.fotoperfil:

                        administrador.fotoperfil.delete(
                            save=False
                        )

                    administrador.fotoperfil = (
                        None
                    )


                if foto:

                    if administrador.fotoperfil:

                        administrador.fotoperfil.delete(
                            save=False
                        )

                    administrador.fotoperfil = (
                        foto
                    )


                administrador.save()


            # =================================================
            # APICULTOR
            # =================================================

            elif apicultor:

                apicultor.telefono = (
                    telefono
                    or None
                )


                if eliminar_foto:

                    if apicultor.fotoperfil:

                        apicultor.fotoperfil.delete(
                            save=False
                        )

                    apicultor.fotoperfil = (
                        None
                    )


                if foto:

                    if apicultor.fotoperfil:

                        apicultor.fotoperfil.delete(
                            save=False
                        )

                    apicultor.fotoperfil = (
                        foto
                    )


                apicultor.save()


        messages.success(
            request,
            "Tu perfil se actualizó correctamente."
        )


    except Exception as error:

        print(
            "ERROR ACTUALIZANDO PERFIL:",
            error
        )

        messages.error(
            request,
            "No fue posible actualizar tu perfil."
        )


    return redirect(
        "mi_perfil"
    )

# ============================================================
# CAMBIAR CONTRASEÑA DESDE MI PERFIL
# ============================================================

@login_required
@permiso_requerido(
    "perfil",
    redireccion="dashboard_admin"
)
@require_POST
def cambiar_password_perfil(
    request
):

    # ========================================================
    # VERIFICAR AUTENTICACIÓN
    # ========================================================

    if not request.user.is_authenticated:

        return redirect(
            "login"
        )


    usuario = request.user


    # ========================================================
    # OBTENER DATOS DEL FORMULARIO
    # ========================================================

    password_actual = (
        request.POST.get(
            "password_actual",
            ""
        )
    )


    password_nuevo = (
        request.POST.get(
            "password_nuevo",
            ""
        )
    )


    confirmar_password = (
        request.POST.get(
            "confirmar_password",
            ""
        )
    )


    # ========================================================
    # VALIDAR CAMPOS VACÍOS
    # ========================================================

    if (
        not password_actual
        or
        not password_nuevo
        or
        not confirmar_password
    ):

        messages.error(
            request,
            "Debes completar todos los campos "
            "de contraseña."
        )

        return redirect(
            "mi_perfil"
        )


    # ========================================================
    # VALIDAR CONTRASEÑA ACTUAL
    # ========================================================

    if not usuario.check_password(
        password_actual
    ):

        messages.error(
            request,
            "La contraseña actual es incorrecta."
        )

        return redirect(
            "mi_perfil"
        )


    # ========================================================
    # VALIDAR QUE LAS CONTRASEÑAS COINCIDAN
    # ========================================================

    if (
        password_nuevo
        !=
        confirmar_password
    ):

        messages.error(
            request,
            "Las nuevas contraseñas "
            "no coinciden."
        )

        return redirect(
            "mi_perfil"
        )


    # ========================================================
    # NO PERMITIR LA MISMA CONTRASEÑA
    # ========================================================

    if usuario.check_password(
        password_nuevo
    ):

        messages.warning(
            request,
            "La nueva contraseña debe ser "
            "diferente a la contraseña actual."
        )

        return redirect(
            "mi_perfil"
        )


    # ========================================================
    # VALIDADORES DE CONTRASEÑA DE DJANGO
    # ========================================================

    try:

        validate_password(
            password_nuevo,
            user=usuario
        )

    except ValidationError as error:

        mensajes_error = " ".join(
            error.messages
        )

        messages.error(
            request,
            mensajes_error
        )

        return redirect(
            "mi_perfil"
        )


    # ========================================================
    # GUARDAR SESSION_KEY ACTUAL
    # ========================================================

    session_key_anterior = (
        request.session.session_key
    )


    # ========================================================
    # CAMBIAR CONTRASEÑA
    # ========================================================

    usuario.set_password(
        password_nuevo
    )

    usuario.save(
        update_fields=[
            "password"
        ]
    )


    # ========================================================
    # MANTENER LA SESIÓN ACTUAL ABIERTA
    # ========================================================

    update_session_auth_hash(
        request,
        usuario
    )


    # ========================================================
    # SINCRONIZAR SesionUsuario
    # ========================================================

    try:

        sincronizar_session_key(
            request,
            session_key_anterior
        )

    except Exception as error:

        print(
            "ERROR SINCRONIZANDO "
            "SESSION KEY:",
            error
        )


    # ========================================================
    # REGISTRAR EN HISTORIAL
    # ========================================================

    try:

        registrar_historial_acceso(
            request,
            usuario,
            actividad="cambio_password",
            detalle=(
                "El usuario actualizó "
                "la contraseña de su cuenta."
            )
        )

    except Exception as error:

        print(
            "ERROR REGISTRANDO CAMBIO "
            "DE CONTRASEÑA:",
            error
        )


    # ========================================================
    # MENSAJE
    # ========================================================

    messages.success(
        request,
        "Tu contraseña se actualizó "
        "correctamente."
    )


    return redirect(
        "mi_perfil"
    )


@administrador_requerido
@permiso_requerido(
    "cfg",
    redireccion="dashboard_admin"
)
def configuracion_admin(request):

    # ========================================================
    # CONFIGURACIÓN GENERAL
    # ========================================================

    configuracion, creado = (
        ConfiguracionSistema.objects.get_or_create(
            pk=1,
            defaults={
                "nombre_sistema": "Mi Colmena",
            }
        )
    )

    config_seguridad, creado = (
        ConfiguracionSeguridad.objects
        .get_or_create(
            pk=1
        )
    )


    # ========================================================
    # CONFIGURACIÓN DE NOTIFICACIONES
    # ========================================================

    config_notificaciones, creado_notificaciones = (
        ConfiguracionNotificaciones.objects.get_or_create(
            pk=1
        )
    )


    # ========================================================
    # CONTEXTO
    # ========================================================

    return render(
        request,
        "admin_panel/configuracion.html",
        {
            "configuracion":
                configuracion,

            "config_notificaciones":
                config_notificaciones,

            "contexto_seguridad": 
                config_seguridad,

            "permitir_2fa":
                config_seguridad.permitir_2fa,

            "obligar_2fa_administradores":
                config_seguridad.obligar_2fa_administradores,

            "obligar_2fa_todos":
                config_seguridad.obligar_2fa_todos,
        }
    )

@administrador_requerido
@permiso_requerido(
    "cfg",
    redireccion="dashboard_admin"
)
@require_POST
def guardar_configuracion_general(request):

    configuracion, creado = (
        ConfiguracionSistema.objects.get_or_create(
            pk=1,
            defaults={
                "nombre_sistema": "Mi Colmena",
            }
        )
    )


    # ========================================================
    # DATOS
    # ========================================================

    nombre_sistema = (
        request.POST.get(
            "nombre_sistema",
            ""
        )
        .strip()
    )


    nombre_entidad = (
        request.POST.get(
            "nombre_entidad",
            ""
        )
        .strip()
    )


    descripcion = (
        request.POST.get(
            "descripcion",
            ""
        )
        .strip()
    )


    correo_contacto = (
        request.POST.get(
            "correo_contacto",
            ""
        )
        .strip()
        .lower()
    )


    telefono_contacto = (
        request.POST.get(
            "telefono_contacto",
            ""
        )
        .strip()
    )


    # ========================================================
    # VALIDACIONES
    # ========================================================

    if not nombre_sistema:

        messages.error(
            request,
            "El nombre del sistema es obligatorio."
        )

        return redirect(
            f"{reverse('configuracion_admin')}?tab=general"
        )


    if len(nombre_sistema) > 100:

        messages.error(
            request,
            "El nombre del sistema no puede superar los 100 caracteres."
        )

        return redirect(
            f"{reverse('configuracion_admin')}?tab=general"
        )


    if len(nombre_entidad) > 150:

        messages.error(
            request,
            "El nombre de la empresa no puede superar los 150 caracteres."
        )

        return redirect(
            f"{reverse('configuracion_admin')}?tab=general"
        )


    if len(descripcion) > 500:

        messages.error(
            request,
            "La descripción no puede superar los 500 caracteres."
        )

        return redirect(
            f"{reverse('configuracion_admin')}?tab=general"
        )


    if correo_contacto:

        try:

            validate_email(
                correo_contacto
            )

        except ValidationError:

            messages.error(
                request,
                "El correo electrónico no es válido."
            )

            return redirect(
                f"{reverse('configuracion_admin')}?tab=general"
            )


    if (
        telefono_contacto
        and not telefono_contacto.isdigit()
    ):

        messages.error(
            request,
            "El teléfono solo puede contener números."
        )

        return redirect(
            f"{reverse('configuracion_admin')}?tab=general"
        )


    # ========================================================
    # GUARDAR
    # ========================================================

    configuracion.nombre_sistema = (
        nombre_sistema
    )

    configuracion.nombre_entidad = (
        nombre_entidad
    )

    configuracion.descripcion = (
        descripcion
    )

    configuracion.correo_contacto = (
        correo_contacto
    )

    configuracion.telefono_contacto = (
        telefono_contacto
    )


    configuracion.save()


    messages.success(
        request,
        "La configuración general se actualizó correctamente."
    )


    url = reverse(
        "configuracion_admin"
    )


    return redirect(
        f"{url}?tab=general"
    )


@administrador_requerido
@permiso_requerido(
    "cfg",
    redireccion="dashboard_admin"
)
@require_POST
def guardar_configuracion_notificaciones(request):

    configuracion, creado = (
        ConfiguracionNotificaciones.objects.get_or_create(
            pk=1
        )
    )


    # ========================================================
    # LEER SWITCHES
    # ========================================================

    configuracion.activar_notificaciones = (
        request.POST.get(
            "activar_notificaciones"
        )
        == "on"
    )


    configuracion.alertas_colmenas_riesgo = (
        request.POST.get(
            "alertas_colmenas_riesgo"
        )
        == "on"
    )


    configuracion.alertas_incidencias = (
        request.POST.get(
            "alertas_incidencias"
        )
        == "on"
    )


    configuracion.alertas_mantenimientos = (
        request.POST.get(
            "alertas_mantenimientos"
        )
        == "on"
    )


    configuracion.alertas_agenda = (
        request.POST.get(
            "alertas_agenda"
        )
        == "on"
    )


    configuracion.alertas_seguridad = (
        request.POST.get(
            "alertas_seguridad"
        )
        == "on"
    )


    configuracion.save()


    messages.success(
        request,
        "La configuración de notificaciones se actualizó correctamente."
    )


    url = reverse(
        "configuracion_admin"
    )


    return redirect(
        f"{url}?tab=notificaciones"
    )


@login_required
@require_POST
def marcar_notificacion_leida(request, id_notificacion):

    # ========================================================
    # BUSCAR NOTIFICACIÓN
    # IMPORTANTE:
    # SOLO PUEDE LEER NOTIFICACIONES DEL USUARIO ACTUAL
    # ========================================================

    notificacion = get_object_or_404(
        Notificacion,
        pk=id_notificacion,
        usuario=request.user
    )


    # ========================================================
    # MARCAR COMO LEÍDA
    # ========================================================

    if not notificacion.leida:

        notificacion.leida = True

        notificacion.fecha_lectura = (
            timezone.now()
        )

        notificacion.save(
            update_fields=[
                "leida",
                "fecha_lectura",
            ]
        )


    # ========================================================
    # CONTAR LAS QUE TODAVÍA ESTÁN PENDIENTES
    # ========================================================

    pendientes = (
        Notificacion.objects
        .filter(
            usuario=request.user,
            leida=False
        )
        .count()
    )


    return JsonResponse(
        {
            "ok": True,
            "pendientes": pendientes,
        }
    )


# ============================================================
# CENTRO DE NOTIFICACIONES
# ============================================================

@login_required
def centro_notificaciones(request):

    # ========================================================
    # FILTROS
    # ========================================================

    estado = (
        request.GET.get(
            "estado",
            "todas"
        )
        .strip()
        .lower()
    )


    tipo = (
        request.GET.get(
            "tipo",
            ""
        )
        .strip()
        .lower()
    )


    # ========================================================
    # CONSULTA BASE
    # ========================================================

    notificaciones = (
        Notificacion.objects
        .filter(
            usuario=request.user
        )
        .order_by(
            "-fecha_creacion"
        )
    )


    # ========================================================
    # CONTADORES GENERALES
    # ========================================================

    total_notificaciones = (
        Notificacion.objects
        .filter(
            usuario=request.user
        )
        .count()
    )


    total_no_leidas = (
        Notificacion.objects
        .filter(
            usuario=request.user,
            leida=False
        )
        .count()
    )


    total_leidas = (
        Notificacion.objects
        .filter(
            usuario=request.user,
            leida=True
        )
        .count()
    )


    # ========================================================
    # FILTRO POR ESTADO
    # ========================================================

    if estado == "no-leidas":

        notificaciones = (
            notificaciones
            .filter(
                leida=False
            )
        )


    elif estado == "leidas":

        notificaciones = (
            notificaciones
            .filter(
                leida=True
            )
        )


    else:

        estado = "todas"


    # ========================================================
    # FILTRO POR TIPO
    # ========================================================

    tipos_validos = {
        codigo
        for codigo, nombre
        in Notificacion.TIPOS
    }


    if (
        tipo
        and
        tipo in tipos_validos
    ):

        notificaciones = (
            notificaciones
            .filter(
                tipo=tipo
            )
        )

    else:

        tipo = ""


    # ========================================================
    # PAGINACIÓN
    # ========================================================

    paginator = Paginator(
        notificaciones,
        10
    )


    numero_pagina = (
        request.GET.get(
            "page"
        )
    )


    pagina = (
        paginator.get_page(
            numero_pagina
        )
    )


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "pagina":
            pagina,

        "estado_actual":
            estado,

        "tipo_actual":
            tipo,

        "tipos_notificacion":
            Notificacion.TIPOS,

        "total_notificaciones":
            total_notificaciones,

        "total_no_leidas":
            total_no_leidas,

        "total_leidas":
            total_leidas,

    }


    return render(
        request,
        "admin_panel/notificaciones.html",
        contexto
    )



# ============================================================
# MARCAR TODAS LAS NOTIFICACIONES COMO LEÍDAS
# ============================================================

@login_required
@require_POST
def marcar_todas_notificaciones_leidas(
    request
):

    ahora = timezone.now()


    (
        Notificacion.objects
        .filter(
            usuario=request.user,
            leida=False
        )
        .update(
            leida=True,
            fecha_lectura=ahora
        )
    )


    return redirect(
        "centro_notificaciones"
    )



# ============================================================
# ELIMINAR NOTIFICACIÓN
# ============================================================

@login_required
@require_POST
def eliminar_notificacion(
    request,
    id_notificacion
):

    notificacion = (
        get_object_or_404(

            Notificacion,

            pk=id_notificacion,

            usuario=request.user

        )
    )


    notificacion.delete()


    return redirect(
        "centro_notificaciones"
    )


@administrador_requerido
@permiso_requerido(
    "cfg",
    redireccion="configuracion_admin"
)
@require_POST
def guardar_configuracion_seguridad(request):

    config, creado = (
        ConfiguracionSeguridad.objects
        .get_or_create(pk=1)
    )


    # ========================================================
    # CIERRE AUTOMÁTICO POR INACTIVIDAD
    # ========================================================

    config.cerrar_sesion_inactividad = (
        request.POST.get(
            "cerrar_sesion_inactividad"
        )
        ==
        "on"
    )


    try:

        minutos_inactividad = int(
            request.POST.get(
                "minutos_inactividad",
                30
            )
        )

    except (
        TypeError,
        ValueError
    ):

        minutos_inactividad = 30


    minutos_inactividad = max(
        5,
        min(
            minutos_inactividad,
            480
        )
    )


    config.minutos_inactividad = (
        minutos_inactividad
    )


    # ========================================================
    # HISTORIAL DE ACCESOS
    # ========================================================

    config.registrar_historial_accesos = (
        request.POST.get(
            "registrar_historial_accesos"
        )
        ==
        "on"
    )


    # ========================================================
    # BLOQUEO POR INTENTOS FALLIDOS
    # ========================================================

    config.bloquear_intentos_fallidos = (
        request.POST.get(
            "bloquear_intentos_fallidos"
        )
        ==
        "on"
    )


    # ========================================================
    # INTENTOS MÁXIMOS
    # ========================================================

    try:

        intentos_maximos = int(
            request.POST.get(
                "intentos_maximos_login",
                5
            )
        )

    except (
        TypeError,
        ValueError
    ):

        intentos_maximos = 5


    intentos_maximos = max(
        3,
        min(
            intentos_maximos,
            10
        )
    )


    config.intentos_maximos_login = (
        intentos_maximos
    )


    # ========================================================
    # DURACIÓN DEL BLOQUEO
    # ========================================================

    try:

        minutos_bloqueo = int(
            request.POST.get(
                "minutos_bloqueo_login",
                15
            )
        )

    except (
        TypeError,
        ValueError
    ):

        minutos_bloqueo = 15


    minutos_bloqueo = max(
        5,
        min(
            minutos_bloqueo,
            1440
        )
    )


    config.minutos_bloqueo_login = (
        minutos_bloqueo
    )


    # ============================================================
    # CONFIGURACIÓN 2FA
    # ============================================================

    config.permitir_2fa = (
        request.POST.get(
            "permitir_2fa"
        )
        ==
        "on"
    )


    config.obligar_2fa_administradores = (
        config.permitir_2fa
        and
        request.POST.get(
            "obligar_2fa_administradores"
        )
        ==
        "on"
    )


    config.obligar_2fa_todos = (
        config.permitir_2fa
        and
        request.POST.get(
            "obligar_2fa_todos"
        )
        ==
        "on"
    )

    # ========================================================
    # GUARDAR
    # ========================================================

    config.save()


    messages.success(
        request,
        "La configuración de seguridad "
        "se actualizó correctamente."
    )


    return redirect(
        f"{reverse('configuracion_admin')}"
        "?tab=seguridad"
    )


document.addEventListener("DOMContentLoaded", function () {
 
    /* =========================================================
       ELEMENTOS DEL FORMULARIO
    ========================================================= */
 
    const formularioAgregar = document.getElementById(
        "formAgregarApicultor"
    );
 
    const inputFotoAgregar = document.getElementById(
        "fotoperfilAgregar"
    );
 
    const imagenPreviewAgregar = document.getElementById(
        "imagenPreviewAgregar"
    );
 
    const iconoPreviewAgregar = document.getElementById(
        "iconoPreviewAgregar"
    );
 
    const botonQuitarFoto = document.getElementById(
        "btnQuitarFotoAgregar"
    );
 
    const passwordAgregar = document.getElementById(
        "passwordAgregar"
    );
 
    const confirmarPasswordAgregar = document.getElementById(
        "confirmarPasswordAgregar"
    );
 
    const mensajePasswordNoCoincide = document.getElementById(
        "mensajePasswordNoCoincide"
    );
 
    const botonGuardarApicultor = document.getElementById(
        "btnGuardarApicultor"
    );
 
    const modalAgregarElemento = document.getElementById(
        "modalAgregarApicultor"
    );
 
 
    /* =========================================================
       MOSTRAR Y OCULTAR CONTRASEÑAS
    ========================================================= */
 
    const botonesMostrarPassword = document.querySelectorAll(
        ".btn-mostrar-password"
    );
 
    botonesMostrarPassword.forEach(function (boton) {
 
        boton.addEventListener("click", function () {
 
            const idInput = boton.dataset.passwordTarget;
            const inputPassword = document.getElementById(idInput);
            const icono = boton.querySelector("i");
 
            if (!inputPassword || !icono) {
                return;
            }
 
            if (inputPassword.type === "password") {
 
                inputPassword.type = "text";
 
                icono.classList.remove("bi-eye-fill");
                icono.classList.add("bi-eye-slash-fill");
 
                boton.setAttribute(
                    "aria-label",
                    "Ocultar contraseña"
                );
 
                boton.setAttribute(
                    "title",
                    "Ocultar contraseña"
                );
 
            } else {
 
                inputPassword.type = "password";
 
                icono.classList.remove("bi-eye-slash-fill");
                icono.classList.add("bi-eye-fill");
 
                boton.setAttribute(
                    "aria-label",
                    "Mostrar contraseña"
                );
 
                boton.setAttribute(
                    "title",
                    "Mostrar contraseña"
                );
 
            }
 
        });
 
    });
 
 
    /* =========================================================
       VISTA PREVIA DE FOTO
    ========================================================= */
 
    if (inputFotoAgregar) {
 
        inputFotoAgregar.addEventListener("change", function () {
 
            const archivo = inputFotoAgregar.files[0];
 
            if (!archivo) {
                limpiarVistaPreviaAgregar();
                return;
            }
 
            const tiposPermitidos = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];
 
            if (!tiposPermitidos.includes(archivo.type)) {
 
                alert(
                    "Selecciona una imagen en formato JPG, PNG o WEBP."
                );
 
                inputFotoAgregar.value = "";
                limpiarVistaPreviaAgregar();
 
                return;
            }
 
            const tamanoMaximo = 5 * 1024 * 1024;
 
            if (archivo.size > tamanoMaximo) {
 
                alert(
                    "La imagen no puede superar los 5 MB."
                );
 
                inputFotoAgregar.value = "";
                limpiarVistaPreviaAgregar();
 
                return;
            }
 
            const lector = new FileReader();
 
            lector.addEventListener("load", function (evento) {
 
                if (!imagenPreviewAgregar) {
                    return;
                }
 
                imagenPreviewAgregar.src = evento.target.result;
                imagenPreviewAgregar.classList.remove("d-none");
 
                if (iconoPreviewAgregar) {
                    iconoPreviewAgregar.classList.add("d-none");
                }
 
                if (botonQuitarFoto) {
                    botonQuitarFoto.classList.remove("d-none");
                }
 
            });
 
            lector.readAsDataURL(archivo);
 
        });
 
    }
 
 
    /* =========================================================
       QUITAR FOTO SELECCIONADA
    ========================================================= */
 
    if (botonQuitarFoto) {
 
        botonQuitarFoto.addEventListener("click", function () {
 
            if (inputFotoAgregar) {
                inputFotoAgregar.value = "";
            }
 
            limpiarVistaPreviaAgregar();
 
        });
 
    }
 
 
    function limpiarVistaPreviaAgregar() {
 
        if (imagenPreviewAgregar) {
 
            imagenPreviewAgregar.src = "";
            imagenPreviewAgregar.classList.add("d-none");
 
        }
 
        if (iconoPreviewAgregar) {
            iconoPreviewAgregar.classList.remove("d-none");
        }
 
        if (botonQuitarFoto) {
            botonQuitarFoto.classList.add("d-none");
        }
 
    }
 
 
    /* =========================================================
       VALIDAR QUE LAS CONTRASEÑAS COINCIDAN
    ========================================================= */
 
    function validarContrasenas() {
 
        if (
            !passwordAgregar ||
            !confirmarPasswordAgregar ||
            !mensajePasswordNoCoincide
        ) {
            return true;
        }
 
        const password = passwordAgregar.value;
        const confirmacion = confirmarPasswordAgregar.value;
 
        if (!confirmacion) {
 
            mensajePasswordNoCoincide.classList.add("d-none");
            confirmarPasswordAgregar.classList.remove("is-invalid");
 
            return true;
 
        }
 
        if (password !== confirmacion) {
 
            mensajePasswordNoCoincide.classList.remove("d-none");
            confirmarPasswordAgregar.classList.add("is-invalid");
 
            return false;
 
        }
 
        mensajePasswordNoCoincide.classList.add("d-none");
        confirmarPasswordAgregar.classList.remove("is-invalid");
        confirmarPasswordAgregar.classList.add("is-valid");
 
        return true;
 
    }
 
 
    if (passwordAgregar) {
 
        passwordAgregar.addEventListener(
            "input",
            validarContrasenas
        );
 
    }
 
    if (confirmarPasswordAgregar) {
 
        confirmarPasswordAgregar.addEventListener(
            "input",
            validarContrasenas
        );
 
    }
 
 
    /* =========================================================
       ENVÍO DEL FORMULARIO
    ========================================================= */
 
    if (formularioAgregar) {
 
        formularioAgregar.addEventListener(
            "submit",
            function (evento) {
 
                const contrasenasValidas = validarContrasenas();
 
                if (!contrasenasValidas) {
 
                    evento.preventDefault();
 
                    confirmarPasswordAgregar.focus();
 
                    return;
                }
 
                if (!formularioAgregar.checkValidity()) {
 
                    evento.preventDefault();
                    evento.stopPropagation();
 
                    formularioAgregar.classList.add(
                        "was-validated"
                    );
 
                    return;
                }
 
                if (botonGuardarApicultor) {
 
                    botonGuardarApicultor.disabled = true;
 
                    botonGuardarApicultor.innerHTML = `
                        <span
                            class="spinner-border spinner-border-sm me-2"
                            aria-hidden="true"
                        ></span>
                        Registrando...
                    `;
 
                }
 
            }
        );
 
    }
 
 
    /* =========================================================
    LIMPIAR FORMULARIO AL CERRAR EL MODAL
    ========================================================= */
 
    if (modalAgregarElemento) {
 
        modalAgregarElemento.addEventListener(
            "hidden.bs.modal",
            function () {
 
                if (formularioAgregar) {
 
                    formularioAgregar.reset();
 
                    formularioAgregar.classList.remove(
                        "was-validated"
                    );
 
                }
 
                limpiarVistaPreviaAgregar();
 
                if (mensajePasswordNoCoincide) {
 
                    mensajePasswordNoCoincide.classList.add(
                        "d-none"
                    );
 
                }
 
                if (confirmarPasswordAgregar) {
 
                    confirmarPasswordAgregar.classList.remove(
                        "is-invalid",
                        "is-valid"
                    );
 
                }
 
                if (botonGuardarApicultor) {
 
                    botonGuardarApicultor.disabled = false;
 
                    botonGuardarApicultor.innerHTML = `
                        <i class="bi bi-person-check-fill me-2"></i>
                        Registrar apicultor
                    `;
 
                }
 
                document
                    .querySelectorAll(".btn-mostrar-password")
                    .forEach(function (boton) {
 
                        const idInput = boton.dataset.passwordTarget;
                        const input = document.getElementById(idInput);
                        const icono = boton.querySelector("i");
 
                        if (input) {
                            input.type = "password";
                        }
 
                        if (icono) {
 
                            icono.classList.remove(
                                "bi-eye-slash-fill"
                            );
 
                            icono.classList.add(
                                "bi-eye-fill"
                            );
 
                        }
 
                    });
 
            }
        );
 
    }
 
 
    /* =========================================================
    TOOLTIPS DE BOOTSTRAP
    ========================================================= */
 
    if (typeof bootstrap !== "undefined") {
 
        const elementosTooltip = document.querySelectorAll(
            "[title]"
        );
 
        elementosTooltip.forEach(function (elemento) {
 
            new bootstrap.Tooltip(elemento);
 
        });
 
    }
 
});
 
/* =========================================================
   VISTA PREVIA DE LA FOTO DEL APICULTOR
========================================================= */
 
const inputFotoAgregar = document.getElementById(
    "fotoperfilAgregar"
);
 
const imagenPreviewAgregar = document.getElementById(
    "imagenPreviewAgregar"
);
 
const iconoPreviewAgregar = document.getElementById(
    "iconoPreviewAgregar"
);
 
const botonQuitarFotoAgregar = document.getElementById(
    "btnQuitarFotoAgregar"
);
 
 
function limpiarFotoAgregar() {
 
    if (inputFotoAgregar) {
        inputFotoAgregar.value = "";
    }
 
    if (imagenPreviewAgregar) {
        imagenPreviewAgregar.removeAttribute("src");
        imagenPreviewAgregar.classList.add("d-none");
    }
 
    if (iconoPreviewAgregar) {
        iconoPreviewAgregar.classList.remove("d-none");
    }
 
    if (botonQuitarFotoAgregar) {
        botonQuitarFotoAgregar.classList.add("d-none");
    }
 
}
 
 
if (inputFotoAgregar) {
 
    inputFotoAgregar.addEventListener("change", function () {
 
        const archivo = this.files && this.files[0];
 
        if (!archivo) {
            limpiarFotoAgregar();
            return;
        }
 
        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];
 
        if (!tiposPermitidos.includes(archivo.type)) {
 
            alert(
                "Selecciona una imagen en formato JPG, PNG o WEBP."
            );
 
            limpiarFotoAgregar();
            return;
        }
 
        const tamanoMaximo = 5 * 1024 * 1024;
 
        if (archivo.size > tamanoMaximo) {
 
            alert(
                "La imagen no puede superar los 5 MB."
            );
 
            limpiarFotoAgregar();
            return;
        }
 
        const lector = new FileReader();
 
        lector.onload = function (evento) {
 
            if (!imagenPreviewAgregar) {
                return;
            }
 
            imagenPreviewAgregar.src = evento.target.result;
            imagenPreviewAgregar.classList.remove("d-none");
 
            if (iconoPreviewAgregar) {
                iconoPreviewAgregar.classList.add("d-none");
            }
 
            if (botonQuitarFotoAgregar) {
                botonQuitarFotoAgregar.classList.remove("d-none");
            }
 
        };
 
        lector.onerror = function () {
 
            alert(
                "No fue posible cargar la vista previa de la imagen."
            );
 
            limpiarFotoAgregar();
 
        };
 
        lector.readAsDataURL(archivo);
 
    });
 
}
 
 
if (botonQuitarFotoAgregar) {
 
    botonQuitarFotoAgregar.addEventListener(
        "click",
        function () {
            limpiarFotoAgregar();
        }
    );
 
}
 
 
/*MODAL DETALLE APICULTOR*/
 
document.addEventListener("DOMContentLoaded", function () {
 
    const modalDetalle = document.getElementById(
        "modalDetalleApicultor"
    );
 
    if (!modalDetalle) {
        return;
    }
 
    modalDetalle.addEventListener(
        "show.bs.modal",
        function (evento) {
 
            const boton = evento.relatedTarget;
 
            if (!boton) {
                return;
            }
 
            /* ===============================================
            DATOS RECIBIDOS DESDE EL BOTÓN DE LA TABLA
            =============================================== */
 
            const id = boton.dataset.id || "—";
            const urlPerfil = boton.dataset.perfilUrl || "#";
            const botonPerfilCompleto = document.getElementById(
                "btnPerfilCompletoApicultor"
            );
 
            if (botonPerfilCompleto) {
                botonPerfilCompleto.href = urlPerfil;
            }
            cargarApiariosDelApicultor(id);
            const nombre = boton.dataset.nombre || "Sin nombre";
            const nombres = boton.dataset.nombres || "Sin registrar";
            const apellidos = boton.dataset.apellidos || "Sin registrar";
            const username = boton.dataset.username || "Sin usuario";
            const identificacion =
                boton.dataset.identificacion || "Sin registrar";
 
            const correo = boton.dataset.correo || "";
            const telefono = boton.dataset.telefono || "";
            const zona = boton.dataset.zona || "Sin registrar";
            const experiencia = boton.dataset.experiencia || "";
            const rol = boton.dataset.rol || "Apicultor";
            const apiarios = Number(boton.dataset.apiarios || 0);
            const activo = boton.dataset.activo || "No";
            const foto = boton.dataset.foto || "";
 
 
            /* ===============================================
            INFORMACIÓN PRINCIPAL
            =============================================== */
 
            asignarTexto(
                "detalleIdApicultor",
                id
            );
 
            asignarTexto(
                "detalleNombreApicultor",
                nombre
            );
 
            asignarTexto(
                "detalleNombresApicultor",
                nombres
            );
 
            asignarTexto(
                "detalleApellidosApicultor",
                apellidos
            );
 
            asignarTexto(
                "detalleUsernameApicultor",
                username
            );
 
            asignarTexto(
                "detalleIdentificacionApicultor",
                identificacion
            );
 
            asignarTexto(
                "detalleRolApicultor",
                rol
            );
 
            asignarTexto(
                "detalleZonaApicultor",
                zona
            );
 
 
            /* ===============================================
            EXPERIENCIA
            =============================================== */
 
            let textoExperiencia = "Sin registrar";
 
            if (experiencia !== "") {
 
                const cantidadExperiencia = Number(experiencia);
 
                textoExperiencia =
                    `${cantidadExperiencia} ${
                        cantidadExperiencia === 1
                            ? "año"
                            : "años"
                    }`;
 
            }
 
            asignarTexto(
                "detalleExperienciaApicultor",
                textoExperiencia
            );
 
 
            /* ===============================================
            APIARIOS
            =============================================== */
 
            asignarTexto(
                "detalleCantidadApiarios",
                apiarios
            );
 
            asignarTexto(
                "detalleTextoApiarios",
                apiarios === 1
                    ? "Apiario"
                    : "Apiarios"
            );
 
 
            /* ===============================================
            CORREO Y TELÉFONO
            =============================================== */
 
            configurarEnlace(
                "detalleCorreoApicultor",
                correo,
                "mailto:",
                "Sin registrar"
            );
 
            configurarEnlace(
                "detalleTelefonoApicultor",
                telefono,
                "tel:",
                "Sin registrar"
            );
 
 
            /* ===============================================
            ESTADO DEL USUARIO
            =============================================== */
 
            const elementoEstado = document.getElementById(
                "detalleEstadoApicultor"
            );
 
            const indicadorEstado = document.getElementById(
                "detalleIndicadorEstado"
            );
 
            const estaActivo = activo.toLowerCase() === "sí";
 
            if (elementoEstado) {
 
                elementoEstado.textContent = estaActivo
                    ? "Usuario activo"
                    : "Usuario inactivo";
 
                elementoEstado.classList.remove(
                    "estado-detalle-activo",
                    "estado-detalle-inactivo"
                );
 
                elementoEstado.classList.add(
                    estaActivo
                        ? "estado-detalle-activo"
                        : "estado-detalle-inactivo"
                );
 
            }
 
            if (indicadorEstado) {
 
                indicadorEstado.classList.remove(
                    "indicador-detalle-activo",
                    "indicador-detalle-inactivo"
                );
 
                indicadorEstado.classList.add(
                    estaActivo
                        ? "indicador-detalle-activo"
                        : "indicador-detalle-inactivo"
                );
 
                indicadorEstado.title = estaActivo
                    ? "Usuario activo"
                    : "Usuario inactivo";
 
            }
 
 
            /* ===============================================
            FOTO
            =============================================== */
 
            const imagenFoto = document.getElementById(
                "detalleFotoApicultor"
            );
 
            const fotoSinImagen = document.getElementById(
                "detalleFotoSinImagen"
            );
 
            if (foto && imagenFoto) {
 
                imagenFoto.src = foto;
                imagenFoto.alt = `Foto de ${nombre}`;
                imagenFoto.classList.remove("d-none");
 
                if (fotoSinImagen) {
                    fotoSinImagen.classList.add("d-none");
                }
 
            } else {
 
                if (imagenFoto) {
                    imagenFoto.removeAttribute("src");
                    imagenFoto.classList.add("d-none");
                }
 
                if (fotoSinImagen) {
                    fotoSinImagen.classList.remove("d-none");
                }
 
            }
 
        }
    );
 
 
    /* =====================================================
    FUNCIÓN PARA ASIGNAR TEXTO
    ====================================================== */
 
    function asignarTexto(idElemento, valor) {
 
        const elemento = document.getElementById(idElemento);
 
        if (elemento) {
            elemento.textContent = valor;
        }
 
    }
 
 
    /* =====================================================
    FUNCIÓN PARA CONFIGURAR ENLACES
    ====================================================== */
 
    function configurarEnlace(
        idElemento,
        valor,
        prefijo,
        textoVacio
    ) {
 
        const elemento = document.getElementById(idElemento);
 
        if (!elemento) {
            return;
        }
 
        if (valor) {
 
            elemento.textContent = valor;
            elemento.href = `${prefijo}${valor}`;
            elemento.classList.remove("enlace-dato-vacio");
 
        } else {
 
            elemento.textContent = textoVacio;
            elemento.href = "#";
            elemento.classList.add("enlace-dato-vacio");
 
        }
 
    }
 
    /* =========================================================
    CARGAR APIARIOS EN EL MODAL DE DETALLE
    ========================================================= */
 
    function cargarApiariosDelApicultor(idApicultor) {
 
        const listaApiarios = document.getElementById(
            "listaApiariosDetalle"
        );
 
        const contadorPanel = document.getElementById(
            "contadorPanelApiarios"
        );
 
        const botonApiarios = document.getElementById(
            "btnMostrarApiariosDetalle"
        );
 
        const panelApiarios = document.getElementById(
            "panelApiariosDetalle"
        );
 
        const templateApiarios = document.getElementById(
            `templateApiariosApicultor${idApicultor}`
        );
 
        if (!listaApiarios) {
            return;
        }
 
        listaApiarios.innerHTML = "";
 
        if (templateApiarios) {
 
            const contenido = templateApiarios.content.cloneNode(true);
 
            listaApiarios.appendChild(contenido);
 
        } else {
 
            listaApiarios.innerHTML = `
                <div class="estado-sin-apiarios-detalle">
                    <div class="icono-sin-apiarios-detalle">
                        <i class="bi bi-inboxes-fill"></i>
                    </div>
 
                    <h6>No fue posible cargar los apiarios</h6>
 
                    <p>
                        No se encontró la información relacionada con
                        este apicultor.
                    </p>
                </div>
            `;
 
        }
 
        const cantidad = listaApiarios.querySelectorAll(
            ".item-apiario-detalle"
        ).length;
 
        if (contadorPanel) {
            contadorPanel.textContent = cantidad;
        }
 
        /*
        Cerrar la lista cada vez que se abra el detalle
        de otro apicultor.
        */
        if (panelApiarios) {
 
            const instanciaCollapse =
                bootstrap.Collapse.getOrCreateInstance(
                    panelApiarios,
                    {
                        toggle: false
                    }
                );
 
            instanciaCollapse.hide();
 
        }
 
        if (botonApiarios) {
            botonApiarios.setAttribute(
                "aria-expanded",
                "false"
            );
        }
 
    }
 
});
 
/*MODAL DE EDITAR APICULTOR */
document.addEventListener("DOMContentLoaded", function () {
 
    const modalEditar = document.getElementById(
        "modalEditarApicultor"
    );
 
    const formularioEditar = document.getElementById(
        "formEditarApicultor"
    );
 
    if (!modalEditar || !formularioEditar) {
        return;
    }
 
 
    /* =========================================================
       CAMPOS
    ========================================================= */
 
    const nombresEditar = document.getElementById(
        "nombresEditar"
    );
 
    const apellidosEditar = document.getElementById(
        "apellidosEditar"
    );
 
    const identificacionEditar = document.getElementById(
        "identificacionEditar"
    );
 
    const telefonoEditar = document.getElementById(
        "telefonoEditar"
    );
 
    const correoEditar = document.getElementById(
        "correoEditar"
    );
 
    const zonaTrabajoEditar = document.getElementById(
        "zonaTrabajoEditar"
    );
 
    const experienciaEditar = document.getElementById(
        "experienciaEditar"
    );
 
    const usernameEditar = document.getElementById(
        "usernameEditar"
    );
 
    const passwordEditar = document.getElementById(
        "passwordEditar"
    );
 
    const confirmarPasswordEditar = document.getElementById(
        "confirmarPasswordEditar"
    );
 
    const mensajePassword = document.getElementById(
        "mensajePasswordEditarNoCoincide"
    );
 
    const usuarioActivoEditar = document.getElementById(
        "usuarioActivoEditar"
    );
 
    const textoEstadoUsuario = document.getElementById(
        "textoEstadoUsuarioEditar"
    );
 
    const inputFotoEditar = document.getElementById(
        "fotoperfilEditar"
    );
 
    const imagenPreviewEditar = document.getElementById(
        "imagenPreviewEditar"
    );
 
    const iconoPreviewEditar = document.getElementById(
        "iconoPreviewEditar"
    );
 
    const botonQuitarFotoEditar = document.getElementById(
        "btnQuitarFotoEditar"
    );
 
    const eliminarFotoEditar = document.getElementById(
        "eliminarFotoEditar"
    );
 
    const botonGuardar = document.getElementById(
        "btnGuardarEdicionApicultor"
    );
 
    let fotoOriginalEditar = "";
 
 
    /* =========================================================
       ABRIR MODAL Y CARGAR DATOS
    ========================================================= */
 
    modalEditar.addEventListener(
        "show.bs.modal",
        function (evento) {
 
            const boton = evento.relatedTarget;
 
            if (!boton) {
                return;
            }
 
            formularioEditar.action = boton.dataset.url || "";
 
            asignarValor(
                nombresEditar,
                boton.dataset.nombres
            );
 
            asignarValor(
                apellidosEditar,
                boton.dataset.apellidos
            );
 
            asignarValor(
                identificacionEditar,
                boton.dataset.identificacion
            );
 
            asignarValor(
                telefonoEditar,
                boton.dataset.telefono
            );
 
            asignarValor(
                correoEditar,
                boton.dataset.correo
            );
 
            asignarValor(
                zonaTrabajoEditar,
                boton.dataset.zona
            );
 
            asignarValor(
                experienciaEditar,
                boton.dataset.experiencia
            );
 
            asignarValor(
                usernameEditar,
                boton.dataset.username
            );
 
            if (passwordEditar) {
                passwordEditar.value = "";
            }
 
            if (confirmarPasswordEditar) {
                confirmarPasswordEditar.value = "";
            }
 
            if (mensajePassword) {
                mensajePassword.classList.add("d-none");
            }
 
            if (eliminarFotoEditar) {
                eliminarFotoEditar.value = "0";
            }
 
            fotoOriginalEditar = boton.dataset.foto || "";
 
            mostrarFotoEditar(
                fotoOriginalEditar
            );
 
            const usuarioActivo =
                boton.dataset.activo === "1";
 
            if (usuarioActivoEditar) {
                usuarioActivoEditar.checked = usuarioActivo;
            }
 
            actualizarTextoEstado();
 
        }
    );
 
 
    /* =========================================================
       ESTADO ACTIVO O INACTIVO
    ========================================================= */
 
    function actualizarTextoEstado() {
 
        if (!usuarioActivoEditar || !textoEstadoUsuario) {
            return;
        }
 
        textoEstadoUsuario.textContent =
            usuarioActivoEditar.checked
                ? "Usuario activo"
                : "Usuario inactivo";
 
        textoEstadoUsuario.classList.toggle(
            "texto-usuario-inactivo",
            !usuarioActivoEditar.checked
        );
 
    }
 
 
    if (usuarioActivoEditar) {
 
        usuarioActivoEditar.addEventListener(
            "change",
            actualizarTextoEstado
        );
 
    }
 
 
    /* =========================================================
       VISTA PREVIA DE FOTO
    ========================================================= */
 
    function mostrarFotoEditar(urlFoto) {
 
        if (urlFoto) {
 
            if (imagenPreviewEditar) {
 
                imagenPreviewEditar.src = urlFoto;
                imagenPreviewEditar.classList.remove("d-none");
 
            }
 
            if (iconoPreviewEditar) {
                iconoPreviewEditar.classList.add("d-none");
            }
 
            if (botonQuitarFotoEditar) {
                botonQuitarFotoEditar.classList.remove("d-none");
            }
 
        } else {
 
            if (imagenPreviewEditar) {
 
                imagenPreviewEditar.removeAttribute("src");
                imagenPreviewEditar.classList.add("d-none");
 
            }
 
            if (iconoPreviewEditar) {
                iconoPreviewEditar.classList.remove("d-none");
            }
 
            if (botonQuitarFotoEditar) {
                botonQuitarFotoEditar.classList.add("d-none");
            }
 
        }
 
    }
 
 
    if (inputFotoEditar) {
 
        inputFotoEditar.addEventListener(
            "change",
            function () {
 
                const archivo = inputFotoEditar.files[0];
 
                if (!archivo) {
                    mostrarFotoEditar(fotoOriginalEditar);
                    return;
                }
 
                const tiposPermitidos = [
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ];
 
                if (!tiposPermitidos.includes(archivo.type)) {
 
                    alert(
                        "La imagen debe estar en formato JPG, PNG o WEBP."
                    );
 
                    inputFotoEditar.value = "";
 
                    mostrarFotoEditar(
                        fotoOriginalEditar
                    );
 
                    return;
                }
 
                const tamanoMaximo = 5 * 1024 * 1024;
 
                if (archivo.size > tamanoMaximo) {
 
                    alert(
                        "La imagen no puede superar los 5 MB."
                    );
 
                    inputFotoEditar.value = "";
 
                    mostrarFotoEditar(
                        fotoOriginalEditar
                    );
 
                    return;
                }
 
                const lector = new FileReader();
 
                lector.onload = function (eventoLectura) {
 
                    mostrarFotoEditar(
                        eventoLectura.target.result
                    );
 
                    if (eliminarFotoEditar) {
                        eliminarFotoEditar.value = "0";
                    }
 
                };
 
                lector.onerror = function () {
 
                    alert(
                        "No fue posible cargar la vista previa."
                    );
 
                    inputFotoEditar.value = "";
 
                    mostrarFotoEditar(
                        fotoOriginalEditar
                    );
 
                };
 
                lector.readAsDataURL(archivo);
 
            }
        );
 
    }
 
 
    /* =========================================================
       QUITAR FOTO
    ========================================================= */
 
    if (botonQuitarFotoEditar) {
 
        botonQuitarFotoEditar.addEventListener(
            "click",
            function () {
 
                if (inputFotoEditar) {
                    inputFotoEditar.value = "";
                }
 
                if (eliminarFotoEditar) {
                    eliminarFotoEditar.value = "1";
                }
 
                mostrarFotoEditar("");
 
            }
        );
 
    }
 
 
    /* =========================================================
       VALIDAR CONTRASEÑAS
    ========================================================= */
 
    function validarPasswordEditar() {
 
        if (
            !passwordEditar ||
            !confirmarPasswordEditar
        ) {
            return true;
        }
 
        const password = passwordEditar.value;
        const confirmacion =
            confirmarPasswordEditar.value;
 
        passwordEditar.setCustomValidity("");
        confirmarPasswordEditar.setCustomValidity("");
 
        confirmarPasswordEditar.classList.remove(
            "is-invalid",
            "is-valid"
        );
 
        if (!password && !confirmacion) {
 
            if (mensajePassword) {
                mensajePassword.classList.add("d-none");
            }
 
            return true;
        }
 
        if (password.length < 8) {
 
            passwordEditar.setCustomValidity(
                "La contraseña debe tener mínimo 8 caracteres."
            );
 
            return false;
        }
 
        if (!confirmacion || password !== confirmacion) {
 
            confirmarPasswordEditar.setCustomValidity(
                "Las contraseñas no coinciden."
            );
 
            confirmarPasswordEditar.classList.add(
                "is-invalid"
            );
 
            if (mensajePassword) {
                mensajePassword.classList.remove("d-none");
            }
 
            return false;
        }
 
        confirmarPasswordEditar.classList.add(
            "is-valid"
        );
 
        if (mensajePassword) {
            mensajePassword.classList.add("d-none");
        }
 
        return true;
 
    }
 
 
    if (passwordEditar) {
 
        passwordEditar.addEventListener(
            "input",
            validarPasswordEditar
        );
 
    }
 
    if (confirmarPasswordEditar) {
 
        confirmarPasswordEditar.addEventListener(
            "input",
            validarPasswordEditar
        );
 
    }
 
 
    /* =========================================================
       ENVÍO DEL FORMULARIO
    ========================================================= */
 
    formularioEditar.addEventListener(
        "submit",
        function (evento) {
 
            const passwordValido =
                validarPasswordEditar();
 
            if (
                !passwordValido ||
                !formularioEditar.checkValidity()
            ) {
 
                evento.preventDefault();
                evento.stopPropagation();
 
                formularioEditar.classList.add(
                    "was-validated"
                );
 
                return;
            }
 
            if (botonGuardar) {
 
                botonGuardar.disabled = true;
 
                botonGuardar.innerHTML = `
                    <span
                        class="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                    ></span>
                    Guardando...
                `;
 
            }
 
        }
    );
 
 
    /* =========================================================
       LIMPIAR AL CERRAR
    ========================================================= */
 
    modalEditar.addEventListener(
        "hidden.bs.modal",
        function () {
 
            formularioEditar.reset();
 
            formularioEditar.classList.remove(
                "was-validated"
            );
 
            formularioEditar.action = "";
 
            fotoOriginalEditar = "";
 
            if (inputFotoEditar) {
                inputFotoEditar.value = "";
            }
 
            if (eliminarFotoEditar) {
                eliminarFotoEditar.value = "0";
            }
 
            if (passwordEditar) {
 
                passwordEditar.value = "";
                passwordEditar.type = "password";
                passwordEditar.setCustomValidity("");
 
            }
 
            if (confirmarPasswordEditar) {
 
                confirmarPasswordEditar.value = "";
                confirmarPasswordEditar.type = "password";
                confirmarPasswordEditar.setCustomValidity("");
 
                confirmarPasswordEditar.classList.remove(
                    "is-invalid",
                    "is-valid"
                );
 
            }
 
            if (mensajePassword) {
                mensajePassword.classList.add("d-none");
            }
 
            mostrarFotoEditar("");
 
            if (botonGuardar) {
 
                botonGuardar.disabled = false;
 
                botonGuardar.innerHTML = `
                    <i class="bi bi-floppy-fill me-2"></i>
                    Guardar cambios
                `;
 
            }
 
        }
    );
 
 
    /* =========================================================
       FUNCIÓN AUXILIAR
    ========================================================= */
 
    function asignarValor(elemento, valor) {
 
        if (elemento) {
            elemento.value = valor || "";
        }
 
    }
 
});
 
 
document.addEventListener("DOMContentLoaded", function () {
 
    const modalElemento = document.getElementById(
        "modalEliminarApicultor"
    );
 
    const formularioEliminar = document.getElementById(
        "formEliminarApicultor"
    );
 
    const nombreApicultorEliminar = document.getElementById(
        "nombreApicultorEliminar"
    );
 
    const alertaPermitida = document.getElementById(
        "alertaEliminacionPermitida"
    );
 
    const alertaBloqueada = document.getElementById(
        "alertaEliminacionBloqueada"
    );
 
    const mensajeApiarios = document.getElementById(
        "mensajeApiariosEliminar"
    );
 
    const botonConfirmar = document.getElementById(
        "btnConfirmarEliminarApicultor"
    );
 
    /*
    Si alguno de estos elementos no existe, el modal
    no está incluido correctamente en la plantilla.
    */
    if (
        !modalElemento ||
        !formularioEliminar ||
        !botonConfirmar
    ) {
        console.error(
            "No se encontraron los elementos del modal de eliminación."
        );
 
        return;
    }
 
    const modalEliminar = bootstrap.Modal.getOrCreateInstance(
        modalElemento
    );
 
    const botonesEliminar = document.querySelectorAll(
        ".btn-eliminar-apicultor"
    );
 
    botonesEliminar.forEach(function (boton) {
 
        boton.addEventListener("click", function () {
 
            const nombre =
                boton.dataset.nombre || "Apicultor";
 
            const url =
                boton.dataset.url || "";
 
            const cantidadApiarios = Number(
                boton.dataset.apiarios || 0
            );
 
            formularioEliminar.action = url;
 
            if (nombreApicultorEliminar) {
                nombreApicultorEliminar.textContent = nombre;
            }
 
            if (cantidadApiarios > 0) {
 
                if (alertaPermitida) {
                    alertaPermitida.classList.add("d-none");
                }
 
                if (alertaBloqueada) {
                    alertaBloqueada.classList.remove("d-none");
                }
 
                if (mensajeApiarios) {
 
                    if (cantidadApiarios === 1) {
 
                        mensajeApiarios.textContent =
                            "Este apicultor tiene 1 apiario vinculado. " +
                            "Debes reasignarlo antes de eliminar al apicultor.";
 
                    } else {
 
                        mensajeApiarios.textContent =
                            `Este apicultor tiene ${cantidadApiarios} ` +
                            "apiarios vinculados. Debes reasignarlos " +
                            "antes de eliminar al apicultor.";
 
                    }
 
                }
 
                botonConfirmar.disabled = true;
 
                botonConfirmar.innerHTML = `
                    <i class="bi bi-lock-fill me-2"></i>
                    Eliminación bloqueada
                `;
 
            } else {
 
                if (alertaPermitida) {
                    alertaPermitida.classList.remove("d-none");
                }
 
                if (alertaBloqueada) {
                    alertaBloqueada.classList.add("d-none");
                }
 
                botonConfirmar.disabled = false;
 
                botonConfirmar.innerHTML = `
                    <i class="bi bi-trash3-fill me-2"></i>
                    Eliminar definitivamente
                `;
 
            }
 
            modalEliminar.show();
 
        });
 
    });
 
    formularioEliminar.addEventListener(
        "submit",
        function () {
 
            if (botonConfirmar.disabled) {
                return;
            }
 
            botonConfirmar.disabled = true;
 
            botonConfirmar.innerHTML = `
                <span
                    class="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                ></span>
                Eliminando...
            `;
 
        }
    );
 
    modalElemento.addEventListener(
        "hidden.bs.modal",
        function () {
 
            formularioEliminar.action = "";
 
            if (nombreApicultorEliminar) {
                nombreApicultorEliminar.textContent = "Apicultor";
            }
 
        }
    );
 
});
 
 
/* =========================================================
   ABRIR AUTOMÁTICAMENTE MODAL NUEVO APICULTOR
========================================================= */
 
document.addEventListener(
    "DOMContentLoaded",
    function () {
 
        const parametros =
            new URLSearchParams(
                window.location.search
            );
 
 
        const abrirNuevo =
            parametros.get(
                "nuevo"
            );
 
 
        if (abrirNuevo !== "1") {
            return;
        }
 
 
        const modalElemento =
            document.getElementById(
                "modalAgregarApicultor"
            );
 
 
        if (
            !modalElemento ||
            typeof bootstrap === "undefined"
        ) {
            return;
        }
 
 
        const modal =
            bootstrap.Modal
                .getOrCreateInstance(
                    modalElemento
                );
 
 
        modal.show();
 
 
        /*
        Quitamos ?nuevo=1 para evitar que el modal
        vuelva a abrirse si el usuario actualiza.
        */
 
        const url =
            new URL(
                window.location.href
            );
 
 
        url.searchParams.delete(
            "nuevo"
        );
 
 
        window.history.replaceState(
            {},
            "",
            url
        );
 
    }
);
 
/* ==========================================================
   VALIDACIONES NUEVAS - MÓDULO DE APICULTORES
   Solo letras en nombres/apellidos, solo números en
   identificación y teléfono, y aviso de correo inválido
   en tiempo real (además de lo que ya validan los atributos
   required / pattern / type="email" del HTML al enviar).
   ========================================================== */
document.addEventListener("DOMContentLoaded", function () {
 
    const SOLO_LETRAS = /[^A-Za-zÀ-ÿ\s]/g;
    const SOLO_NUMEROS = /[^0-9]/g;
    const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
    // Quita, mientras el usuario escribe, cualquier caracter
    // que no sea letra o espacio.
    function restringirSoloLetras(input) {
        if (!input) return;
 
        input.addEventListener("input", function () {
            const valorFiltrado = this.value.replace(SOLO_LETRAS, "");
            if (valorFiltrado !== this.value) {
                this.value = valorFiltrado;
            }
        });
    }
 
    // Quita, mientras el usuario escribe, cualquier caracter
    // que no sea un dígito.
    function restringirSoloNumeros(input) {
        if (!input) return;
 
        input.addEventListener("input", function () {
            const valorFiltrado = this.value.replace(SOLO_NUMEROS, "");
            if (valorFiltrado !== this.value) {
                this.value = valorFiltrado;
            }
        });
    }
 
    // Marca el campo en rojo si, al salir de él, el correo
    // no tiene un formato válido.
    function validarCorreoEnVivo(input) {
        if (!input) return;
 
        input.addEventListener("blur", function () {
            if (this.value && !REGEX_CORREO.test(this.value)) {
                this.classList.add("is-invalid");
            } else {
                this.classList.remove("is-invalid");
            }
        });
    }
 
    // Años de experiencia: mientras escribe, solo permite dígitos
    // (sin signo negativo ni decimales); al salir del campo, si el
    // número quedó fuera de 0-80, lo ajusta al límite más cercano.
    function restringirExperiencia(input) {
        if (!input) return;
 
        const minimo = Number(input.min) || 0;
        const maximo = Number(input.max) || 80;
 
        input.addEventListener("input", function () {
            const valorFiltrado = this.value.replace(/[^0-9]/g, "");
            if (valorFiltrado !== this.value) {
                this.value = valorFiltrado;
            }
        });
 
        input.addEventListener("blur", function () {
            if (this.value === "") return;
 
            let numero = parseInt(this.value, 10);
 
            if (isNaN(numero)) {
                this.value = "";
                return;
            }
 
            if (numero < minimo) numero = minimo;
            if (numero > maximo) numero = maximo;
 
            this.value = numero;
        });
    }
 
    // ---- Modal Agregar Apicultor ----
    [
        "primerNombreAgregar",
        "segundoNombreAgregar",
        "primerApellidoAgregar",
        "segundoApellidoAgregar"
    ].forEach(function (id) {
        restringirSoloLetras(document.getElementById(id));
    });
 
    [
        "identificacionAgregar",
        "telefonoAgregar"
    ].forEach(function (id) {
        restringirSoloNumeros(document.getElementById(id));
    });
 
    validarCorreoEnVivo(document.getElementById("correoAgregar"));
    restringirExperiencia(document.getElementById("experienciaAgregar"));
 
    // ---- Modal Editar Apicultor ----
    [
        "nombresEditar",
        "apellidosEditar"
    ].forEach(function (id) {
        restringirSoloLetras(document.getElementById(id));
    });
 
    [
        "identificacionEditar",
        "telefonoEditar"
    ].forEach(function (id) {
        restringirSoloNumeros(document.getElementById(id));
    });
 
    validarCorreoEnVivo(document.getElementById("correoEditar"));
    restringirExperiencia(document.getElementById("experienciaEditar"));
 
});
 
/* ==========================================================
   VALIDACIONES COMPLETAS EN VIVO - APICULTORES
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // =====================================================
        // CONFIGURACIÓN
        // =====================================================

        const RETRASO_DEBOUNCE_MS = 300;

        const REGEX_IDENTIFICACION =
            /^[0-9]{6,10}$/;

        const REGEX_TELEFONO =
            /^3[0-9]{9}$/;

        const REGEX_GMAIL =
            /^[A-Za-z0-9._%+-]+@gmail\.com$/i;

        const REGEX_USERNAME =
            /^[A-Za-z0-9_@.+-]{1,150}$/;

        const REGEX_NOMBRE =
            /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;


        // =====================================================
        // OBTENER / CREAR MENSAJE DE VALIDACIÓN
        // =====================================================

        function obtenerFeedback(
            campo
        ) {

            if (!campo) {
                return null;
            }


            const idFeedback =
                `feedback-${campo.id}`;


            let feedback = (
                document.getElementById(
                    idFeedback
                )
            );


            if (feedback) {
                return feedback;
            }


            feedback = (
                document.createElement(
                    "small"
                )
            );


            feedback.id =
                idFeedback;


            feedback.className =
                "d-block mt-1";


            const grupo = (
                campo.closest(
                    ".input-group-apicultor"
                )
            );


            if (grupo) {

                grupo.insertAdjacentElement(
                    "afterend",
                    feedback
                );

            } else {

                campo.insertAdjacentElement(
                    "afterend",
                    feedback
                );

            }


            return feedback;

        }


        // =====================================================
        // MOSTRAR ESTADO
        // =====================================================

        function mostrarEstado(
            campo,
            estado,
            mensaje
        ) {

            if (!campo) {
                return;
            }


            campo.classList.remove(
                "is-valid",
                "is-invalid"
            );


            const feedback = (
                obtenerFeedback(
                    campo
                )
            );


            if (feedback) {

                feedback.classList.remove(
                    "text-success",
                    "text-danger",
                    "text-muted"
                );

            }


            // -------------------------------------------------
            // NEUTRO
            // -------------------------------------------------

            if (
                estado === "neutro"
            ) {

                campo.setCustomValidity(
                    ""
                );


                if (feedback) {

                    feedback.textContent =
                        mensaje || "";


                    if (mensaje) {

                        feedback.classList.add(
                            "text-muted"
                        );

                    }

                }


                return;

            }


            // -------------------------------------------------
            // VÁLIDO
            // -------------------------------------------------

            if (
                estado === "valido"
            ) {

                campo.classList.add(
                    "is-valid"
                );


                campo.setCustomValidity(
                    ""
                );


                if (feedback) {

                    feedback.textContent =
                        mensaje || "Dato válido.";


                    feedback.classList.add(
                        "text-success"
                    );

                }


                return;

            }


            // -------------------------------------------------
            // INVÁLIDO
            // -------------------------------------------------

            campo.classList.add(
                "is-invalid"
            );


            campo.setCustomValidity(
                mensaje || "Dato inválido."
            );


            if (feedback) {

                feedback.textContent =
                    mensaje || "Dato inválido.";


                feedback.classList.add(
                    "text-danger"
                );

            }

        }


        // =====================================================
        // DEBOUNCE
        // =====================================================

        function debounce(
            funcion,
            espera
        ) {

            let temporizador = null;


            return function (...args) {

                const contexto = this;


                clearTimeout(
                    temporizador
                );


                temporizador = setTimeout(
                    function () {

                        funcion.apply(
                            contexto,
                            args
                        );

                    },
                    espera
                );

            };

        }


        // =====================================================
        // SOLO NÚMEROS + LONGITUD MÁXIMA
        // =====================================================

        function limitarNumeros(
            campo,
            maximo
        ) {

            if (!campo) {
                return;
            }


            campo.addEventListener(
                "input",
                function () {

                    campo.value = (
                        campo.value
                            .replace(
                                /\D/g,
                                ""
                            )
                            .slice(
                                0,
                                maximo
                            )
                    );

                }
            );

        }


        // =====================================================
        // NOMBRES Y APELLIDOS
        // =====================================================

        function configurarNombre(
            campo,
            obligatorio = false
        ) {

            if (!campo) {
                return;
            }


            campo.addEventListener(
                "input",
                function () {

                    // Eliminar caracteres
                    // que no pertenecen a nombres.
                    campo.value = (
                        campo.value.replace(
                            /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]/g,
                            ""
                        )
                    );


                    const valor =
                        campo.value.trim();


                    if (!valor) {

                        mostrarEstado(
                            campo,
                            obligatorio
                                ? "invalido"
                                : "neutro",
                            obligatorio
                                ? "Este campo es obligatorio."
                                : ""
                        );

                        return;

                    }


                    if (
                        valor.length < 2
                    ) {

                        mostrarEstado(
                            campo,
                            "invalido",
                            "Debe contener al menos 2 caracteres."
                        );

                        return;

                    }


                    if (
                        !REGEX_NOMBRE.test(
                            valor
                        )
                    ) {

                        mostrarEstado(
                            campo,
                            "invalido",
                            "Usa solamente letras, espacios, apóstrofes o guiones."
                        );

                        return;

                    }


                    mostrarEstado(
                        campo,
                        "valido",
                        "Nombre válido."
                    );

                }
            );

        }


        // =====================================================
        // TELÉFONO COLOMBIANO
        // =====================================================

        function configurarTelefono(
            campo
        ) {

            if (!campo) {
                return;
            }


            limitarNumeros(
                campo,
                10
            );


            campo.addEventListener(
                "input",
                function () {

                    const valor =
                        campo.value.trim();


                    // Sigue siendo opcional
                    if (!valor) {

                        mostrarEstado(
                            campo,
                            "neutro",
                            ""
                        );

                        return;

                    }


                    if (
                        valor.charAt(0) !== "3"
                    ) {

                        mostrarEstado(
                            campo,
                            "invalido",
                            "El número celular debe comenzar por 3."
                        );

                        return;

                    }


                    if (
                        valor.length < 10
                    ) {

                        const faltan =
                            10 - valor.length;


                        mostrarEstado(
                            campo,
                            "invalido",
                            `Faltan ${faltan} número(s). Debe tener exactamente 10.`
                        );

                        return;

                    }


                    if (
                        !REGEX_TELEFONO.test(
                            valor
                        )
                    ) {

                        mostrarEstado(
                            campo,
                            "invalido",
                            "El teléfono no es válido."
                        );

                        return;

                    }


                    mostrarEstado(
                        campo,
                        "valido",
                        "Número celular válido."
                    );

                }
            );

        }


        // =====================================================
        // IDENTIFICACIÓN
        // =====================================================

        function validarIdentificacionLocal(
            campo
        ) {

            const valor =
                campo.value.trim();


            if (!valor) {

                mostrarEstado(
                    campo,
                    "invalido",
                    "La identificación es obligatoria."
                );

                return false;

            }


            if (
                valor.length < 6
            ) {

                mostrarEstado(
                    campo,
                    "invalido",
                    "La identificación debe tener mínimo 6 números."
                );

                return false;

            }


            if (
                !REGEX_IDENTIFICACION.test(
                    valor
                )
            ) {

                mostrarEstado(
                    campo,
                    "invalido",
                    "La identificación debe contener entre 6 y 10 números."
                );

                return false;

            }


            return true;

        }


        // =====================================================
        // GMAIL
        // =====================================================

        function validarGmailLocal(
            campo
        ) {

            let valor =
                campo.value.trim();


            // Normalizar a minúsculas
            valor =
                valor.toLowerCase();


            campo.value =
                valor;


            if (!valor) {

                mostrarEstado(
                    campo,
                    "invalido",
                    "El correo electrónico es obligatorio."
                );

                return false;

            }


            if (
                !REGEX_GMAIL.test(
                    valor
                )
            ) {

                mostrarEstado(
                    campo,
                    "invalido",
                    "Debe ser una dirección válida terminada en @gmail.com."
                );

                return false;

            }


            return true;

        }


        // =====================================================
        // USERNAME
        // =====================================================

        function validarUsernameLocal(
            campo
        ) {

            const valor =
                campo.value.trim();


            if (!valor) {

                mostrarEstado(
                    campo,
                    "invalido",
                    "El nombre de usuario es obligatorio."
                );

                return false;

            }


            if (
                !REGEX_USERNAME.test(
                    valor
                )
            ) {

                mostrarEstado(
                    campo,
                    "invalido",
                    "Solo se permiten letras, números y @ . + - _"
                );

                return false;

            }


            return true;

        }


        // =====================================================
        // EXTRAER ID DEL APICULTOR EDITADO
        // =====================================================

        const formEditar = (
            document.getElementById(
                "formEditarApicultor"
            )
        );


        const modalEditar = (
            document.getElementById(
                "modalEditarApicultor"
            )
        );


        if (
            modalEditar
            &&
            formEditar
        ) {

            modalEditar.addEventListener(
                "show.bs.modal",
                function (evento) {

                    const boton =
                        evento.relatedTarget;


                    formEditar.dataset
                        .idApicultor = (
                            boton
                            ?
                            (
                                boton.dataset.id
                                ||
                                ""
                            )
                            :
                            ""
                        );

                }
            );

        }


        // =====================================================
        // CONSULTAR DUPLICADOS
        // =====================================================

        function verificarEnServidor(
            campo,
            tipoCampo,
            formulario,
            mensajeDisponible
        ) {

            const valorOriginal =
                campo.value.trim();


            if (!valorOriginal) {
                return;
            }


            const idApicultor = (
                formulario
                &&
                formulario.id ===
                    "formEditarApicultor"
            )
                ?
                (
                    formulario.dataset
                        .idApicultor
                    ||
                    ""
                )
                :
                "";


            let url =
                URL_VERIFICAR_DATO_APICULTOR
                +
                "?campo="
                +
                encodeURIComponent(
                    tipoCampo
                )
                +
                "&valor="
                +
                encodeURIComponent(
                    valorOriginal
                );


            if (idApicultor) {

                url += (
                    "&id_apicultor="
                    +
                    encodeURIComponent(
                        idApicultor
                    )
                );

            }


            mostrarEstado(
                campo,
                "neutro",
                "Verificando disponibilidad..."
            );


            fetch(
                url
            )
                .then(
                    function (
                        respuesta
                    ) {

                        if (
                            !respuesta.ok
                        ) {

                            throw new Error(
                                "Error HTTP."
                            );

                        }


                        return respuesta.json();

                    }
                )
                .then(
                    function (
                        datos
                    ) {

                        // El usuario siguió escribiendo
                        // mientras llegaba la respuesta.
                        if (
                            campo.value.trim()
                            !==
                            valorOriginal
                        ) {

                            return;

                        }


                        if (
                            datos.valido === false
                        ) {

                            campo.dataset.duplicado =
                                "0";


                            mostrarEstado(
                                campo,
                                "invalido",
                                datos.mensaje
                                ||
                                "Dato inválido."
                            );


                            return;

                        }


                        if (
                            datos.existe
                        ) {

                            campo.dataset.duplicado =
                                "1";


                            mostrarEstado(
                                campo,
                                "invalido",
                                datos.mensaje
                                ||
                                "Este dato ya está registrado."
                            );


                            return;

                        }


                        campo.dataset.duplicado =
                            "0";


                        mostrarEstado(
                            campo,
                            "valido",
                            datos.mensaje
                            ||
                            mensajeDisponible
                        );

                    }
                )
                .catch(
                    function (
                        error
                    ) {

                        console.error(
                            "Error verificando dato:",
                            error
                        );


                        // No afirmamos que está disponible
                        // si no pudimos consultar el servidor.
                        campo.dataset.duplicado =
                            "0";


                        mostrarEstado(
                            campo,
                            "neutro",
                            "No fue posible comprobar disponibilidad."
                        );

                    }
                );

        }


        // =====================================================
        // ACTIVAR VALIDACIÓN ÚNICA EN VIVO
        // =====================================================

        function configurarCampoUnico(
            campo,
            tipoCampo,
            formulario,
            validarLocal,
            mensajeDisponible
        ) {

            if (!campo) {
                return;
            }


            const consultarConRetraso =
                debounce(
                    function () {

                        verificarEnServidor(
                            campo,
                            tipoCampo,
                            formulario,
                            mensajeDisponible
                        );

                    },
                    RETRASO_DEBOUNCE_MS
                );


            campo.addEventListener(
                "input",
                function () {

                    campo.dataset.duplicado =
                        "0";


                    const esValido =
                        validarLocal(
                            campo
                        );


                    if (!esValido) {
                        return;
                    }


                    mostrarEstado(
                        campo,
                        "neutro",
                        "Formato válido. Verificando..."
                    );


                    consultarConRetraso();

                }
            );

        }


        // =====================================================
        // FORMULARIOS
        // =====================================================

        const formAgregar = (
            document.getElementById(
                "formAgregarApicultor"
            )
        );


        // =====================================================
        // NOMBRES - AGREGAR
        // =====================================================

        configurarNombre(
            document.getElementById(
                "primerNombreAgregar"
            ),
            true
        );


        configurarNombre(
            document.getElementById(
                "segundoNombreAgregar"
            ),
            false
        );


        configurarNombre(
            document.getElementById(
                "primerApellidoAgregar"
            ),
            true
        );


        configurarNombre(
            document.getElementById(
                "segundoApellidoAgregar"
            ),
            false
        );


        // =====================================================
        // NOMBRES - EDITAR
        // =====================================================

        configurarNombre(
            document.getElementById(
                "nombresEditar"
            ),
            true
        );


        configurarNombre(
            document.getElementById(
                "apellidosEditar"
            ),
            true
        );


        // =====================================================
        // TELÉFONO
        // =====================================================

        configurarTelefono(
            document.getElementById(
                "telefonoAgregar"
            )
        );


        configurarTelefono(
            document.getElementById(
                "telefonoEditar"
            )
        );


        // =====================================================
        // IDENTIFICACIÓN
        // =====================================================

        const identificacionAgregar =
            document.getElementById(
                "identificacionAgregar"
            );


        const identificacionEditar =
            document.getElementById(
                "identificacionEditar"
            );


        limitarNumeros(
            identificacionAgregar,
            10
        );


        limitarNumeros(
            identificacionEditar,
            10
        );


        configurarCampoUnico(
            identificacionAgregar,
            "identificacion",
            formAgregar,
            validarIdentificacionLocal,
            "Identificación disponible."
        );


        configurarCampoUnico(
            identificacionEditar,
            "identificacion",
            formEditar,
            validarIdentificacionLocal,
            "Identificación disponible."
        );


        // =====================================================
        // GMAIL
        // =====================================================

        configurarCampoUnico(
            document.getElementById(
                "correoAgregar"
            ),
            "correo",
            formAgregar,
            validarGmailLocal,
            "Correo Gmail disponible."
        );


        configurarCampoUnico(
            document.getElementById(
                "correoEditar"
            ),
            "correo",
            formEditar,
            validarGmailLocal,
            "Correo Gmail disponible."
        );


        // =====================================================
        // USERNAME
        // =====================================================

        configurarCampoUnico(
            document.getElementById(
                "usernameAgregar"
            ),
            "username",
            formAgregar,
            validarUsernameLocal,
            "Nombre de usuario disponible."
        );


        configurarCampoUnico(
            document.getElementById(
                "usernameEditar"
            ),
            "username",
            formEditar,
            validarUsernameLocal,
            "Nombre de usuario disponible."
        );


        // =====================================================
        // EXPERIENCIA
        // =====================================================

        [
            document.getElementById(
                "experienciaAgregar"
            ),
            document.getElementById(
                "experienciaEditar"
            )
        ]
        .forEach(
            function (
                campo
            ) {

                if (!campo) {
                    return;
                }


                campo.addEventListener(
                    "input",
                    function () {

                        campo.value = (
                            campo.value
                                .replace(
                                    /\D/g,
                                    ""
                                )
                        );


                        if (!campo.value) {

                            mostrarEstado(
                                campo,
                                "neutro",
                                ""
                            );

                            return;

                        }


                        const numero =
                            Number(
                                campo.value
                            );


                        if (
                            numero < 0
                            ||
                            numero > 80
                        ) {

                            mostrarEstado(
                                campo,
                                "invalido",
                                "La experiencia debe estar entre 0 y 80 años."
                            );

                            return;

                        }


                        mostrarEstado(
                            campo,
                            "valido",
                            "Experiencia válida."
                        );

                    }
                );

            }
        );


        // =====================================================
        // BLOQUEAR ENVÍO CON DATOS INVÁLIDOS
        // =====================================================

        [
            formAgregar,
            formEditar
        ]
        .forEach(
            function (
                formulario
            ) {

                if (!formulario) {
                    return;
                }


                formulario.addEventListener(
                    "submit",
                    function (
                        evento
                    ) {

                        const duplicado = (
                            formulario.querySelector(
                                '[data-duplicado="1"]'
                            )
                        );


                        if (
                            duplicado
                            ||
                            !formulario.checkValidity()
                        ) {

                            evento.preventDefault();

                            evento.stopPropagation();


                            if (duplicado) {

                                duplicado.reportValidity();

                            } else {

                                formulario.reportValidity();

                            }

                        }

                    }
                );

            }
        );

    }
);
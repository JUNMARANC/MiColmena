from dbmicolmena.models import Administrador, Apicultor


def perfil_usuario(request):
    perfil = None
    rol_usuario = None

    if request.user.is_authenticated:
        admin = Administrador.objects.filter(user=request.user).first()

        if admin:
            perfil = admin
            rol_usuario = "Administrador"
        else:
            apicultor = Apicultor.objects.filter(user=request.user).first()

            if apicultor:
                perfil = apicultor
                rol_usuario = "Apicultor"

    return {
        "perfil_usuario": perfil,
        "rol_usuario": rol_usuario,
    }
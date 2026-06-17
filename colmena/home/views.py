from django.shortcuts import render

def inicio(request):
    return render(request,'inicio.html')

def quienes(request):
    return render(request,'quienes.html')

def servicios(request):
    return render(request,'servicios.html')

def contactanos(request):
    return render(request,'contactanos.html')



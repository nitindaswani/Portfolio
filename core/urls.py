from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/ask/', views.ask_nitin, name='ask_nitin'),
]

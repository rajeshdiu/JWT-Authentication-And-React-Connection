
from django.contrib import admin
from django.urls import path
from myApp.views import ProtectedView


urlpatterns = [
    path('protected/', ProtectedView.as_view()),

]

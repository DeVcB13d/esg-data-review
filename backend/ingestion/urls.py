from django.urls import path
from . import views

urlpatterns = [
    path('ingest/utility/', views.ingest_utility, name='ingest_utility'),
    path('webhooks/navan/', views.ingest_navan, name='ingest_navan'),
    path('ingest/sap/', views.ingest_sap, name='ingest_sap'),
]

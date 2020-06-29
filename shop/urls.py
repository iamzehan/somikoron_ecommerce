from django.urls import path, include
from . import views
app_name = 'shop'
urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('itemdetails/<slug>', views.ItemDetailsView.as_view(), name='itemdetails'),
]

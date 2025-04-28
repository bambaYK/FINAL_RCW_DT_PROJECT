from django.urls import path
from .views import UserCreateView, UserDetailView, ChangePasswordView

urlpatterns = [
    path('', UserCreateView.as_view(), name='user-create'),
    path('<str:username>/', UserDetailView.as_view(), name='user-detail'),
    path('<str:username>/change-password/', ChangePasswordView.as_view(), name='change-password'),
]
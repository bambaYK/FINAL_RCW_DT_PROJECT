from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from two_factor import urls as two_factor_urls  # ✅ Import manuel des urls

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('library.urls')),

    # ✅ Import valide + namespace pour django-two-factor-auth
    #path('account/', include((two_factor_urls.urlpatterns, 'two_factor'), namespace='two_factor')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

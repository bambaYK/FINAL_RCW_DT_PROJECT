import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
import uuid


class Library(models.Model):
    TYPE_CHOICES = [
        ('book', 'Livre'),
        ('document', 'Document')
    ]
    LANGUE_CHOICES = [
        ('fr', 'Français'),
        ('en', 'Anglais')
    ]
    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('epub', 'EPUB'),
        ('mobi', 'MOBI')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    titre = models.CharField(max_length=255)
    auteur = models.CharField(max_length=255)
    description = models.TextField()
    langue = models.CharField(max_length=2, choices=LANGUE_CHOICES)
    book_format  = models.CharField(max_length=5, choices=FORMAT_CHOICES)
    url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    est_public = models.BooleanField(default=True)

    # Book-specific fields
    isbn = models.CharField(max_length=13, blank=True, null=True)
    date_publication = models.DateField(blank=True, null=True)
    editeur = models.CharField(max_length=255, blank=True, null=True)
    nombre_pages = models.IntegerField(blank=True, null=True)
    categorie = models.CharField(max_length=255, blank=True, null=True)

    # Document-specific fields
    type_document = models.CharField(max_length=255, blank=True, null=True)
    taille_fichier = models.IntegerField(blank=True, null=True)  # in KB
    mots_cles = models.TextField(blank=True, null=True)
    nombre_telechargements = models.IntegerField(default=0)

    def __str__(self):
        return self.titre

    def get_pdf_path(self):
        """Returns the PDF file path"""
        base_path = settings.LIBRARY_FILES_ROOT
        if self.type == 'book':
            return base_path / 'books' / f"{self.id}.pdf"
        return base_path / 'documents' / f"{self.id}.pdf"

class Subscription(models.Model):
    DURATION_CHOICES = [
        ('15_days', '15 jours'),
        ('1_month', '1 mois'),
        ('1_year', '1 an')
    ]
    
    STATUS_CHOICES = [
        ('active', 'Actif'),
        ('expired', 'Expiré'),
        ('cancelled', 'Annulé')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    type = models.CharField(max_length=10, choices=DURATION_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _("Abonnement")
        verbose_name_plural = _("Abonnements")

    def __str__(self):
        return f"Abonnement de {self.user.username} ({self.get_type_display()})"

    def save(self, *args, **kwargs):
        if not self.end_date:
            if self.type == '15_days':
                self.end_date = timezone.now() + timedelta(days=15)
            elif self.type == '1_month':
                self.end_date = timezone.now() + timedelta(days=30)
            elif self.type == '1_year':
                self.end_date = timezone.now() + timedelta(days=365)
        super().save(*args, **kwargs)

    @property
    def is_active(self):
        return self.status == 'active' and self.end_date > timezone.now()

    @property
    def days_remaining(self):
        if not self.is_active:
            return 0
        delta = self.end_date - timezone.now()
        return max(0, delta.days)

class Emprunt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column='USER_ID')
    resource = models.ForeignKey(Library, on_delete=models.CASCADE, db_column='RESOURCE_ID')
    date_emprunt = models.DateTimeField(auto_now_add=True)
    date_retour = models.DateTimeField()
    est_retourne = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = _("Emprunt")
        verbose_name_plural = _("Emprunts")
        ordering = ['-date_emprunt']
        
    def clean(self):
        # Check for active subscription
        if not Subscription.objects.filter(
            user=self.user,
            status='active',
            end_date__gt=timezone.now()
        ).exists():
            raise ValidationError(_("Vous devez avoir un abonnement actif pour emprunter"))
            
        # Check if already borrowed
        if not self.est_retourne and Emprunt.objects.filter(
            user=self.user,
            resource=self.resource,
            est_retourne=False
        ).exists():
            raise ValidationError(_("Vous avez déjà emprunté cette ressource"))
        
        # Check active borrows count
        emprunts_actifs = Emprunt.objects.filter(
            user=self.user,
            est_retourne=False
        ).count()
        
        if emprunts_actifs >= 5 and not self.est_retourne:
            raise ValidationError(_("Vous avez atteint le nombre maximum d'emprunts simultanés (5)"))
    
    def save(self, *args, **kwargs):
        # Set default return date (15 days)
        if not self.date_retour:
            self.date_retour = timezone.now() + timedelta(days=15)
        super().save(*args, **kwargs)

    @property
    def est_en_retard(self):
        return not self.est_retourne and timezone.now() > self.date_retour



class StripeCustomer(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    customer_id = models.CharField(max_length=255, unique=True)
    subscription_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.customer_id}"

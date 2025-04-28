from django.contrib import admin
from .models import Library, Subscription

@admin.register(Library)
class LibraryAdmin(admin.ModelAdmin):
    list_display = ('titre', 'auteur', 'type', 'langue', 'est_public', 'created_at')
    list_filter = ('type', 'est_public', 'langue', 'book_format')
    search_fields = ('titre', 'auteur', 'description', 'isbn', 'mots_cles')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {
            'fields': ('type', 'titre', 'auteur', 'description', 'langue', 'book_format', 'url', 'est_public')
        }),
        ('Informations Livre', {
            'classes': ('collapse',),
            'fields': ('isbn', 'date_publication', 'editeur', 'nombre_pages', 'categorie'),
        }),
        ('Informations Document', {
            'classes': ('collapse',),
            'fields': ('type_document', 'taille_fichier', 'mots_cles', 'nombre_telechargements'),
        }),
    )

    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        if obj:  # Si on modifie un objet existant
            if obj.type == 'book':
                # Cacher les champs document pour les livres
                fieldsets = [fs for fs in fieldsets if fs[0] != 'Informations Document']
            else:
                # Cacher les champs livre pour les documents
                fieldsets = [fs for fs in fieldsets if fs[0] != 'Informations Livre']
        return fieldsets

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'status', 'start_date', 'end_date', 'is_active', 'days_remaining')
    list_filter = ('type', 'status')
    search_fields = ('user__username', 'user__email')
    ordering = ('-created_at',)
    readonly_fields = ('days_remaining', 'is_active')
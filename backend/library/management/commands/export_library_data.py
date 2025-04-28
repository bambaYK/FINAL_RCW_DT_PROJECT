import json
from django.core.management.base import BaseCommand
import os
import django
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from library.models import Library

class Command(BaseCommand):
    help = 'Exporte les données de la bibliothèque au format JSON pour le chatbot'

    def handle(self, *args, **kwargs):
        data = []
        for item in Library.objects.all():
            texte = f"""
Titre : {item.titre}
Auteur : {item.auteur}
Langue : {'Français' if item.langue == 'fr' else 'Anglais'}
Format : {item.format.upper()}
Catégorie : {item.categorie or 'Non spécifiée'}
Description : {item.description}
Type : {'Livre' if item.type == 'book' else 'Document'}
Mots-clés : {item.mots_cles or 'Aucun'}

{"ISBN : " + item.isbn if item.isbn else ""}
{"Date de publication : " + str(item.date_publication) if item.date_publication else ""}
{"Éditeur : " + item.editeur if item.editeur else ""}
{"Nombre de pages : " + str(item.nombre_pages) if item.nombre_pages else ""}
{"Taille fichier : " + str(item.taille_fichier) + ' KB' if item.taille_fichier else ""}
            """.strip()
            data.append({"text": texte})

        with open("library_corpus.json", "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        self.stdout.write(self.style.SUCCESS("Exportation terminée avec succès."))

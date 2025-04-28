import os
import django
import random
from datetime import datetime, timedelta
from pathlib import Path
import requests
from bs4 import BeautifulSoup
from slugify import slugify
from library.utils import create_sample_pdf

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from library.models import Library

class ExtendedLibraryPopulator:
    def __init__(self):
        self.books_dir = settings.LIBRARY_FILES_ROOT / 'books'
        self.documents_dir = settings.LIBRARY_FILES_ROOT / 'documents'
        self.books_dir.mkdir(parents=True, exist_ok=True)
        self.documents_dir.mkdir(parents=True, exist_ok=True)
        
        self.book_categories = {
            'Roman classique': [
                'Littérature française', 'Littérature anglaise', 'Littérature russe', 
                'Littérature américaine', 'Littérature allemande', 'Littérature italienne'
            ],
            'Science-fiction': [
                'Space Opera', 'Cyberpunk', 'Post-apocalyptique', 'Dystopie', 
                'Voyage dans le temps', 'Science-fiction militaire'
            ],
            'Fantastique': [
                'Fantasy épique', 'Urban Fantasy', 'Dark Fantasy', 'Mythologie',
                'Contes et légendes', 'Paranormal'
            ],
            'Policier': [
                'Thriller psychologique', 'Enquête historique', 'Polar nordique',
                'Crime organisé', 'Espionnage', 'Procédure policière'
            ],
            'Sciences humaines': [
                'Philosophie', 'Psychologie', 'Sociologie', 'Anthropologie',
                'Histoire', 'Géographie'
            ],
            'Sciences exactes': [
                'Physique', 'Mathématiques', 'Biologie', 'Chimie',
                'Astronomie', 'Informatique'
            ],
            'Arts et culture': [
                'Histoire de l\'art', 'Musique', 'Cinéma', 'Architecture',
                'Photographie', 'Arts plastiques'
            ],
            'Développement personnel': [
                'Psychologie positive', 'Productivité', 'Bien-être',
                'Leadership', 'Communication', 'Méditation'
            ]
        }

        self.document_types = {
            'Académique': [
                'Thèse doctorale', 'Article scientifique', 'Mémoire de master',
                'Revue académique', 'Actes de conférence', 'Rapport de recherche'
            ],
            'Technique': [
                'Guide technique', 'Manuel utilisateur', 'Documentation API',
                'Livre blanc', 'Spécification technique', 'Guide de déploiement'
            ],
            'Formation': [
                'Support de cours', 'Exercices pratiques', 'Tutoriel',
                'Guide pédagogique', 'Plan de formation', 'Étude de cas'
            ],
            'Professionnel': [
                'Rapport annuel', 'Étude de marché', 'Plan d\'affaires',
                'Analyse financière', 'Stratégie marketing', 'Audit'
            ],
            'Juridique': [
                'Contrat type', 'Procédure légale', 'Analyse juridique',
                'Jurisprudence', 'Réglementation', 'Guide de conformité'
            ],
            'Recherche': [
                'Publication scientifique', 'Étude comparative', 'Analyse statistique',
                'Rapport d\'expérimentation', 'Revue de littérature', 'Méthodologie'
            ]
        }

    def generate_isbn(self):
        prefix = '978'
        digits = prefix + ''.join([str(random.randint(0, 9)) for _ in range(9)])
        total = 0
        for i in range(12):
            if i % 2 == 0:
                total += int(digits[i])
            else:
                total += int(digits[i]) * 3
        check_digit = (10 - (total % 10)) % 10
        return digits + str(check_digit)

    def get_random_date(self, start_year=1800, end_year=2024):
        start_date = datetime(start_year, 1, 1)
        end_date = datetime(end_year, 12, 31)
        time_between = end_date - start_date
        days_between = time_between.days
        random_days = random.randrange(days_between)
        return start_date + timedelta(days=random_days)

    def generate_title(self):
        title_prefixes = ["Le", "La", "Les", "Un", "Une", "L'"]
        title_subjects = ["Secret", "Mystère", "Destin", "Voyage", "Histoire", "Chronique"]
        title_suffixes = ["du Temps", "de l'Espace", "des Ombres", "de la Lumière", "du Futur"]
        return f"{random.choice(title_prefixes)} {random.choice(title_subjects)} {random.choice(title_suffixes)}"

    def generate_author(self):
        first_names = ["Jean", "Marie", "Pierre", "Sophie", "Michel", "Claire", "Thomas", "Anne"]
        last_names = ["Martin", "Bernard", "Dubois", "Robert", "Richard", "Petit", "Durand", "Leroy"]
        return f"{random.choice(first_names)} {random.choice(last_names)}"

    def generate_description(self):
        return "Un ouvrage captivant qui vous transportera dans un univers fascinant."

    def generate_category(self):
        main_category = random.choice(list(self.book_categories.keys()))
        sub_category = random.choice(self.book_categories[main_category])
        return f"{main_category} - {sub_category}"

    def generate_document_title(self):
        title_prefixes = ["Étude sur", "Analyse de", "Recherche sur", "Investigation de"]
        title_subjects = ["l'Impact", "l'Évolution", "les Tendances", "les Perspectives"]
        title_domains = ["en Sciences", "en Société", "dans l'Industrie", "dans l'Économie"]
        return f"{random.choice(title_prefixes)} {random.choice(title_subjects)} {random.choice(title_domains)}"

    def generate_institution(self):
        institutions = ["Université de Paris", "CNRS", "Institut National", "Centre de Recherche"]
        departments = ["Département de Recherche", "Unité d'Études", "Laboratoire"]
        return f"{random.choice(institutions)} - {random.choice(departments)}"

    def generate_document_description(self):
        return "Document détaillé présentant une analyse approfondie du sujet."

    def generate_document_type(self):
        main_type = random.choice(list(self.document_types.keys()))
        sub_type = random.choice(self.document_types[main_type])
        return f"{main_type} - {sub_type}"

    def generate_keywords(self):
        keywords = ["recherche", "innovation", "analyse", "méthodologie", "résultats",
                   "étude", "développement", "stratégie", "évaluation", "synthèse"]
        return ", ".join(random.sample(keywords, 5))

    def create_book(self, index):
        book_data = {
            "type": "book",
            "titre": self.generate_title(),
            "auteur": self.generate_author(),
            "description": self.generate_description(),
            "langue": random.choice(['fr', 'en']),
            "format": "pdf",
            "isbn": self.generate_isbn(),
            "date_publication": self.get_random_date(),
            "editeur": random.choice([
                "Gallimard", "Flammarion", "Seuil", "Actes Sud", 
                "Albin Michel", "Grasset", "Stock", "Minuit"
            ]),
            "nombre_pages": random.randint(100, 1000),
            "categorie": self.generate_category(),
            "est_public": True
        }
        
        pdf_filename = f"book_{slugify(book_data['titre'])}_{book_data['isbn']}.pdf"
        pdf_path = self.books_dir / pdf_filename
        
        content = f"""
{book_data['titre']}

Par {book_data['auteur']}
{book_data['editeur']} - {book_data['date_publication'].year}

Description:
{book_data['description']}

ISBN: {book_data['isbn']}
Catégorie: {book_data['categorie']}
Nombre de pages: {book_data['nombre_pages']}

[Contenu exemple du livre]
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
"""
        
        create_sample_pdf(
            book_data['titre'],
            book_data['auteur'],
            content,
            pdf_path
        )
        
        book_data['url'] = f"{settings.LIBRARY_FILES_URL}books/{pdf_filename}"
        
        return book_data

    def create_document(self, index):
        doc_data = {
            "type": "document",
            "titre": self.generate_document_title(),
            "auteur": self.generate_institution(),
            "description": self.generate_document_description(),
            "langue": random.choice(['fr', 'en']),
            "format": "pdf",
            "type_document": self.generate_document_type(),
            "taille_fichier": random.randint(1000, 50000),
            "mots_cles": self.generate_keywords(),
            "nombre_telechargements": random.randint(0, 1000),
            "est_public": True
        }
        
        pdf_filename = f"doc_{slugify(doc_data['titre'])}_{index}.pdf"
        pdf_path = self.documents_dir / pdf_filename
        
        content = f"""
{doc_data['titre']}

Par {doc_data['auteur']}
Type: {doc_data['type_document']}

Description:
{doc_data['description']}

Mots-clés: {doc_data['mots_cles']}

[Contenu exemple du document]
Ce document présente une analyse détaillée sur le sujet mentionné.
Les points principaux abordés sont :

1. Introduction au sujet
2. Méthodologie utilisée
3. Résultats obtenus
4. Conclusions et recommandations

[Suite du contenu...]
"""
        
        create_sample_pdf(
            doc_data['titre'],
            doc_data['auteur'],
            content,
            pdf_path
        )
        
        doc_data['url'] = f"{settings.LIBRARY_FILES_URL}documents/{pdf_filename}"
        
        return doc_data

    def populate(self, num_books=200, num_documents=200):
        print(f"\nCréation de {num_books} livres...")
        for i in range(num_books):
            book_data = self.create_book(i)
            Library.objects.create(**book_data)
            print(f"[{i+1}/{num_books}] Livre créé : {book_data['titre']}")

        print(f"\nCréation de {num_documents} documents...")
        for i in range(num_documents):
            doc_data = self.create_document(i)
            Library.objects.create(**doc_data)
            print(f"[{i+1}/{num_documents}] Document créé : {doc_data['titre']}")

        print(f"\nPopulation terminée! Total: {num_books + num_documents} ressources créées")

if __name__ == '__main__':
    Library.objects.all().delete()
    print("Base de données nettoyée.")
    
    populator = ExtendedLibraryPopulator()
    populator.populate(num_books=200, num_documents=200)
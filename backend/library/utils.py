import os
import requests
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from django.conf import settings
import tempfile

def create_sample_pdf(title, author, content, destination):
    """Crée un PDF avec le contenu fourni en utilisant ReportLab"""
    try:
        # Création du PDF
        c = canvas.Canvas(str(destination), pagesize=A4)
        width, height = A4

        # En-tête
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, height - 50, title)
        
        c.setFont("Helvetica", 12)
        c.drawString(50, height - 70, f"Auteur: {author}")
        
        # Ligne de séparation
        c.line(50, height - 80, width - 50, height - 80)
        
        # Contenu principal
        c.setFont("Helvetica", 11)
        y = height - 100
        for line in content.split('\n'):
            if y > 50:  # Vérifier qu'il reste de l'espace sur la page
                c.drawString(50, y, line)
                y -= 15
            else:
                c.showPage()  # Nouvelle page
                y = height - 50
        
        c.save()
        return True
        
    except Exception as e:
        print(f"Erreur lors de la création du PDF: {str(e)}")
        return False

def download_gutenberg_book(gutenberg_id, destination):
    """Télécharge un livre depuis Project Gutenberg et crée un PDF"""
    try:
        # Tentative de téléchargement du contenu
        response = requests.get(f"https://www.gutenberg.org/files/{gutenberg_id}/{gutenberg_id}-0.txt")
        if response.status_code == 200:
            content = response.text
            # Création d'un PDF à partir du contenu
            return create_sample_pdf(
                f"Livre #{gutenberg_id}",
                "Project Gutenberg",
                content[:5000],  # Premiers 5000 caractères pour l'exemple
                destination
            )
        return False
    except Exception as e:
        print(f"Erreur lors du téléchargement du livre Gutenberg {gutenberg_id}: {str(e)}")
        return False
from flask import Blueprint, request, send_file, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Emprunt, Subscription, Library
from datetime import datetime
import os
from app.utils.pdf_generator import create_sample_pdf

pdf_bp = Blueprint('pdf', __name__, url_prefix='/library')

@pdf_bp.route('/<string:resource_id>/pdf', methods=['GET'])
@jwt_required()
def get_pdf(resource_id):
    identity = get_jwt_identity()
    user_id = identity.get("user_id")

    # Vérifie l'abonnement actif
    active_subscription = Subscription.query.filter(
        Subscription.user_id == user_id,
        Subscription.status == 'active',
        Subscription.end_date > datetime.utcnow()
    ).first()

    if not active_subscription:
        return jsonify({"error": "Un abonnement actif est requis pour accéder aux documents"}), 403

    # Vérifie si le livre existe
    resource = Library.query.get(resource_id)
    if not resource:
        return jsonify({"error": "Ressource introuvable"}), 404

    # Vérifie si l'utilisateur a emprunté cette ressource
    emprunt = Emprunt.query.filter_by(
        user_id=user_id,
        resource_id=resource_id,
        est_retourne=False
    ).first()

    if not emprunt:
        return jsonify({"error": "Vous devez d'abord emprunter cette ressource"}), 403

    # Génère un chemin vers le dossier partagé Django/Flask
    BASE_LIBRARY_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../library_files')

    if resource.type == 'book':
        pdf_path = os.path.join(BASE_LIBRARY_PATH, 'books', f"{resource.id}.pdf")
    else:
        pdf_path = os.path.join(BASE_LIBRARY_PATH, 'documents', f"{resource.id}.pdf")

    # Si le PDF n'existe pas, crée un PDF factice
    if not os.path.exists(pdf_path):
        content = f"""
        Titre: {resource.titre}
        Auteur: {resource.auteur}
        Description: {resource.description}

        Ceci est un exemple de contenu PDF pour {resource.titre}.
        """
        create_sample_pdf(resource.titre, resource.auteur, content, pdf_path)

    # Envoi du fichier PDF avec les bons headers
    response = send_file(
        pdf_path,
        mimetype='application/pdf',
        as_attachment=False,
        download_name=f"{resource.titre.replace(' ', '_')}.pdf"
    )
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"

    return response

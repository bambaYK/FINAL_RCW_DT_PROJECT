from flask import Blueprint, request, jsonify
from app.models import db, Emprunt, Library, Subscription
from app.schemas.serializers import EmpruntSchema, EmpruntWithBookSchema
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

borrow_bp = Blueprint('borrow', __name__, url_prefix='/library')


# 🔐 POST /library/<id>/borrow
@borrow_bp.route('/<string:resource_id>/borrow', methods=['POST'])
@jwt_required()
def borrow_resource(resource_id):
    user_id = get_jwt_identity().get("user_id")

    # Vérifie l'abonnement actif
    active = Subscription.query.filter(
        Subscription.user_id == user_id,
        Subscription.status == 'active',
        Subscription.end_date > datetime.utcnow()
    ).first()
    if not active:
        return jsonify({'error': 'Un abonnement actif est requis pour emprunter'}), 403

    resource = Library.query.get(resource_id)
    if not resource:
        return jsonify({'error': 'Ressource introuvable'}), 404

    # Vérifie emprunt déjà existant
    existing = Emprunt.query.filter_by(
        user_id=user_id,
        resource_id=resource_id,
        est_retourne=False
    ).first()
    if existing:
        return jsonify({'error': 'Vous avez déjà emprunté cette ressource'}), 400

    # Vérifie limite d'emprunt
    count = Emprunt.query.filter_by(user_id=user_id, est_retourne=False).count()
    if count >= 5:
        return jsonify({'error': 'Limite de 5 emprunts atteinte'}), 400

    duration = int(request.json.get('duration', 15))
    date_retour = datetime.utcnow() + timedelta(days=duration)

    emprunt = Emprunt(
        user_id=user_id,
        resource_id=resource_id,
        date_retour=date_retour
    )
    emprunt.save()

    return jsonify(EmpruntSchema().dump(emprunt)), 201


# 🔐 POST /library/return/<id>
@borrow_bp.route('/return/<string:emprunt_id>', methods=['POST'])
@jwt_required()
def return_resource(emprunt_id):
    user_id = get_jwt_identity().get("user_id")

    emprunt = Emprunt.query.filter_by(
        id=emprunt_id,
        user_id=user_id,
        est_retourne=False
    ).first()

    if not emprunt:
        return jsonify({'error': 'Emprunt introuvable ou déjà retourné'}), 404

    emprunt.est_retourne = True
    db.session.commit()

    return jsonify({'message': 'Livre retourné avec succès'}), 200


# 🔐 GET /library/borrowed
@borrow_bp.route('/borrowed', methods=['GET'])
@jwt_required()
def get_active_borrows():
    user_id = get_jwt_identity().get("user_id")

    emprunts = Emprunt.query.filter_by(
        user_id=user_id,
        est_retourne=False
    ).order_by(Emprunt.date_emprunt.desc()).all()

    return jsonify(EmpruntWithBookSchema(many=True).dump(emprunts)), 200

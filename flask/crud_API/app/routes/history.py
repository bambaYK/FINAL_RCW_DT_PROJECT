from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Emprunt, Subscription
from app.schemas.serializers import EmpruntWithBookSchema, SubscriptionSchema
from datetime import datetime

history_bp = Blueprint('history', __name__, url_prefix='/library')

@history_bp.route('/full-history', methods=['GET'])
@jwt_required()
def full_history():
    identity = get_jwt_identity()
    user_id = identity.get("user_id")

    emprunts = Emprunt.query.filter_by(
        user_id=user_id,
        est_retourne=True
    ).order_by(Emprunt.date_emprunt.desc()).all()

    abonnements = Subscription.query.filter(
        Subscription.user_id == user_id,
        Subscription.end_date < datetime.utcnow()
    ).order_by(Subscription.start_date.desc()).all()

    return jsonify({
        "emprunts": EmpruntWithBookSchema(many=True).dump(emprunts),
        "subscriptions": SubscriptionSchema(many=True).dump(abonnements)
    }), 200

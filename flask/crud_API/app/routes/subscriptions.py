from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Subscription
from app.schemas.serializers import SubscriptionSchema
from datetime import datetime, timedelta

subscriptions_bp = Blueprint('subscriptions', __name__, url_prefix='/subscriptions')

@subscriptions_bp.route('/', methods=['POST'])
@jwt_required()
def create_subscription():
    identity = get_jwt_identity()
    user_id = identity.get("user_id")

    plan_type = request.json.get('type')
    price = request.json.get('price')

    if not plan_type or not price:
        return jsonify({'error': 'Type et prix requis'}), 400

    active = Subscription.query.filter(
        Subscription.user_id == user_id,
        Subscription.status == 'active',
        Subscription.end_date > datetime.utcnow()
    ).first()

    if active:
        return jsonify({'error': 'Vous avez déjà un abonnement actif'}), 400

    durations = {"15_days": 15, "1_month": 30, "1_year": 365}
    if plan_type not in durations:
        return jsonify({'error': 'Type d’abonnement invalide'}), 400

    end_date = datetime.utcnow() + timedelta(days=durations[plan_type])

    sub = Subscription(
        user_id=user_id,
        type=plan_type,
        price=price,
        start_date=datetime.utcnow(),
        end_date=end_date,
        status='active'
    )
    db.session.add(sub)
    db.session.commit()

    return jsonify(SubscriptionSchema().dump(sub)), 201

@subscriptions_bp.route('/status/', methods=['GET'])
@jwt_required()
def subscription_status():
    identity = get_jwt_identity()
    user_id = identity.get("user_id")

    sub = Subscription.query.filter(
        Subscription.user_id == user_id,
        Subscription.status == 'active',
        Subscription.end_date > datetime.utcnow()
    ).first()

    return jsonify({
        "is_active": bool(sub),
        "subscription": SubscriptionSchema().dump(sub) if sub else None
    }), 200

@subscriptions_bp.route('/cancel/', methods=['POST'])
@jwt_required()
def cancel_subscription():
    identity = get_jwt_identity()
    user_id = identity.get("user_id")

    sub = Subscription.query.filter(
        Subscription.user_id == user_id,
        Subscription.status == 'active',
        Subscription.end_date > datetime.utcnow()
    ).first()

    if not sub:
        return jsonify({"error": "Aucun abonnement actif trouvé"}), 404

    sub.status = 'cancelled'
    sub.end_date = datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "Abonnement annulé avec succès"}), 200

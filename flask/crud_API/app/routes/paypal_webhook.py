from flask import Blueprint, request, jsonify
from app.models import db, Subscription
from datetime import datetime, timedelta
import json

paypal_webhook_bp = Blueprint('paypal_webhook', __name__, url_prefix='/paypal')

@paypal_webhook_bp.route('/webhook', methods=['POST'])
def paypal_webhook():
    try:
        event = request.get_json()
        event_type = event.get("event_type")

        if event_type == "CHECKOUT.ORDER.APPROVED":
            custom_id = event["resource"]["purchase_units"][0]["custom_id"]
            user_id, plan_type = custom_id.split(":")

            # Vérification : abonnement actif déjà existant ?
            existing = Subscription.query.filter(
                Subscription.user_id == user_id,
                Subscription.status == 'active',
                Subscription.end_date > datetime.utcnow()
            ).first()

            if existing:
                print(f"❌ Abonnement déjà actif pour utilisateur {user_id}, webhook ignoré.")
                return jsonify({"detail": "Abonnement déjà actif"}), 200

            durations = {"15_days": 15, "1_month": 30, "1_year": 365}
            price_map = {"15_days": 9.99, "1_month": 19.99, "1_year": 199.99}

            # Créer l'abonnement
            sub = Subscription(
                user_id=user_id,
                type=plan_type,
                price=price_map[plan_type],
                start_date=datetime.utcnow(),
                end_date=datetime.utcnow() + timedelta(days=durations[plan_type]),
                status="active"
            )
            db.session.add(sub)
            db.session.commit()

            print(f"✅ Paiement validé, abonnement créé pour {user_id}")
            return jsonify({}), 200

        print("🔵 Type d'événement non traité:", event_type)
        return jsonify({"detail": "Type d'événement non géré"}), 200

    except Exception as e:
        print("❌ Erreur Webhook PayPal:", str(e))
        return jsonify({"error": str(e)}), 400

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
from datetime import datetime, timedelta
from app.models import db, Subscription

paypal_bp = Blueprint('paypal', __name__, url_prefix='/paypal')

# Variables d'environnement (ou config.py) pour client PayPal
PAYPAL_CLIENT_ID = "TON_CLIENT_ID"
PAYPAL_SECRET = "TON_SECRET"
PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"  # mode sandbox

@paypal_bp.route('/create-subscription', methods=['POST'])
@jwt_required()
def create_paypal_subscription():
    identity = get_jwt_identity()
    user_id = identity.get("user_id")

    plan_type = request.json.get("plan")
    price_map = {
        "15_days": 9.99,
        "1_month": 19.99,
        "1_year": 199.99,
    }

    if plan_type not in price_map:
        return jsonify({"error": "Type d'abonnement invalide"}), 400

    # Authentification avec PayPal
    auth = (PAYPAL_CLIENT_ID, PAYPAL_SECRET)
    auth_response = requests.post(
        f"{PAYPAL_API_BASE}/v1/oauth2/token",
        auth=auth,
        data={"grant_type": "client_credentials"}
    )
    access_token = auth_response.json().get("access_token")

    if not access_token:
        return jsonify({"error": "Erreur d'authentification PayPal"}), 500

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
    }
    body = {
        "intent": "CAPTURE",
        "purchase_units": [{
            "amount": {
                "currency_code": "EUR",
                "value": str(price_map[plan_type])
            },
            "custom_id": f"{user_id}:{plan_type}"
        }],
        "application_context": {
            "return_url": "http://localhost:5173/success?activated=true",
            "cancel_url": "http://localhost:5173/cancel"
        }
    }

    res = requests.post(
        f"{PAYPAL_API_BASE}/v2/checkout/orders",
        headers=headers,
        json=body
    )

    if res.status_code != 201:
        return jsonify({"error": "Erreur de création de commande PayPal"}), 500

    order = res.json()
    paypal_url = next(link["href"] for link in order["links"] if link["rel"] == "approve")

    return jsonify({"url": paypal_url}), 200

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
import uuid

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    # Simule un login en prenant un ID utilisateur transmis
    username = request.json.get('username')
    user_id = request.json.get('user_id') or str(uuid.uuid4())  # à remplacer par une vraie requête
    if not username:
        return jsonify({"msg": "Nom d'utilisateur requis"}), 400

    access_token = create_access_token(identity={"user_id": user_id, "username": username})
    return jsonify(access_token=access_token), 200

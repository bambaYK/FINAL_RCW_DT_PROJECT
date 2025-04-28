from flask import Blueprint, request, jsonify
from app.models import db, Library
from app.schemas.serializers import LibrarySchema
from sqlalchemy.exc import SQLAlchemyError
from flask_jwt_extended import jwt_required, get_jwt_identity

library_bp = Blueprint('library', __name__, url_prefix='/library')

# GET /library - lister tous les livres/documents
@library_bp.route('/', methods=['GET'])
def list_resources():
    resource_type = request.args.get('type')
    query = Library.query
    if resource_type:
        query = query.filter_by(type=resource_type)
    resources = query.order_by(Library.created_at.desc()).all()
    return jsonify(LibrarySchema(many=True).dump(resources)), 200

# GET /library/<id> - afficher une ressource
@library_bp.route('/<string:resource_id>', methods=['GET'])
def get_resource(resource_id):
    resource = Library.query.get(resource_id)
    if not resource:
        return jsonify({'error': 'Ressource introuvable'}), 404
    return jsonify(LibrarySchema().dump(resource)), 200

# POST /library - créer une ressource (sécurisée)
@library_bp.route('/', methods=['POST'])
@jwt_required()
def create_resource():
    identity = get_jwt_identity()
    user_id = identity.get("user_id")
    print(f"📚 Création de ressource par l'utilisateur {user_id}")

    try:
        data = request.json
        resource = Library(**data)
        db.session.add(resource)
        db.session.commit()
        return jsonify(LibrarySchema().dump(resource)), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# PUT /library/<id> - mise à jour d'une ressource (sécurisée)
@library_bp.route('/<string:resource_id>', methods=['PUT'])
@jwt_required()
def update_resource(resource_id):
    identity = get_jwt_identity()
    user_id = identity.get("user_id")
    print(f"✏️ Modification par {user_id}")

    resource = Library.query.get(resource_id)
    if not resource:
        return jsonify({'error': 'Ressource introuvable'}), 404

    data = request.json
    for key, value in data.items():
        setattr(resource, key, value)
    db.session.commit()
    return jsonify(LibrarySchema().dump(resource)), 200

# DELETE /library/<id> - suppression d'une ressource (sécurisée)
@library_bp.route('/<string:resource_id>', methods=['DELETE'])
@jwt_required()
def delete_resource(resource_id):
    identity = get_jwt_identity()
    user_id = identity.get("user_id")
    print(f"🗑️ Suppression demandée par {user_id}")

    resource = Library.query.get(resource_id)
    if not resource:
        return jsonify({'error': 'Ressource introuvable'}), 404
    db.session.delete(resource)
    db.session.commit()
    return jsonify({'message': 'Ressource supprimée avec succès'}), 204

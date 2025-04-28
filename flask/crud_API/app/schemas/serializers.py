from marshmallow import Schema, fields
from datetime import datetime

class LibrarySchema(Schema):
    id = fields.Str(dump_only=True)
    type = fields.Str(required=True)
    titre = fields.Str(required=True)
    auteur = fields.Str(required=True)
    description = fields.Str()
    langue = fields.Str(required=True)
    format = fields.Str(required=True)
    url = fields.Url(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    est_public = fields.Boolean()

    isbn = fields.Str(allow_none=True)
    date_publication = fields.Date(allow_none=True)
    editeur = fields.Str(allow_none=True)
    nombre_pages = fields.Int(allow_none=True)
    categorie = fields.Str(allow_none=True)

    type_document = fields.Str(allow_none=True)
    taille_fichier = fields.Int(allow_none=True)
    mots_cles = fields.Str(allow_none=True)
    nombre_telechargements = fields.Int(dump_only=True)

class SubscriptionSchema(Schema):
    id = fields.Str(dump_only=True)
    user_id = fields.Str(required=True)
    type = fields.Str(required=True)
    price = fields.Decimal(as_string=True)
    start_date = fields.DateTime(dump_only=True)
    end_date = fields.DateTime(dump_only=True)
    status = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    is_active = fields.Method("get_is_active", dump_only=True)
    days_remaining = fields.Method("get_days_remaining", dump_only=True)

    def get_is_active(self, obj):
        return obj.is_active

    def get_days_remaining(self, obj):
        return obj.days_remaining

class EmpruntSchema(Schema):
    id = fields.Str(dump_only=True)
    user_id = fields.Str(required=True)
    resource_id = fields.Str(required=True)
    date_emprunt = fields.DateTime(dump_only=True)
    date_retour = fields.DateTime()
    est_retourne = fields.Boolean()
    est_en_retard = fields.Method("get_est_en_retard", dump_only=True)

    def get_est_en_retard(self, obj):
        return obj.est_en_retard

# Optionnel : sérialiser avec l’objet complet du livre
class EmpruntWithBookSchema(EmpruntSchema):
    resource = fields.Nested(LibrarySchema)

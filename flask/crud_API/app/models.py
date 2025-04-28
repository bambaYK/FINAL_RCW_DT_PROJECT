from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import uuid

db = SQLAlchemy()

class Library(db.Model):
    __tablename__ = 'library'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    type = db.Column(db.String(10), nullable=False)  # book / document
    titre = db.Column(db.String(255), nullable=False)
    auteur = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    langue = db.Column(db.String(2), nullable=False)  # fr / en
    format = db.Column(db.String(5), nullable=False)  # pdf / epub / mobi
    url = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    est_public = db.Column(db.Boolean, default=True)

    # Book-specific fields
    isbn = db.Column(db.String(13))
    date_publication = db.Column(db.Date)
    editeur = db.Column(db.String(255))
    nombre_pages = db.Column(db.Integer)
    categorie = db.Column(db.String(255))

    # Document-specific fields
    type_document = db.Column(db.String(255))
    taille_fichier = db.Column(db.Integer)  # en Ko
    mots_cles = db.Column(db.Text)
    nombre_telechargements = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f"<Library {self.titre}>"

class Subscription(db.Model):
    __tablename__ = 'subscription'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), nullable=False)
    type = db.Column(db.String(10), nullable=False)  # 15_days / 1_month / 1_year
    price = db.Column(db.Numeric(10, 2), nullable=False)
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime)
    status = db.Column(db.String(10), default='active')  # active / expired / cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def save(self):
        if not self.end_date:
            if self.type == '15_days':
                self.end_date = datetime.utcnow() + timedelta(days=15)
            elif self.type == '1_month':
                self.end_date = datetime.utcnow() + timedelta(days=30)
            elif self.type == '1_year':
                self.end_date = datetime.utcnow() + timedelta(days=365)
        db.session.add(self)
        db.session.commit()

    @property
    def is_active(self):
        return self.status == 'active' and self.end_date > datetime.utcnow()

    @property
    def days_remaining(self):
        if not self.is_active:
            return 0
        return max(0, (self.end_date - datetime.utcnow()).days)

class Emprunt(db.Model):
    __tablename__ = 'emprunt'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), nullable=False)
    resource_id = db.Column(db.String(36), db.ForeignKey('library.id'), nullable=False)
    date_emprunt = db.Column(db.DateTime, default=datetime.utcnow)
    date_retour = db.Column(db.DateTime)
    est_retourne = db.Column(db.Boolean, default=False)

    resource = db.relationship('Library', backref='emprunts')

    def save(self):
        if not self.date_retour:
            self.date_retour = datetime.utcnow() + timedelta(days=15)
        db.session.add(self)
        db.session.commit()

    @property
    def est_en_retard(self):
        return not self.est_retourne and datetime.utcnow() > self.date_retour

class StripeCustomer(db.Model):
    __tablename__ = 'stripe_customer'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), nullable=False, unique=True)
    customer_id = db.Column(db.String(255), unique=True, nullable=False)
    subscription_id = db.Column(db.String(255), nullable=True)

    def __repr__(self):
        return f"<StripeCustomer {self.user_id}>"

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from app.config import Config


db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)

    # Register blueprints
    from app.routes.library import library_bp
    from app.routes.borrow import borrow_bp
    from app.routes.history import history_bp
    app.register_blueprint(library_bp)
    app.register_blueprint(borrow_bp)
    app.register_blueprint(history_bp)
    
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    from app.routes.subscriptions import subscriptions_bp
    app.register_blueprint(subscriptions_bp)

    from app.routes.paypal import paypal_bp
    from app.routes.paypal_webhook import paypal_webhook_bp

    app.register_blueprint(paypal_bp)
    app.register_blueprint(paypal_webhook_bp)


    from app.routes.chatbot import chatbot_bp
    app.register_blueprint(chatbot_bp)


    return app

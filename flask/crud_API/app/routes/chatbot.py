from flask import Blueprint, request, jsonify
from app.chatbot_engine import ask_chatbot  # assure-toi d'importer ton moteur

chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/chatbot')

@chatbot_bp.route('/', methods=['POST'])
def chatbot_endpoint():
    try:
        data = request.get_json()
        user_message = data.get("message", "")
        chat_history = data.get("history", [])

        if not user_message:
            return jsonify({"error": "Message requis"}), 400

        response = ask_chatbot(user_message, chat_history)
        return jsonify({"response": response}), 200
    except Exception as e:
        print("Erreur Chatbot:", str(e))
        return jsonify({"error": str(e)}), 500

from chatbot_engine import ask_chatbot

history = [
    {"role": "user", "content": "bonjour"},
    {"role": "assistant", "content": "Salut, comment puis-je vous aider ?"},
    {"role": "user", "content": "quels livres sont disponibles ?"},
]

response = ask_chatbot("et les documents ?", history)
print("Réponse:", response)

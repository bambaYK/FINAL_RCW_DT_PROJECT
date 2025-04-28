from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from chatbot_engine import ask_chatbot

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chatbot/")
async def chatbot_endpoint(req: Request):
    try:
        data = await req.json()
        user_message = data.get("message")
        chat_history = data.get("history", [])
        print("==> Reçu:", data)

        response = ask_chatbot(user_message, chat_history)
        print("==> Réponse GPT:", response)  # 🔍 ajoute ceci

        return {"response": response}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from typing import List, Dict
import json
from pathlib import Path

# Clé OpenAI définie manuellement
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Chargement de la base de connaissances enrichie depuis library_knowledge_enriched.json
knowledge_path = Path(__file__).resolve().parent / "library_knowledge_enriched.json"
with open(knowledge_path, encoding="utf-8") as f:
    site_knowledge = json.load(f)

llm = ChatOpenAI(model="gpt-4o", temperature=0.7, max_tokens=2500)

prompt = ChatPromptTemplate.from_template("""
You are a helpful assistant. Answer the user's question using the provided knowledge and chat history.

Knowledge:
{knowledge}

Chat history:
{chat_history}

User question:
{user_question}
""")

chain = prompt | llm | StrOutputParser()

def ask_chatbot(user_question: str, chat_history: List[Dict[str, str]] = []) -> str:
    formatted_history = "\n".join([
        f"User: {msg['content']}" if msg['role'] == 'user' else f"Assistant: {msg['content']}"
        for msg in chat_history if msg['content'] != "Erreur : le chatbot ne peut pas répondre pour l’instant."
    ])

    # Rechercher une correspondance dans la base de connaissances enrichie
    matched = next((entry for entry in site_knowledge if user_question.lower() in entry['question'].lower()), None)
    knowledge_text = matched['answer'] if matched else "(no direct knowledge match)"

    response = chain.invoke({
        "knowledge": knowledge_text,
        "chat_history": formatted_history,
        "user_question": user_question
    })
    return response

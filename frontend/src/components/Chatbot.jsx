import { useState, useEffect } from "react";
import axios from "axios";
import { Bot, User, MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Chatbot() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatMessages");
    return saved ? JSON.parse(saved) : [];
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const userMessage = { from: "user", text: message, role: "user", content: message };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/chatbot/", {
        message,
        history: updatedMessages.map((msg) => ({
          role: msg.from === "user" ? "user" : "assistant",
          content: msg.text
        }))
      });

      const text = res.data?.response || "⚠️ Réponse vide ou inattendue.";
      const botMessage = { from: "bot", text, role: "assistant", content: text };
      setMessages([...updatedMessages, botMessage]);
      if (!isOpen) setHasNewMessage(true);
    } catch (error) {
      console.error("Erreur chatbot:", error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Erreur : le chatbot ne peut pas répondre pour l’instant." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    setHasNewMessage(false);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all relative"
      >
        <MessageCircle className="w-6 h-6" />
        {hasNewMessage && (
          <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-40 w-[360px] max-h-[80vh] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 flex flex-col"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-center text-lg font-semibold text-blue-700">
                Assistant Bibliothèque 📚
              </div>
              <button onClick={closeChat} className="text-gray-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 rounded-xl px-3 py-2 mb-3 space-y-3 shadow-inner">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex items-start gap-2 max-w-[90%]">
                    {msg.from === "bot" && <Bot className="mt-1 text-green-600 w-5 h-5" />}
                    <div
                      className={`px-3 py-2 rounded-xl text-sm ${
                        msg.from === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-green-100 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.from === "user" && <User className="mt-1 text-blue-600 w-5 h-5" />}
                  </div>
                </div>
              ))}
              {loading && (
                <p className="text-center italic text-gray-500">🤖 Le bot réfléchit...</p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                className="input-field flex-1 text-sm"
                placeholder="Pose ta question ici..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className="btn-primary text-sm px-3" onClick={sendMessage}>
                Envoyer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Chatbot;

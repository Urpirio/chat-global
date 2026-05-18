"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import io, { Socket } from "socket.io-client";

// Apuntamos al backend en el mismo servidor pero usando el subdominio con wss para tiempo real
// const socket: Socket = io("wss://test.urpiriodev.com.do", { transports: ["websocket", "polling"] });

export default function GlobalChat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [nickname, setNickname] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState<{ user: string; text: string; time: string }[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inicializar socket solo en el cliente
    const newSocket = io("wss://test.urpiriodev.com.do", { transports: ["websocket", "polling"] });
    setSocket(newSocket);

    newSocket.on("history", (history: any[]) => {
      setMessages(history);
    });

    newSocket.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) setIsJoined(true);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socket) {
      const newMsg = {
        user: nickname,
        text: input.trim(),
        time: new Date().toISOString(),
      };
      socket.emit("chat message", newMsg);
      setInput("");
    }
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-sans p-4">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
          <h1 className="text-3xl font-bold mb-2 text-center text-blue-400">Chat Global</h1>
          <p className="text-gray-400 text-center mb-8">Únete a la conversación en tiempo real.</p>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="Elige un nickname..."
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Entrar al Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white font-sans">
      <header className="bg-gray-800 border-b border-gray-700 p-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-blue-400">Chat Global</h1>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse"></span>
            Conectado
          </p>
        </div>
        <div className="text-sm bg-gray-700 px-3 py-1 rounded-full text-gray-300">
          👤 {nickname}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.user === nickname;
          const timeStr = new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          return (
            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {!isMe && <span className="text-xs text-gray-400 ml-1 mb-1">{msg.user}</span>}
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700'}`}>
                <p className="break-words">{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-500'}`}>{timeStr}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-gray-800 p-4 border-t border-gray-700">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-full pl-4 pr-12 py-3 focus:outline-none focus:border-blue-500 transition-all"
            placeholder="Escribe un mensaje..."
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
          >
            <Send size={18} />
          </button>
        </form>
      </footer>
    </div>
  );
}

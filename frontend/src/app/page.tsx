"use client";

import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { Send, User, MessageCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  user: string;
  text: string;
  time: string | Date;
}

export default function ChatGlobal() {
  const [nickname, setNickname] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isJoined) {
      const newSocket = io('http://localhost:3000');
      setSocket(newSocket);

      newSocket.on('history', (history: ChatMessage[]) => {
        setMessages(history);
      });

      newSocket.on('chat message', (msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isJoined]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      setIsJoined(true);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim() && socket) {
      const msgData: ChatMessage = {
        user: nickname,
        text: currentMessage,
        time: new Date(),
      };
      socket.emit('chat message', msgData);
      setCurrentMessage('');
    }
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl max-w-md w-full backdrop-blur-sm bg-opacity-90"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-500/20 p-4 rounded-full border border-indigo-500/30">
              <MessageCircle className="w-10 h-10 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-white mb-2">Global Chat</h1>
          <p className="text-neutral-400 text-center mb-8">Join the conversation with people worldwide</p>
          
          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-neutral-300 mb-2">
                Choose your nickname
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="text"
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-neutral-700 rounded-xl leading-5 bg-neutral-950 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="e.g. Neo"
                  required
                  autoFocus
                  maxLength={20}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-neutral-900 transition-all active:scale-[0.98]"
            >
              Join Room
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <header className="bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
              <MessageCircle className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Global Chat</h1>
          </div>
          <div className="flex items-center gap-2 bg-neutral-800 px-3 py-1.5 rounded-full border border-neutral-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium text-neutral-300">Connected as <span className="text-indigo-400">{nickname}</span></span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          <AnimatePresence>
            {messages.map((msg, idx) => {
              const isMe = msg.user === nickname;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-medium text-neutral-400">{isMe ? 'You' : msg.user}</span>
                      <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div 
                      className={`px-4 py-2.5 rounded-2xl ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-tl-none'
                      } shadow-md`}
                    >
                      <p className="text-sm md:text-base break-words">{msg.text}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-neutral-900 border-t border-neutral-800 p-4 sticky bottom-0">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              autoFocus
            />
            <button
              type="submit"
              disabled={!currentMessage.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl px-6 py-3 font-medium flex items-center gap-2 transition-all active:scale-[0.98] disabled:active:scale-100"
            >
              <span className="hidden sm:inline">Send</span>
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}

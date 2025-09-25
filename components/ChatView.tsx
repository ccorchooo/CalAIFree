import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { BackIcon, SendIcon } from './Icons';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onBack: () => void;
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-1.5">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
  </div>
);

export const ChatView: React.FC<ChatViewProps> = ({ messages, onSendMessage, isLoading, onBack }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 fixed inset-0">
      <header className="w-full text-center p-4 bg-gray-50 sticky top-0 z-20 flex items-center justify-between border-b border-gray-200">
        <button
          onClick={onBack}
          className="text-gray-800 p-2 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Back to dashboard"
        >
          <BackIcon />
        </button>
        <h2 className="text-lg font-bold text-gray-900">AI Assistant</h2>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 mt-8">
                <p className="font-semibold">Hello! 👋</p>
                <p>Ask me anything about your diet, recipes, or health!</p>
            </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-gray-900 text-white rounded-br-lg'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-lg'
              }`}
            >
              {msg.content}
              {isLoading && index === messages.length - 1 && msg.role === 'model' && (
                <div className="py-2"><TypingIndicator /></div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-4 bg-gray-50 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-grow bg-white border border-gray-300 rounded-full px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg transform active:scale-95 transition-transform disabled:bg-gray-300 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </form>
      </footer>
    </div>
  );
};
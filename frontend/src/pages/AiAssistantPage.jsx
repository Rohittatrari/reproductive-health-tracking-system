import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Trash2,
  Sparkles,
  ShieldAlert,
  User,
  Heart
} from 'lucide-react';
import { api } from '../api';

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const starterQuestions = [
    'Why do I get painful cramps on day 1?',
    'How do I calculate my fertile window?',
    'What are the common symptoms of PCOS?',
    'What are the 4 phases of the menstrual cycle?',
    'Safe tampon and menstrual cup usage guidelines'
  ];

  const loadHistory = async () => {
    try {
      const history = await api.getAssistantHistory();
      if (history.length > 0) {
        setMessages(history);
      } else {
        // Welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            message:
              "Hello! 🌸 I am your Reproductive Health Educational Assistant. I can help explain cycle phases, symptoms, fertility awareness concepts, and hygiene safety. How can I help you today?",
            disclaimer_included: true,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      message: text,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const resp = await api.sendAssistantMessage(text);
      setMessages((prev) => [...prev, resp]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          message: `I encountered an error processing your query: ${err.message}. Please try again.`,
          disclaimer_included: true,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Clear conversation history?')) {
      try {
        await api.clearAssistantHistory();
        setMessages([
          {
            id: 'welcome-cleared',
            role: 'assistant',
            message: "Conversation history cleared. Feel free to ask a new question! 🌸",
            disclaimer_included: true,
            timestamp: new Date().toISOString()
          }
        ]);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-purple-200">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-purple-950 flex items-center gap-2">
              <span>AI Reproductive Health Assistant</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                Educational
              </span>
            </h2>
            <p className="text-xs text-purple-500">
              Verified clinical guidance for menstrual cycles, PMS, and fertility
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="p-2 text-purple-400 hover:text-red-600 hover:bg-purple-50 rounded-xl transition-colors"
          title="Clear History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Medical Safety Disclaimer Pill */}
      <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 flex items-center gap-3 text-xs text-purple-800">
        <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0" />
        <p>
          This assistant provides educational explanations only. It does not diagnose medical conditions or prescribe medications. Consult a physician for clinical concerns.
        </p>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs min-h-[50vh] max-h-[60vh] overflow-y-auto flex flex-col space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse self-end max-w-xl' : 'self-start max-w-2xl'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-purple-600 text-white font-bold text-xs'
                    : 'bg-pink-100 text-pink-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  isUser
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-purple-50/70 text-purple-950 border border-purple-100 rounded-tl-none'
                }`}
              >
                {m.message}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-purple-500 italic p-3 self-start bg-purple-50 rounded-2xl">
            <Sparkles className="w-4 h-4 animate-spin text-purple-600" />
            <span>Consulting educational knowledge base...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Question Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-purple-400 whitespace-nowrap">Suggested:</span>
        {starterQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-xl bg-white border border-purple-100 text-[11px] font-medium text-purple-900 hover:bg-purple-50 hover:border-purple-200 whitespace-nowrap shadow-2xs transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-purple-200 shadow-sm focus-within:ring-2 focus-within:ring-purple-400"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your cycle, symptoms, or reproductive health..."
          className="flex-1 px-4 py-2 text-sm text-purple-950 focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

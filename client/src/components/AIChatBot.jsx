import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { api } from '../api';

const AIChatBot = ({ patientId, patientName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);


  useEffect(() => {
    if (patientId) {
      setIsOpen(true); 
      const fetchHistory = async () => {
        try {
          const res = await api.get(`/chat/history/${patientId}`);
          const history = res.data.history || [];
          setMessages(history);

       
          if (history.length === 0) {
            handleAutoResponse();
          }
        } catch (err) {
          console.error("HISTORY_LOAD_ERROR", err);
        }
      };
      fetchHistory();
    }
  }, [patientId]);

  const handleAutoResponse = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/chat/add', { 
        patientId, 
        message: "SYSTEM_INIT: SUMMARIZE PATIENT PROFILE" 
      });
      setMessages([res.data]);
    } catch (err) {
      setMessages([{ role: 'assistant', content: "OOPS! COULD NOT LOAD PROFILE." }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !patientId) return;

    const userMsg = { role: 'user', content: input.toUpperCase() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/chat/add', { patientId, message: input });
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "OOPS! SOMETHING WENT WRONG." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] font-sans">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl"><Bot size={20} /></div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest">ASSISTANT</h3>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">
                  {patientId ? `REF: ${patientName}` : "AWAITING SELECTION"}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>

          <div className="h-80 bg-gray-50/50 p-6 overflow-y-auto flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[85%] text-xs font-bold uppercase shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-gray-100 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="animate-spin text-blue-600" size={14} />
                  <span className="text-[10px] font-black text-blue-600 uppercase">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
            <input 
              type="text" 
              placeholder="ASK ABOUT PATIENT..."
              className="flex-1 bg-gray-50 border rounded-xl px-4 py-2 text-xs font-bold uppercase outline-none focus:border-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!patientId || isLoading}
            />
            <button type="submit" disabled={!patientId || isLoading} className="bg-blue-600 text-white p-2 rounded-xl">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <button onClick={() => setIsOpen(!isOpen)} className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl bg-blue-600">
        <MessageSquare className="text-white" size={28} />
      </button>
    </div>
  );
};

export default AIChatBot;
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, HelpCircle, X, ChevronRight } from 'lucide-react';

export default function TaxAIHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hey! Need help figuring out your Tax Identification Number (TIN)? Just tell me your country.' }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setQuery('');

    // Simulate AI response based on country keywords
    setTimeout(() => {
      let reply = "I'm not perfectly sure about that country, but you usually need a national ID number or tax code.";
      const lowerQ = query.toLowerCase();
      
      if (lowerQ.includes('spain') || lowerQ.includes('españa')) {
        reply = "In Spain, your TIN is usually your DNI (for citizens) or NIE (for foreigners). If you have a registered company, it's your CIF.";
      } else if (lowerQ.includes('colombia')) {
        reply = "In Colombia, your TIN is your RUT (Registro Único Tributario) or your NIT if you are a company.";
      } else if (lowerQ.includes('us') || lowerQ.includes('united states') || lowerQ.includes('america')) {
        reply = "In the United States, your TIN is your Social Security Number (SSN) if you're an individual, or your Employer Identification Number (EIN) if you're an LLC.";
      } else if (lowerQ.includes('uk') || lowerQ.includes('united kingdom')) {
        reply = "In the UK, your TIN is your Unique Taxpayer Reference (UTR) or your National Insurance Number (NINO).";
      }

      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    }, 600);
  };

  return (
    <div className="relative mt-4">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl text-primary text-xs font-bold transition w-full justify-center"
        >
          <Bot className="w-4 h-4" /> Not sure what your TIN is? Ask our AI Helper
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-black/80 border border-primary/30 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(102,252,241,0.15)]"
        >
          <div className="flex items-center justify-between p-3 bg-primary/10 border-b border-primary/20">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Tax ID Helper</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 h-48 overflow-y-auto space-y-3 custom-scrollbar flex flex-col">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-white/10 text-white rounded-br-none' 
                    : 'bg-primary/10 text-primary border border-primary/20 rounded-bl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. I live in Colombia..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition"
            />
            <button type="submit" className="p-2 bg-primary text-black rounded-lg hover:bg-[#45f2e6] transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}

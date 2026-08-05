'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Smile, DollarSign, Loader2 } from 'lucide-react';
import TipModal from './TipModal';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

interface ChatWindowProps {
  conversationId: string;
  creatorName: string;
  creatorAvatar: string;
  currentUserId: string;
}

// Simulated data
const MOCK_MESSAGES: Message[] = [
  { id: 'm1', senderId: 'c1', text: 'Hey! Thanks for subscribing to my VIP tier! 🔥', timestamp: '10:00 AM' },
  { id: 'm2', senderId: 'u1', text: 'Of course! Loving the content so far.', timestamp: '10:02 AM' },
];

export default function ChatWindow({ conversationId, creatorName, creatorAvatar, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId, // 'u1' in our mock
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate creator reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'c1',
        text: 'That means a lot to me! Anything specific you want to see?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const handleTipSent = (amount: number) => {
    const systemMsg: Message = {
      id: Date.now().toString(),
      senderId: 'system',
      text: `You sent a tip of $${amount.toFixed(2)} to ${creatorName}! 🎉`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    };
    setMessages(prev => [...prev, systemMsg]);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* Header */}
      <div className="h-20 border-b border-white/10 bg-black/50 backdrop-blur-xl flex items-center px-6 z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20">
              <img src={creatorAvatar} alt={creatorName} className="w-full h-full object-cover" />
            </div>
            {/* Online Status Indicator */}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary rounded-full border-2 border-black" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">{creatorName}</h2>
            <p className="text-primary text-xs font-bold uppercase tracking-wider">Online Now</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="bg-primary/20 border border-primary/30 text-primary px-4 py-2 rounded-full text-xs font-bold">
                  {msg.text}
                </div>
              </div>
            );
          }

          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className="flex flex-col max-w-[70%]">
                <div 
                  className={`px-5 py-3 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-primary text-black rounded-br-sm' 
                      : 'bg-white/10 text-white rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className={`text-[10px] text-white/40 mt-1 font-bold ${isMe ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/50 backdrop-blur-xl border-t border-white/10 z-10">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          
          <button 
            type="button"
            onClick={() => setIsTipModalOpen(true)}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/20 hover:bg-primary/30 text-primary transition shrink-0 group relative"
          >
            <DollarSign className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-8 bg-black border border-white/10 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
              Send Tip
            </span>
          </button>

          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2 flex items-center focus-within:border-primary/50 transition">
            <button type="button" className="p-2 text-white/40 hover:text-white transition">
              <ImageIcon className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message..."
              className="flex-1 bg-transparent border-none text-white text-sm px-3 focus:outline-none focus:ring-0"
            />
            <button type="button" className="p-2 text-white/40 hover:text-white transition">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary text-black transition shrink-0 disabled:opacity-50 disabled:bg-white/10 disabled:text-white/40 hover:shadow-[0_0_15px_rgba(102,252,241,0.3)]"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>

      {/* Tip Modal */}
      <TipModal 
        isOpen={isTipModalOpen} 
        onClose={() => setIsTipModalOpen(false)} 
        creatorName={creatorName}
        onTipSent={handleTipSent}
      />
    </div>
  );
}

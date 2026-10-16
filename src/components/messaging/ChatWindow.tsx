'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Image as ImageIcon, Smile, DollarSign, Languages, Check, Loader2, Sparkles } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
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

// Simulated starting data
const MOCK_MESSAGES: Message[] = [
  { id: 'm1', senderId: 'c1', text: 'Hey! Thanks for subscribing to my VIP tier! 🔥', timestamp: '10:00 AM' },
  { id: 'm2', senderId: 'u1', text: 'Of course! Loving the content so far.', timestamp: '10:02 AM' },
];

export default function ChatWindow({ conversationId, creatorName, creatorAvatar, currentUserId }: ChatWindowProps) {
  const { t, locale } = useTranslation();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-translation state
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [translatedMap, setTranslatedMap] = useState<Record<string, { text: string; engine: string }>>({});
  const [translatingIds, setTranslatingIds] = useState<Record<string, boolean>>({});
  const [showOriginalIds, setShowOriginalIds] = useState<Record<string, boolean>>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, translatedMap]);

  // Translation handler function
  const handleTranslateMessage = useCallback(async (msgId: string, textToTranslate: string) => {
    if (translatingIds[msgId]) return;

    setTranslatingIds(prev => ({ ...prev, [msgId]: true }));
    try {
      const res = await fetch('/api/v2/translate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToTranslate,
          targetLanguage: locale || 'en'
        })
      });

      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();

      if (data?.translatedText) {
        setTranslatedMap(prev => ({
          ...prev,
          [msgId]: { text: data.translatedText, engine: data.engine || 'gemini' }
        }));
        // Ensure translated version is shown
        setShowOriginalIds(prev => ({ ...prev, [msgId]: false }));
      }
    } catch (err) {
      console.error('[ChatWindow] Error translating message:', err);
    } finally {
      setTranslatingIds(prev => ({ ...prev, [msgId]: false }));
    }
  }, [locale, translatingIds]);

  // Effect to automatically translate incoming non-self messages when autoTranslate is on
  useEffect(() => {
    if (!autoTranslate) return;

    messages.forEach((msg) => {
      if (msg.senderId !== currentUserId && !msg.isSystem && !translatedMap[msg.id] && !translatingIds[msg.id]) {
        handleTranslateMessage(msg.id, msg.text);
      }
    });
  }, [autoTranslate, messages, currentUserId, translatedMap, translatingIds, handleTranslateMessage]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate counter-party reply (in Spanish or English to demonstrate translation)
    setTimeout(() => {
      const sampleReplies = [
        '¡Muchísimas gracias por tu apoyo! ¿Qué tipo de contenido te gustaría ver hoy?',
        'I am preparing our next VIP exclusive drop right now. Stay tuned! ✨',
        'Me alegra que te guste. Recuerda que puedes enviarme sugerencias cuando quieras.'
      ];
      const randomReply = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];

      const reply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'c1',
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, reply]);
    }, 1800);
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
      <div className="h-20 border-b border-white/10 bg-black/50 backdrop-blur-xl flex items-center justify-between px-6 z-10">
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

        {/* Translation Controls in Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAutoTranslate(!autoTranslate)}
            title={t('chatTranslation.autoTranslateTooltip', 'Automatically translate incoming messages to your language')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
              autoTranslate
                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_rgba(102,252,241,0.25)]'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Languages className={`w-3.5 h-3.5 ${autoTranslate ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">
              {t('chatTranslation.autoTranslate', 'Auto-Translate')}
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
              {locale.toUpperCase()}
            </span>
          </button>
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
          const translation = translatedMap[msg.id];
          const isTranslating = !!translatingIds[msg.id];
          const isShowingOriginal = !!showOriginalIds[msg.id];
          const displayText = translation && !isShowingOriginal ? translation.text : msg.text;

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
              <div className="flex flex-col max-w-[75%] md:max-w-[70%]">
                <div 
                  className={`px-5 py-3 rounded-2xl text-sm transition-all duration-200 relative ${
                    isMe 
                      ? 'bg-primary text-black rounded-br-sm' 
                      : 'bg-white/10 text-white rounded-bl-sm border border-white/5'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{displayText}</p>

                  {/* AI Translation Indicator Badge */}
                  {translation && !isShowingOriginal && (
                    <div className="mt-2 pt-1.5 border-t border-black/10 flex items-center gap-1.5 text-[10px] font-mono opacity-70">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{t('chatTranslation.translatedBy', 'Translated via Gemini AI')}</span>
                    </div>
                  )}
                </div>

                <div className={`flex items-center gap-2 mt-1 text-[10px] text-white/40 font-bold ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.timestamp}</span>

                  {/* Per-message translate action pill for received messages */}
                  {!isMe && (
                    <div className="flex items-center gap-2">
                      <span className="text-white/20">•</span>
                      {isTranslating ? (
                        <span className="flex items-center gap-1 text-primary">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          <span>{t('chatTranslation.translating', 'Translating...')}</span>
                        </span>
                      ) : translation ? (
                        <button
                          type="button"
                          onClick={() => setShowOriginalIds(prev => ({ ...prev, [msg.id]: !isShowingOriginal }))}
                          className="hover:text-primary transition underline decoration-dotted"
                        >
                          {isShowingOriginal
                            ? t('chatTranslation.translate', 'Translate')
                            : t('chatTranslation.original', 'Show original')}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTranslateMessage(msg.id, msg.text)}
                          className="flex items-center gap-1 hover:text-primary transition"
                        >
                          <Languages className="w-2.5 h-2.5" />
                          <span>{t('chatTranslation.translate', 'Translate')}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
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

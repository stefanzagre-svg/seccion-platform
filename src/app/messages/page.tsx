'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, MoreVertical, ShieldAlert, Sparkles, Heart, MessageSquare, Activity, Brain, Lock, LockOpen, Flame, Eye, Trash2, FileText, X, AlertCircle, Loader2, Info, Paperclip, Download, Globe, Mic, Languages, Check, CreditCard, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  fetchMatches, 
  fetchMessages, 
  sendMessage, 
  getRelationshipState,
  sendSuggestionMove,
  respondToSuggestionMove,
  MatchInfo 
} from '@/lib/relationship-db';
import { 
  getDualGaugeState, 
  levelProgress,
  DualGaugeState,
  TENSION_DISPLAY
} from '@/lib/relationship-engine';
import SuggestionMovesModal from '@/components/SuggestionMovesModal';
import BlurredFaceImage from '@/components/BlurredFaceImage';

interface ChatMessage {
  id: string;
  senderId: 'me' | 'them';
  text: string;
  timestamp: Date;
  is_suggestion?: boolean;
  suggestion_move_id?: string;
  suggestion_status?: 'pending' | 'accepted' | 'rejected';
  is_ai_generated?: boolean;
  is_ephemeral?: boolean;
  media_url?: string | null;
  media_type?: 'image' | 'video' | 'file' | null;
  media_name?: string | null;
  media_size?: string | null;
  ephemeral_viewed?: boolean;
  ephemeral_viewed_at?: Date | string | null;
  ephemeral_expires_at?: Date | string | null;
  screenshot_detected?: boolean;
}

interface EphemeralMediaBubbleProps {
  message: ChatMessage;
  isMe: boolean;
  onViewed: (msgId: string) => void;
  onScreenshotDetected: (msgId: string) => void;
}

function EphemeralMediaBubble({ message, isMe, onViewed, onScreenshotDetected }: EphemeralMediaBubbleProps) {
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      handleExpire();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft]);

  // Screen Capture & Focus Loss Blocking (Mobile Web browsers)
  useEffect(() => {
    const handleCaptureBlur = () => {
      if (revealed && !message.ephemeral_viewed) {
        // Trigger screenshot violation alert
        triggerLocalScreenshot();
        // Instantly cover content to block image capture
        setRevealed(false);
        setTimerActive(false);
      }
    };

    window.addEventListener('blur', handleCaptureBlur);
    document.addEventListener('visibilitychange', handleCaptureBlur);
    return () => {
      window.removeEventListener('blur', handleCaptureBlur);
      document.removeEventListener('visibilitychange', handleCaptureBlur);
    };
  }, [revealed, message.ephemeral_viewed]);

  const handleExpire = () => {
    setTimerActive(false);
    onViewed(message.id);
  };

  const triggerLocalScreenshot = () => {
    onScreenshotDetected(message.id);
  };

  // If viewed/expired
  if (message.ephemeral_viewed) {
    return (
      <div className="p-4 rounded-3xl border border-red-500/20 bg-red-950/10 flex items-center gap-3 max-w-sm text-red-400 text-left">
        <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black uppercase tracking-widest text-red-500">Expired Media</div>
          <div className="text-[10px] text-red-400/60 mt-0.5">Purged from server & session memory</div>
        </div>
      </div>
    );
  }

  if (!revealed) {
    return (
      <button
        type="button"
        onClick={() => {
          setRevealed(true);
          setTimerActive(true);
        }}
        className="p-4 rounded-3xl border border-dashed border-primary/30 hover:border-primary/60 bg-white/5 hover:bg-white/10 transition duration-300 flex items-center gap-3 max-w-sm text-white text-left group"
      >
        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition duration-300 shrink-0">
          <Lock className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1">
            Reveal View-Once Media <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
          </div>
          <div className="text-[10px] text-white/50 mt-0.5">
            Auto-purges 2 minutes after opening
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-[#181818] border border-white/5 rounded-3xl max-w-xs shadow-2xl text-left">
      <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/5">
        {message.media_type === 'image' && message.media_url && (
          <img
            src={message.media_url}
            alt="View once"
            className="w-full object-cover max-h-60 rounded-2xl"
          />
        )}
        {message.media_type === 'video' && message.media_url && (
          <video
            src={message.media_url}
            controls
            autoPlay
            className="w-full rounded-2xl max-h-60"
          />
        )}
        {message.media_type === 'file' && (
          <div className="p-4 flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-primary truncate">{message.media_name || 'attachment.bin'}</div>
              <div className="text-[9px] text-white/50 mt-0.5">{message.media_size || 'Unknown size'}</div>
            </div>
            {message.media_url && (
              <a
                href={message.media_url}
                download={message.media_name || 'file'}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition shrink-0"
                title="Download File"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Countdown timer & actions */}
      <div className="flex flex-col gap-2 mt-1">
        <div className="flex justify-between items-center text-[9px] uppercase font-black tracking-widest text-primary/80">
          <span className="flex items-center gap-1">⏱️ Countdown</span>
          <span>{timeLeft}s remaining</span>
        </div>
        <div className="h-1 bg-black/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 120) * 100}%` }}
          />
        </div>

        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={triggerLocalScreenshot}
            className="flex-1 py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-[8px] uppercase font-black tracking-widest flex items-center justify-center gap-1 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Screenshot
          </button>
          <button
            type="button"
            onClick={handleExpire}
            className="flex-1 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-[8px] uppercase font-black tracking-widest flex items-center justify-center gap-1 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatMessenger() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Suggestion Moves Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKycVerified, setIsKycVerified] = useState(false);

  // RLS State for the current conversation
  const [rlsState, setRlsState] = useState<DualGaugeState | null>(null);

  // AI Connection Diagnostics & Gravity States
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [relationshipRecord, setRelationshipRecord] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Ephemeral & File Selection State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isEphemeral, setIsEphemeral] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Translation states
  const [showTranslationPane, setShowTranslationPane] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [preAuthCardHoldActive, setPreAuthCardHoldActive] = useState(false);
  const [promoLink, setPromoLink] = useState('');
  const [isSubmittingPromo, setIsSubmittingPromo] = useState(false);
  const [promoMessage, setPromoMessage] = useState('');
  const [isS2stActive, setIsS2stActive] = useState(false);
  const [s2stTimeLeft, setS2stTimeLeft] = useState(300); // 5 min
  const [s2stLog, setS2stLog] = useState<string[]>([]);

  // Check auth session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        
        // Load Profile and Translation columns
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, is_kyc_verified, favorite_languages, text_translation_enabled, speech_translation_enabled, creator_ultimate_pack, creator_ultimate_pack_expires_at, promo_status, promo_creator_link')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setIsKycVerified(profile.is_kyc_verified || false);
          setProfileData(profile);
          // Set initial target language default
          if (profile.favorite_languages && profile.favorite_languages.length > 0) {
            const langMap: Record<string, string> = {
              English: 'en', Spanish: 'es', French: 'fr', German: 'de',
              Portuguese: 'pt', Italian: 'it', Japanese: 'ja'
            };
            const primaryLang = profile.favorite_languages[0];
            setTargetLanguage(langMap[primaryLang] || primaryLang.toLowerCase().substring(0, 2));
          }
        }

        // Load S2ST Quotas
        const { data: quota } = await supabase
          .from('translation_quotas')
          .select('*')
          .eq('profile_id', session.user.id)
          .single();
        if (quota) {
          setS2stTimeLeft(300 - (quota.speech_seconds_used_today || 0));
        }
      } else {
        router.push('/onboarding');
      }
    };
    checkSession();
  }, []);

  // Toggle body class for hiding bottom nav in chat on mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (mobileView === 'chat') {
        document.body.classList.add('mobile-chat-open');
      } else {
        document.body.classList.remove('mobile-chat-open');
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.body.classList.remove('mobile-chat-open');
      }
    };
  }, [mobileView]);


  const handleToggleTextTranslation = async (enabled: boolean) => {
    try {
      setProfileData((prev: any) => prev ? { ...prev, text_translation_enabled: enabled } : null);
      await supabase
        .from('profiles')
        .update({ text_translation_enabled: enabled })
        .eq('id', currentUser.id);
    } catch (err) {
      console.error('Failed to update text translation toggle:', err);
    }
  };

  const handleToggleSpeechTranslation = async (enabled: boolean) => {
    try {
      setProfileData((prev: any) => prev ? { ...prev, speech_translation_enabled: enabled } : null);
      await supabase
        .from('profiles')
        .update({ speech_translation_enabled: enabled })
        .eq('id', currentUser.id);
    } catch (err) {
      console.error('Failed to update speech translation toggle:', err);
    }
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoLink.trim()) return;
    setIsSubmittingPromo(true);
    setPromoMessage('');
    try {
      const res = await fetch('/api/v2/creator/promo-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ externalCreatorLink: promoLink })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit application');
      
      setProfileData((prev: any) => prev ? { ...prev, promo_creator_link: promoLink, promo_status: 'pending' } : null);
      setPromoMessage('✓ Application submitted successfully. Under review.');
    } catch (err: any) {
      setPromoMessage(`✕ Error: ${err.message}`);
    } finally {
      setIsSubmittingPromo(false);
    }
  };

  const handleSimulatePreAuth = () => {
    setPreAuthCardHoldActive(true);
    setS2stLog(l => [...l, 'Stripe Hold: Pre-authorized hold of €10.00 approved. Overage active.']);
  };

  const handleStartS2st = async () => {
    if (isS2stActive) {
      setIsS2stActive(false);
      setS2stLog(l => [...l, 'Speech Stream: Connection closed by user.']);
      return;
    }

    try {
      const res = await fetch('/api/v2/translate-speech/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preAuthCardHoldActive })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setS2stLog(l => [...l, `✕ Error: ${data.message}`]);
        alert(data.message);
        return;
      }

      setIsS2stActive(true);
      setS2stLog(l => [
        ...l,
        `Speech Stream: Connection authorized! Token: ${data.token.substring(0, 15)}...`,
        `Speech Stream: Connecting to ${data.url}...`,
        `Speech Stream: Live Voice Interpreter active. Target: ${targetLanguage.toUpperCase()}`
      ]);

      if (data.secondsUsed !== undefined) {
        setS2stTimeLeft(300 - data.secondsUsed);
      }
    } catch (err: any) {
      setS2stLog(l => [...l, `✕ Connection failed: ${err.message}`]);
    }
  };

  // S2ST speech interpretation active timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isS2stActive) {
      interval = setInterval(async () => {
        if (profileData?.role === 'creator') {
          // Creators have unlimited usage under ultimate pack/promo
          setS2stLog(prev => [...prev.slice(-3), "Speech Stream: Preserving voice prosody and pacing..."]);
          return;
        }

        setS2stTimeLeft((prev) => {
          if (prev > 0) {
            const nextVal = prev - 1;
            if (nextVal % 30 === 0 && nextVal > 0) {
              setS2stLog(l => [...l.slice(-3), `Speech Stream: ${Math.floor(nextVal / 60)}m ${nextVal % 60}s remaining in free quota`]);
            }
            return nextVal;
          } else {
            if (preAuthCardHoldActive) {
              setS2stLog(l => [...l.slice(-3), `Speech Stream (Overage Active): Billed at €0.10/min...`]);
              return prev - 1;
            } else {
              setIsS2stActive(false);
              setS2stLog(l => [...l, `Speech Stream: Terminated. Free 5-min limit reached.`]);
              return 0;
            }
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isS2stActive, preAuthCardHoldActive, profileData]);

  // Translate incoming messages in real-time
  useEffect(() => {
    if (!profileData?.text_translation_enabled || messages.length === 0) return;

    const translateIncoming = async () => {
      const untranslated = messages.filter(
        (m) => m.senderId === 'them' && !translatedMessages[m.id] && m.text && !m.is_suggestion
      );

      if (untranslated.length === 0) return;

      for (const msg of untranslated) {
        try {
          const res = await fetch('/api/v2/translate-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: msg.text,
              targetLanguage: targetLanguage
            })
          });
          if (res.ok) {
            const data = await res.json();
            setTranslatedMessages(prev => ({
              ...prev,
              [msg.id]: data.translatedText
            }));
          }
        } catch (err) {
          console.warn('[Translate Client] Failed to translate message:', msg.id, err);
        }
      }
    };

    translateIncoming();
  }, [messages, profileData?.text_translation_enabled, targetLanguage]);

  // Fetch matches list once user is loaded
  useEffect(() => {
    if (!currentUser) return;

    const loadMatches = async () => {
      const data = await fetchMatches(currentUser.id);
      setMatches(data);
      if (data.length > 0) {
        const params = new URLSearchParams(window.location.search);
        const matchId = params.get('id');
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        
        if (matchId) {
          const found = data.find(m => m.target_profile.id === matchId);
          if (found) {
            setSelectedMatch(found);
            setMobileView('chat');
          }
        } else if (!isMobile) {
          setSelectedMatch(data[0]);
        }
      }
      setLoading(false);
    };

    loadMatches();
  }, [currentUser]);

  // Load RLS gauge details
  const loadRls = async () => {
    if (!currentUser || !selectedMatch) return;
    const rls = await getRelationshipState(currentUser.id, selectedMatch.target_profile.id);
    const computed = getDualGaugeState(rls.myScore, rls.theirScore);
    setRlsState(computed);
    setRelationshipRecord(rls.myRel || null);
  };

  // Trigger Google Gemini Gravity and Traits Diagnostics
  const handleAnalyzeGravity = async () => {
    if (!currentUser || !selectedMatch) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await fetch('/api/v2/messages/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          targetId: selectedMatch.target_profile.id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze conversation');
      
      // Reload relationship state and details
      await loadRls();
      
      // Inject system message alert into local chat to notify user
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-gravity-${Date.now()}`,
          senderId: 'them',
          text: `📊 AI Diagnostics Sync: Conversation Gravity is ${data.conversationGravity > 0 ? '+' : ''}${data.conversationGravity}. Extracted traits: ${data.extractedTraits.join(', ')}.`,
          timestamp: new Date()
        }
      ]);
    } catch (err: any) {
      console.error('Failed to run gravity diagnostics:', err);
      setAnalysisError(err.message || 'Diagnostics failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load message history and setup subscription when selected match changes
  useEffect(() => {
    if (!currentUser || !selectedMatch) return;

    const targetId = selectedMatch.target_profile.id;

    // Load static history
    const loadHistory = async () => {
      const history = await fetchMessages(currentUser.id, targetId);
      const formatted = history.map((m: any) => ({
        id: m.id,
        senderId: (m.sender_id === currentUser.id ? 'me' : 'them') as 'me' | 'them',
        text: m.text,
        timestamp: new Date(m.created_at),
        is_suggestion: m.is_suggestion,
        suggestion_move_id: m.suggestion_move_id,
        suggestion_status: m.suggestion_status,
        is_ai_generated: m.is_ai_generated,
        is_ephemeral: m.is_ephemeral,
        media_url: m.media_url,
        media_type: m.media_type,
        media_name: m.media_name,
        media_size: m.media_size,
        ephemeral_viewed: m.ephemeral_viewed,
        ephemeral_viewed_at: m.ephemeral_viewed_at,
        ephemeral_expires_at: m.ephemeral_expires_at,
        screenshot_detected: m.screenshot_detected
      }));
      setMessages(formatted);
    };

    loadHistory();
    loadRls();

    // Subscribe to new messages & updates
    const channel = supabase
      .channel(`chat_${currentUser.id}_${targetId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Insert, Update, etc.
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new;
            if (
              (newMsg.sender_id === currentUser.id && newMsg.receiver_id === targetId) ||
              (newMsg.sender_id === targetId && newMsg.receiver_id === currentUser.id)
            ) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [
                  ...prev,
                  {
                    id: newMsg.id,
                    senderId: newMsg.sender_id === currentUser.id ? 'me' : 'them',
                    text: newMsg.text,
                    timestamp: new Date(newMsg.created_at),
                    is_suggestion: newMsg.is_suggestion,
                    suggestion_move_id: newMsg.suggestion_move_id,
                    suggestion_status: newMsg.suggestion_status,
                    is_ai_generated: newMsg.is_ai_generated,
                    is_ephemeral: newMsg.is_ephemeral,
                    media_url: newMsg.media_url,
                    media_type: newMsg.media_type,
                    media_name: newMsg.media_name,
                    media_size: newMsg.media_size,
                    ephemeral_viewed: newMsg.ephemeral_viewed,
                    ephemeral_viewed_at: newMsg.ephemeral_viewed_at,
                    ephemeral_expires_at: newMsg.ephemeral_expires_at,
                    screenshot_detected: newMsg.screenshot_detected
                  }
                ];
              });
              loadRls();
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new;
            if (
              (updatedMsg.sender_id === currentUser.id && updatedMsg.receiver_id === targetId) ||
              (updatedMsg.sender_id === targetId && updatedMsg.receiver_id === currentUser.id)
            ) {
              setMessages((prev) => 
                prev.map((msg) => 
                  msg.id === updatedMsg.id 
                    ? { 
                        ...msg, 
                        suggestion_status: updatedMsg.suggestion_status,
                        ephemeral_viewed: updatedMsg.ephemeral_viewed,
                        ephemeral_viewed_at: updatedMsg.ephemeral_viewed_at,
                        ephemeral_expires_at: updatedMsg.ephemeral_expires_at,
                        screenshot_detected: updatedMsg.screenshot_detected
                      } 
                    : msg
                )
              );
              loadRls();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedMatch, currentUser]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Determine media type and preview URL
    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else if (file.type.startsWith('video/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleViewEphemeral = async (msgId: string) => {
    try {
      const res = await fetch('/api/messages/view-ephemeral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: msgId })
      });
      if (!res.ok) throw new Error('Failed to purge ephemeral media');
      
      // Update local state instantly
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, ephemeral_viewed: true, ephemeral_viewed_at: new Date() }
            : m
        )
      );
    } catch (err) {
      console.error('Error viewing/purging ephemeral message:', err);
    }
  };

  const handleScreenshotDetected = async (msgId: string) => {
    try {
      // 1. Update database status using direct client (best effort)
      await supabase
        .from('messages')
        .update({ screenshot_detected: true })
        .eq('id', msgId);
        
      // 2. Update local state
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, screenshot_detected: true }
            : m
        )
      );

      // 3. Inject system alert message notifying the channel
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-screenshot-${Date.now()}`,
          senderId: 'them',
          text: `⚠️ Security Violation: A screenshot of the view-once media was detected.`,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      console.error('Error marking screenshot detection:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !currentUser || !selectedMatch) return;

    const targetId = selectedMatch.target_profile.id;
    const textToSend = newMessage;
    setNewMessage('');

    setIsUploading(true);

    try {
      let ephemeralData = undefined;

      if (selectedFile) {
        // 1. Upload to Supabase Storage messages_media bucket
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        let mediaUrl = '';
        let mediaType: 'image' | 'video' | 'file' = 'file';
        if (selectedFile.type.startsWith('image/')) mediaType = 'image';
        else if (selectedFile.type.startsWith('video/')) mediaType = 'video';

        try {
          const { data, error: uploadError } = await supabase.storage
            .from('messages_media')
            .upload(filePath, selectedFile, {
              cacheControl: 'no-store, no-cache, must-revalidate',
              upsert: true
            });

          if (uploadError) {
            console.error('Storage upload error, falling back to local simulation:', uploadError.message);
            // Fallback for sandbox: use Object URL or local simulation path
            mediaUrl = filePreview || `https://sfthjyawyxjlbyszjkiu.supabase.co/storage/v1/object/public/messages_media/${filePath}`;
          } else if (data) {
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('messages_media')
              .getPublicUrl(filePath);
            mediaUrl = publicUrl;
          }
        } catch (uploadException) {
          console.error('Failed to upload file, using object URL fallback:', uploadException);
          mediaUrl = filePreview || '';
        }

        ephemeralData = {
          is_ephemeral: isEphemeral,
          media_url: mediaUrl,
          media_type: mediaType,
          media_name: selectedFile.name,
          media_size: `${(selectedFile.size / 1024).toFixed(1)} KB`
        };

        // Reset file selection state
        handleClearFile();
      }

      // Send message
      const { newScore } = await sendMessage(currentUser.id, targetId, textToSend, ephemeralData);

      // Refresh RLS gauge instantly in local UI
      if (rlsState) {
        const computed = getDualGaugeState(newScore, rlsState.theirScore);
        setRlsState(computed);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendSuggestion = async (moveId: string, label: string) => {
    if (!currentUser || !selectedMatch) return;

    const targetId = selectedMatch.target_profile.id;
    try {
      await sendSuggestionMove(currentUser.id, targetId, moveId, label);
    } catch (err) {
      console.error('Error proposing suggestion:', err);
    }
  };

  const handleRespondSuggestion = async (msgId: string, senderId: string, receiverId: string, status: 'accepted' | 'rejected') => {
    try {
      await respondToSuggestionMove(msgId, senderId, receiverId, status);
      
      // Update local state instantly
      setMessages((prev) => 
        prev.map((m) => m.id === msgId ? { ...m, suggestion_status: status } : m)
      );

      // Reload RLS Gauge
      loadRls();
    } catch (err) {
      console.error('Error updating suggestion status:', err);
    }
  };

  const tensionInfo = rlsState ? TENSION_DISPLAY[rlsState.tension] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent text-white">
        <Sparkles className="w-8 h-8 animate-spin text-primary mr-2" />
        <span className="font-semibold">Loading your connections...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-transparent text-foreground overflow-hidden">
      
      {/* ─── Sidebar: Matches List ─────────────────────────────────────────── */}
      <aside className={`w-full md:w-80 border-r border-white/5 bg-[#0a0a0a] flex flex-col shrink-0 h-full ${
        mobileView === 'chat' ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Feed
          </button>
          <span className="text-xs font-black text-primary tracking-widest uppercase">My Matches</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {matches.length > 0 ? (
            matches.map((m) => {
              const isSelected = selectedMatch?.relationship_id === m.relationship_id;
              return (
                <button
                  key={m.relationship_id}
                  onClick={() => {
                    setSelectedMatch(m);
                    setMobileView('chat');
                    const newUrl = `${window.location.pathname}?id=${m.target_profile.id}`;
                    window.history.pushState(null, '', newUrl);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition text-left ${
                    isSelected 
                    ? 'bg-primary/10 border border-primary/20 text-white' 
                    : 'bg-transparent border border-transparent hover:bg-white/5 text-white/70'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shadow relative">
                    <BlurredFaceImage
                      src={m.target_profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'}
                      alt={m.target_profile.display_name}
                      sharedScore={m.gauge_score ?? 0}
                      isEnabledByOwner={m.target_profile.face_blur_active || false}
                      faceCoordinates={m.target_profile.avatar_face_coordinates}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{m.target_profile.display_name || m.target_profile.username}</div>
                    <div className="text-[10px] uppercase font-black tracking-widest text-primary/80 mt-0.5">{m.current_level}</div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground h-64 text-center px-4">
              <MessageSquare className="w-8 h-8 opacity-30 mb-2" />
              <p className="text-xs">No active matches yet. Swipe on the feed to find a match!</p>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Main Chat Window ─────────────────────────────────────────────── */}
      <main className={`flex-1 flex flex-col h-full bg-transparent relative ${
        mobileView === 'list' ? 'hidden md:flex' : 'flex'
      }`}>
        {selectedMatch ? (
          <>
            {/* Header & RLS HUD */}
            <header className="glass border-b border-white/5 px-6 py-4 sticky top-0 z-40">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button 
                    onClick={() => {
                      setMobileView('list');
                      window.history.pushState(null, '', window.location.pathname);
                    }}
                    className="flex md:hidden p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition mr-1"
                    title="Back to matches list"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shadow relative">
                    <BlurredFaceImage
                      src={selectedMatch.target_profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'}
                      alt="Avatar"
                      sharedScore={selectedMatch.gauge_score ?? 0}
                      isEnabledByOwner={selectedMatch.target_profile.face_blur_active || false}
                      faceCoordinates={selectedMatch.target_profile.avatar_face_coordinates}
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <h1 className="font-bold text-md text-white">{selectedMatch.target_profile.display_name || selectedMatch.target_profile.username}</h1>
                    <span className="text-[10px] font-black uppercase tracking-widest text-success flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Globe Translation Button */}
                  <button 
                    onClick={() => {
                      setShowTranslationPane(!showTranslationPane);
                      setShowDiagnostics(false);
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition relative ${
                      showTranslationPane ? 'bg-primary text-black shadow-[0_0_15px_rgba(102,252,241,0.5)] font-bold scale-105 border border-primary/20' : 'bg-white/5 hover:bg-white/10 text-white/75 hover:text-white border border-white/5'
                    }`}
                    title="Translation Settings"
                  >
                    <Globe className="w-5 h-5" />
                    {(profileData?.text_translation_enabled || profileData?.speech_translation_enabled) && (
                      <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-black" />
                    )}
                  </button>

                  <button 
                    onClick={() => {
                      setShowDiagnostics(!showDiagnostics);
                      setShowTranslationPane(false);
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition relative ${
                      showDiagnostics ? 'bg-primary text-black shadow-[0_0_15px_rgba(102,252,241,0.5)] font-bold scale-105 border border-primary/20' : 'bg-white/5 hover:bg-white/10 text-white/75 hover:text-white border border-white/5'
                    }`}
                    title="AI Connection Diagnostics"
                  >
                    <Activity className="w-5 h-5" />
                    {relationshipRecord?.gravity_score !== undefined && relationshipRecord?.gravity_score !== 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white ring-2 ring-black">
                        {relationshipRecord.gravity_score > 0 ? '+' : ''}{relationshipRecord.gravity_score}
                      </span>
                    )}
                  </button>

                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition border border-white/5">
                    <MoreVertical className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Dynamic RLS Gauge Display */}
              {rlsState && tensionInfo && (
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1" style={{ color: rlsState.level.color }}>
                      <Heart className="w-3 h-3 fill-current" />
                      {rlsState.level.label}
                    </div>
                    <div className="flex items-center gap-1" style={{ color: tensionInfo.color }}>
                      {tensionInfo.label} {tensionInfo.emoji}
                    </div>
                  </div>
                  
                  {/* Gauge Bar */}
                  <div className="h-1.5 bg-black/50 rounded-full overflow-hidden relative">
                    <motion.div 
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        backgroundColor: rlsState.level.color,
                        width: `${levelProgress(rlsState.sharedScore)}%`,
                        boxShadow: `0 0 10px ${rlsState.level.color}`
                      }}
                    />
                  </div>
                  <div className="text-right text-[8px] text-white/40 uppercase tracking-widest">
                    Shared Harmonics: {rlsState.sharedScore.toFixed(0)}% (My Invest: {rlsState.myScore.toFixed(0)})
                  </div>
                </div>
              )}
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-28">
              {/* S2ST Floating Translator HUD */}
              {isS2stActive && (
                <div className="sticky top-4 z-30 mx-auto max-w-sm p-4 bg-[#0F0F1A]/95 border border-[#00fbfb]/30 rounded-3xl shadow-[0_20px_40px_rgba(0,251,251,0.15)] backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 animate-pulse text-red-500" /> S2ST Interpreter Active
                    </span>
                    <span className="text-[9px] font-mono text-white/50 uppercase">
                      Target: {targetLanguage.toUpperCase()}
                    </span>
                  </div>
                  {/* Waveform Animation (Simulated) */}
                  <div className="flex justify-center items-center gap-1 h-8 mb-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ height: [4, 24, 4] }}
                        transition={{ repeat: Infinity, duration: 0.6 + i*0.05, ease: "easeInOut" }}
                        className="w-0.5 bg-[#00fbfb] rounded-full"
                      />
                    ))}
                  </div>
                  {/* Speech Log Console */}
                  <div className="bg-black/60 rounded-2xl p-3 border border-white/5 text-left h-20 overflow-y-auto font-mono text-[8px] text-white/70 space-y-1 select-none">
                    {s2stLog.map((log, idx) => (
                      <p key={idx} className="leading-relaxed border-l-2 border-primary pl-1.5">{log}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="w-full flex justify-center my-4">
                <div className="glass-card px-6 py-2 rounded-full border border-primary/20 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/80 text-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Match Forged • Core Passions Aligned
                </div>
              </div>

              {messages.map((msg) => {
                const isMe = msg.senderId === 'me';
                const senderId = isMe ? currentUser.id : selectedMatch.target_profile.id;
                const receiverId = isMe ? selectedMatch.target_profile.id : currentUser.id;

                if (msg.is_suggestion) {
                  const status = msg.suggestion_status || 'pending';
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id}
                      className="w-full flex justify-center my-6"
                    >
                      <div className="max-w-sm w-full p-6 rounded-3xl border border-primary/20 bg-primary/5 shadow-lg text-center flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                          <Heart className="w-6 h-6 fill-primary" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-white mb-2">Suggestion Propose</h4>
                        <p className="text-sm text-white/90 font-medium mb-4">{msg.text}</p>

                        {status === 'pending' ? (
                          !isMe ? (
                            <div className="flex gap-3 w-full">
                              <button
                                onClick={() => handleRespondSuggestion(msg.id, senderId, receiverId, 'accepted')}
                                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-wider shadow hover:brightness-110 active:scale-95 transition"
                              >
                                Accept Move
                              </button>
                              <button
                                onClick={() => handleRespondSuggestion(msg.id, senderId, receiverId, 'rejected')}
                                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 font-semibold text-[10px] uppercase tracking-wider hover:bg-white/10 active:scale-95 transition"
                              >
                                Decline
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                              Waiting for their response...
                            </span>
                          )
                        ) : (
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            status === 'accepted' 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/20'
                          }`}>
                            {status === 'accepted' ? 'Suggestion Accepted ✓' : 'Suggestion Declined ✕'}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 self-end border border-white/10 shadow-lg relative">
                        <BlurredFaceImage
                          src={selectedMatch.target_profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'}
                          alt="Avatar"
                          sharedScore={selectedMatch.gauge_score ?? 0}
                          isEnabledByOwner={selectedMatch.target_profile.face_blur_active || false}
                          faceCoordinates={selectedMatch.target_profile.avatar_face_coordinates}
                          className="w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-1 max-w-[75%]">
                      {msg.media_url ? (
                        msg.is_ephemeral ? (
                          <EphemeralMediaBubble
                            message={msg}
                            isMe={isMe}
                            onViewed={handleViewEphemeral}
                            onScreenshotDetected={handleScreenshotDetected}
                          />
                        ) : (
                          // Normal media bubble
                          <div className="p-3 bg-[#181818] border border-white/5 rounded-3xl shadow-lg text-left">
                            <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/5">
                              {msg.media_type === 'image' && (
                                <img src={msg.media_url} alt={msg.media_name || 'attachment'} className="w-full object-cover max-h-60 rounded-2xl" />
                              )}
                              {msg.media_type === 'video' && (
                                <video src={msg.media_url} controls className="w-full rounded-2xl max-h-60" />
                              )}
                              {msg.media_type === 'file' && (
                                <div className="p-4 flex items-center gap-3 text-white">
                                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold uppercase tracking-wider text-white/90 truncate">{msg.media_name || 'file.bin'}</div>
                                    <div className="text-[9px] text-white/50 mt-0.5">{msg.media_size || 'Unknown size'}</div>
                                  </div>
                                  <a href={msg.media_url} download={msg.media_name || 'file'} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition">
                                    <Download className="w-4 h-4" />
                                  </a>
                                </div>
                              )}
                            </div>
                            {msg.text && <p className="text-xs text-white/80 mt-2 px-1">{msg.text}</p>}
                          </div>
                        )
                      ) : (
                        // Plain text message bubble
                        <div 
                          className={`p-4 rounded-3xl text-sm leading-relaxed shadow-lg ${
                            isMe 
                            ? 'bg-primary text-primary-foreground rounded-br-sm' 
                            : 'bg-[#181818] text-white rounded-bl-sm border border-white/5'
                          }`}
                        >
                          <div>{msg.text}</div>
                          {translatedMessages[msg.id] && (
                            <div className="mt-2 pt-2 border-t border-white/10 text-xs text-white/60 flex items-center gap-1 italic">
                              <Languages className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>{translatedMessages[msg.id]}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {msg.screenshot_detected && (
                        <div className="mt-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-500 animate-pulse justify-end">
                          <ShieldAlert className="w-3.5 h-3.5" /> Screenshot Detected!
                        </div>
                      )}

                      {msg.is_ai_generated && (
                        <span className={`text-[8px] font-black uppercase tracking-wider ${
                          isMe ? 'text-primary/70 text-right mr-1' : 'text-white/30 ml-1'
                        }`}>
                          🤖 Bot Generated
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Bar */}
            <footer className="absolute bottom-0 left-0 w-full p-4 glass border-t border-white/5 bg-black/95 z-30">
              <div className="max-w-4xl mx-auto flex flex-col gap-2">
                {/* File Preview Panel */}
                {selectedFile && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 relative"
                  >
                    {filePreview ? (
                      selectedFile.type.startsWith('video/') ? (
                        <video src={filePreview} className="w-12 h-12 object-cover rounded-xl border border-white/10" />
                      ) : (
                        <img src={filePreview} className="w-12 h-12 object-cover rounded-xl border border-white/10" />
                      )
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-xs font-bold text-white truncate">{selectedFile.name}</div>
                      <div className="text-[10px] text-white/40">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                    </div>

                    {/* Ephemeral indicator badge */}
                    {isEphemeral && (
                      <span className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shrink-0">
                        <Flame className="w-3 h-3 text-orange-500 fill-orange-500" /> Ephemeral Media
                      </span>
                    )}

                    <button 
                      type="button" 
                      onClick={handleClearFile}
                      className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/50 hover:text-white transition shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-end gap-2 relative">
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,video/*,application/pdf,text/*"
                  />

                  {/* Suggestion Move (Sparkles) */}
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(true)}
                    className="p-3 text-white/40 hover:text-primary transition shrink-0"
                    title="Suggestion Move"
                  >
                    <Sparkles className="w-5 h-5 text-primary shadow-[0_0_10px_rgba(102,252,241,0.5)]" />
                  </button>

                  {/* File Attachment Button */}
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-white/40 hover:text-white transition shrink-0"
                    title="Attach Photo/Video/File"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  {/* Ephemeral Toggle Button */}
                  <button 
                    type="button" 
                    onClick={() => setIsEphemeral(!isEphemeral)}
                    className={`p-3 transition shrink-0 ${
                      isEphemeral 
                        ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' 
                        : 'text-white/40 hover:text-white'
                    }`}
                    title="Toggle Ephemeral (View Once)"
                  >
                    <Flame className={`w-5 h-5 ${isEphemeral ? 'fill-orange-500' : ''}`} />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={selectedFile ? "Add a caption..." : "Send a message..."}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 pl-4 pr-12 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary transition"
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit" 
                    disabled={(!newMessage.trim() && !selectedFile) || isUploading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-30 disabled:grayscale transition shadow-[0_0_15px_rgba(102,252,241,0.4)]"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 ml-0.5" />
                    )}
                  </motion.button>
                </form>
              </div>
            </footer>

            {/* Suggestion Moves Modal */}
            <SuggestionMovesModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              gaugeLevel={rlsState ? rlsState.level.minScore >= 89 ? 8 : rlsState.level.minScore >= 75 ? 7 : rlsState.level.minScore >= 61 ? 6 : rlsState.level.minScore >= 45 ? 5 : rlsState.level.minScore >= 29 ? 4 : rlsState.level.minScore >= 16 ? 3 : rlsState.level.minScore >= 6 ? 2 : 1 : 1}
              isKycVerified={isKycVerified}
              userId={currentUser?.id}
              userRole={currentUser?.role || 'member'}
              onSelectMove={handleSendSuggestion}
              onKycSuccess={() => setIsKycVerified(true)}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-center p-6">
            <MessageSquare className="w-12 h-12 opacity-20 mb-4" />
            <h2 className="text-white font-bold mb-2">No Active Chat</h2>
            <p className="text-sm text-white/50 max-w-xs">Select a match from the sidebar to start building your relationship gauge.</p>
          </div>
        )}
      </main>

      {/* expandable right sidebar: Connection Diagnostics */}
      <AnimatePresence>
        {showDiagnostics && selectedMatch && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 180 }}
            className="fixed md:relative inset-y-0 right-0 md:inset-auto z-50 md:z-auto border-l border-white/5 bg-[#0a0a0a] flex flex-col shrink-0 h-full overflow-hidden"
          >
            {/* Background glows */}
            <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
              <span className="text-xs font-black text-primary tracking-widest uppercase flex items-center gap-1.5">
                <Brain className="w-4 h-4" /> Connection Radar
              </span>
              <button 
                onClick={() => setShowDiagnostics(false)}
                className="text-xs text-white/40 hover:text-white uppercase tracking-widest font-black transition"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 text-left">
              
              {/* Informative Consent Banner */}
              <div className="p-4 rounded-2xl border border-[#00f0ff]/20 bg-[#00f0ff]/5 text-[#00f0ff]">
                <div className="flex gap-2 items-start">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-wider">AI Diagnostics Active</p>
                    <p className="text-[9px] font-semibold leading-relaxed normal-case opacity-85">
                      Diagnostics processes chat logs via Google Gemini to evaluate alignment, extract traits, and determine Conversation Gravity. Updates are mutually shared.
                    </p>
                  </div>
                </div>
              </div>

              {/* Gravity Score Indicator */}
              <div className="bg-white/[0.02] border border-white/5 p-2 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <div className="bg-black/40 border border-white/5 rounded-[calc(2rem-0.5rem)] p-5 text-center space-y-3">
                  <span className="text-[8px] font-black uppercase text-white/40 tracking-widest block">
                    Conversation Gravity
                  </span>
                  
                  <div className="flex items-center justify-center py-2">
                    <div className="relative flex items-center justify-center w-24 h-24 rounded-full border border-white/10 bg-black/60 shadow-[inset_0_1px_5px_rgba(255,255,255,0.05)]">
                      {/* Glow according to score */}
                      <div className={`absolute inset-0 rounded-full blur-xl opacity-35 ${
                        (relationshipRecord?.gravity_score ?? 0) >= 60 ? 'bg-primary' :
                        (relationshipRecord?.gravity_score ?? 0) >= 20 ? 'bg-cyan-400' :
                        (relationshipRecord?.gravity_score ?? 0) >= -20 ? 'bg-zinc-500' : 'bg-destructive'
                      }`} />
                      <div className="relative z-10 flex flex-col items-center">
                        <span className="text-2xl font-black tracking-tighter text-white">
                          {relationshipRecord?.gravity_score !== undefined && relationshipRecord.gravity_score !== 0
                            ? `${relationshipRecord.gravity_score > 0 ? '+' : ''}${relationshipRecord.gravity_score}`
                            : 'N/A'
                          }
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40 mt-0.5">
                          {(relationshipRecord?.gravity_score ?? 0) >= 60 ? 'Burning 🔥' :
                           (relationshipRecord?.gravity_score ?? 0) >= 20 ? 'Sparking ✨' :
                           (relationshipRecord?.gravity_score ?? 0) >= -20 ? 'Neutral ⚖️' : 'Fading ❄️'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {relationshipRecord?.gravity_updated_at && (
                    <span className="text-[8px] text-white/30 uppercase tracking-widest font-black block">
                      Synced: {new Date(relationshipRecord.gravity_updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Extracted Traits */}
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase text-white/40 tracking-widest block">
                  Extracted Traits
                </span>
                {relationshipRecord?.extracted_traits && relationshipRecord.extracted_traits.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {relationshipRecord.extracted_traits.map((trait: string) => (
                      <span 
                        key={trait} 
                        className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(102,252,241,0.08)] hover:scale-102 transition"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center border border-dashed border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/30">
                    No traits detected yet
                  </div>
                )}
              </div>

              {/* Connection Summary */}
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase text-white/40 tracking-widest block">
                  AI Connection Radar
                </span>
                <div className="p-4 bg-white/2 border border-white/5 rounded-2xl">
                  <p className="text-xs font-semibold text-white/70 leading-relaxed">
                    {relationshipRecord?.gravity_summary 
                      ? `"${relationshipRecord.gravity_summary}"`
                      : "Click the Sync button below to analyze your interaction momentum and receive matching diagnostic suggestions."
                    }
                  </p>
                </div>
              </div>

              {analysisError && (
                <div className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{analysisError}</span>
                </div>
              )}

              {/* Trigger diagnostics CTA */}
              <button
                onClick={handleAnalyzeGravity}
                disabled={isAnalyzing}
                className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:shadow-[0_0_20px_rgba(102,252,241,0.5)] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Synchronizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run AI Diagnostics
                  </>
                )}
              </button>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* expandable right sidebar: Translation Settings */}
      <AnimatePresence>
        {showTranslationPane && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 180 }}
            className="fixed md:relative inset-y-0 right-0 md:inset-auto z-50 md:z-auto border-l border-white/5 bg-[#0a0a0a] flex flex-col shrink-0 h-full overflow-hidden"
          >
            {/* Background glows */}
            <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
              <span className="text-xs font-black text-primary tracking-widest uppercase flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> Live Translation
              </span>
              <button 
                onClick={() => setShowTranslationPane(false)}
                className="text-xs text-white/40 hover:text-white uppercase tracking-widest font-black transition"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 text-left">
              
              {/* Target Language Default Alert */}
              <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-2">
                <label className="text-[9px] font-black uppercase text-white/40 tracking-wider block">Target Language</label>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary shrink-0" />
                  <select 
                    value={targetLanguage} 
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="flex-1 bg-black/60 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-primary"
                  >
                    <option value="en">English (default)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                    <option value="pt">Portuguese</option>
                  </select>
                </div>
                {profileData?.favorite_languages && profileData.favorite_languages.length > 0 && (
                  <p className="text-[8px] text-white/40 uppercase tracking-wide">
                    Linked to primary favorite language: <span className="text-primary font-bold">{profileData.favorite_languages[0]}</span>
                  </p>
                )}
              </div>

              {/* Text Translation Toggle */}
              <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Chat Text Translation</h4>
                  <p className="text-[9px] text-white/50 leading-relaxed normal-case">Translate incoming texts to your language (Free)</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={profileData?.text_translation_enabled || false}
                  onChange={(e) => handleToggleTextTranslation(e.target.checked)}
                  className="w-8 h-4 rounded-full appearance-none bg-white/10 checked:bg-primary relative before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white checked:before:translate-x-4 before:transition cursor-pointer"
                />
              </div>

              {/* Speech-to-Speech (S2ST) Translation Controls */}
              <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">Speech Voice translation</h4>
                    <p className="text-[9px] text-white/50 leading-relaxed normal-case">Real-time interpretation in voice chats</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={profileData?.speech_translation_enabled || false}
                    onChange={(e) => handleToggleSpeechTranslation(e.target.checked)}
                    className="w-8 h-4 rounded-full appearance-none bg-white/10 checked:bg-primary relative before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white checked:before:translate-x-4 before:transition cursor-pointer"
                  />
                </div>

                {profileData?.speech_translation_enabled && (
                  <div className="pt-4 border-t border-white/5 space-y-4">
                    {/* Member Quota & Hold Flow */}
                    {profileData?.role !== 'creator' ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                          <span className="text-white/50">Daily Free Quota:</span>
                          <span className={s2stTimeLeft > 0 ? 'text-primary' : 'text-red-500 font-bold animate-pulse'}>
                            {Math.max(0, Math.floor(s2stTimeLeft / 60))}:{String(Math.max(0, s2stTimeLeft % 60)).padStart(2, '0')} mins
                          </span>
                        </div>
                        {s2stTimeLeft <= 0 && (
                          <div className="space-y-2">
                            <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-[9px] font-bold uppercase tracking-wide leading-relaxed">
                              ⚠️ Free 5-min tier reached. Pre-authorize a Stripe card hold to continue (€0.10/min).
                            </div>
                            {!preAuthCardHoldActive ? (
                              <button
                                onClick={handleSimulatePreAuth}
                                className="w-full py-2.5 bg-primary text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:brightness-115 active:scale-95 transition flex items-center justify-center gap-1"
                              >
                                <CreditCard className="w-3.5 h-3.5" /> Approve Pre-Auth Hold
                              </button>
                            ) : (
                              <div className="p-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                                <Check className="w-4 h-4" /> Pre-Auth Approved (€0.10/min)
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Creator ultimate pack and promo apply */
                      <div className="space-y-3">
                        {profileData?.creator_ultimate_pack || profileData?.promo_status === 'approved' ? (
                          <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                            <Gift className="w-4 h-4" /> Creator Ultimate Pack Active
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl text-[9px] font-bold uppercase tracking-wide leading-relaxed">
                              Speech S2ST requires Creator Ultimate Pack (€69/mo) or active approved promo.
                            </div>
                            
                            {profileData?.promo_status === 'pending' ? (
                              <div className="p-2.5 bg-white/5 border border-white/10 text-white/50 rounded-xl text-[9px] font-bold uppercase tracking-widest text-center">
                                ⏳ SLA Promo Review Pending (24h)
                              </div>
                            ) : (
                              <form onSubmit={handleApplyPromo} className="space-y-2">
                                <label className="text-[8px] font-black uppercase text-white/40 tracking-wider">Apply for "Best 50" Free 1-Year Promo</label>
                                <input
                                  type="url"
                                  placeholder="OnlyFans / Instagram Profile Link"
                                  value={promoLink}
                                  onChange={(e) => setPromoLink(e.target.value)}
                                  className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-primary"
                                  required
                                />
                                <button
                                  type="submit"
                                  disabled={isSubmittingPromo}
                                  className="w-full py-2 bg-primary text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:brightness-115 active:scale-95 transition"
                                >
                                  {isSubmittingPromo ? 'Submitting...' : 'Submit Application'}
                                </button>
                                {promoMessage && (
                                  <p className="text-[8px] uppercase tracking-wider font-bold mt-1 text-primary">{promoMessage}</p>
                                )}
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Active WSS translation stream controls */}
                    <button
                      onClick={handleStartS2st}
                      disabled={profileData?.role !== 'creator' && s2stTimeLeft <= 0 && !preAuthCardHoldActive}
                      className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition flex items-center justify-center gap-1.5 ${
                        isS2stActive 
                          ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20' 
                          : 'bg-primary text-black hover:brightness-110 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      <Mic className="w-4 h-4" /> {isS2stActive ? 'Stop Voice Interpreter' : 'Start Voice Interpreter'}
                    </button>
                  </div>
                )}
              </div>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>

    </div>
  );
}

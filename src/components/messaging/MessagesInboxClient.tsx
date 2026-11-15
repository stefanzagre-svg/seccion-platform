'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchMatches } from '@/lib/relationship-db';
import { useTranslation } from '@/context/LanguageContext';
import ChatWindow from './ChatWindow';

interface ConversationSummary {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessage: string;
  time: string;
  isOnline: boolean;
}

function formatRelativeOrTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function MessagesInboxClient() {
  const { t } = useTranslation();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadInbox() {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!active) return;

        if (!session?.user) {
          setCurrentUserId(null);
          setAuthChecked(true);
          setLoading(false);
          return;
        }

        const uid = session.user.id;
        setCurrentUserId(uid);
        setAuthChecked(true);

        const [matches, { data: recentMsgs }] = await Promise.all([
          fetchMatches(uid),
          supabase
            .from('messages')
            .select('sender_id, receiver_id, text, created_at')
            .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
            .order('created_at', { ascending: false })
            .limit(100),
        ]);

        if (!active) return;

        const latestByPartner = new Map<string, { text: string; created_at: string }>();
        for (const msg of recentMsgs || []) {
          const partnerId = msg.sender_id === uid ? msg.receiver_id : msg.sender_id;
          if (partnerId && !latestByPartner.has(partnerId)) {
            latestByPartner.set(partnerId, {
              text: msg.text || '',
              created_at: msg.created_at,
            });
          }
        }

        const built: ConversationSummary[] = (matches || [])
          .filter((m: any) => m.target_profile?.id)
          .map((m: any) => {
            const tp = m.target_profile;
            const latest = latestByPartner.get(tp.id);
            const lastActiveMs = tp.last_active_at ? new Date(tp.last_active_at).getTime() : 0;
            const isOnline = lastActiveMs > Date.now() - 10 * 60 * 1000;

            return {
              id: tp.id,
              partnerId: tp.id,
              partnerName: tp.display_name || tp.username || 'Member',
              partnerAvatar: tp.avatar_url || '/assets/logo/seccion-icon-light.png',
              lastMessage:
                latest?.text ||
                t('secureMessaging.startChatPrompt', 'Matched — start chatting'),
              time: formatRelativeOrTime(latest?.created_at || m.updated_at),
              isOnline,
            };
          });

        setConversations(built);
        if (built.length > 0) {
          setActivePartnerId(built[0].partnerId);
        }
      } catch (err) {
        console.error('[MessagesInboxClient] Failed loading inbox:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadInbox();
    return () => {
      active = false;
    };
  }, [t]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authChecked && !currentUserId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <MessageCircle className="w-12 h-12 text-primary mb-4" />
        <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">
          {t('secureMessaging.signInTitle', 'Sign in to view your Inbox')}
        </h2>
        <p className="text-xs text-white/50 max-w-sm mb-6">
          {t('secureMessaging.signInSubtitle', 'Your direct messages and real-time translations are end-to-end tied to your verified account.')}
        </p>
        <Link
          href="/login?redirect=/messages"
          className="px-6 py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:opacity-90 transition"
        >
          {t('secureMessaging.signInBtn', 'Sign In')}
        </Link>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <MessageCircle className="w-12 h-12 text-white/25 mb-4" />
        <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">
          {t('secureMessaging.emptyInboxTitle', 'No Conversations Yet')}
        </h2>
        <p className="text-xs text-white/50 max-w-sm mb-6">
          {t('secureMessaging.emptyInboxSubtitle', 'Match with creators or connect on the discovery feed to unlock direct messaging.')}
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:opacity-90 transition"
        >
          {t('secureMessaging.exploreBtn', 'Discover People')}
        </Link>
      </div>
    );
  }

  const activeConversation =
    conversations.find((c) => c.partnerId === activePartnerId) || conversations[0];

  return (
    <>
      {/* Left Sidebar: Conversations List */}
      <div className="w-full md:w-96 flex flex-col bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl shrink-0 hidden md:flex">
        <div className="p-6 border-b border-white/10 bg-black/50 backdrop-blur-xl">
          <h1 className="text-2xl font-black text-white font-['JetBrains_Mono'] tracking-tighter">
            {t('secureMessaging.inboxTitle', 'INBOX')}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => setActivePartnerId(conv.partnerId)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition text-left group ${
                conv.partnerId === activeConversation.partnerId
                  ? 'bg-primary/10 border border-primary/20'
                  : 'bg-transparent border border-transparent hover:bg-white/5'
              }`}
            >
              <div className="relative shrink-0">
                <div
                  className={`w-12 h-12 rounded-full overflow-hidden border ${
                    conv.partnerId === activeConversation.partnerId
                      ? 'border-primary'
                      : 'border-white/10'
                  }`}
                >
                  <img
                    src={conv.partnerAvatar}
                    alt={conv.partnerName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {conv.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-black" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3
                    className={`font-bold truncate ${
                      conv.partnerId === activeConversation.partnerId
                        ? 'text-primary'
                        : 'text-white'
                    }`}
                  >
                    {conv.partnerName}
                  </h3>
                  {conv.time && (
                    <span className="text-[10px] text-white/40 font-bold uppercase shrink-0 ml-2">
                      {conv.time}
                    </span>
                  )}
                </div>
                <p className="text-xs truncate text-white/50">{conv.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Area: Active Chat Window */}
      <div className="flex-1 h-full min-w-0 relative pb-20 md:pb-0">
        {currentUserId && activeConversation && (
          <ChatWindow
            conversationId={activeConversation.id}
            targetUserId={activeConversation.partnerId}
            creatorName={activeConversation.partnerName}
            creatorAvatar={activeConversation.partnerAvatar}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getResilientSession } from '@/lib/supabase-safe';
import { Mail, RefreshCw, LogOut, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const EXEMPT_PATH_PREFIXES = [
  '/onboarding',
  '/login',
  '/become-creator',
  '/studio',
  '/admin',
  '/early-access',
  '/how-we-do',
  '/creator-hub',
  '/faq',
  '/privacy',
  '/rules',
  '/auth',
];

export default function EmailVerificationGuard({ children }: { children: React.ReactNode }) {
  const [needsVerification, setNeedsVerification] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let mounted = true;

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code && !window.location.pathname.startsWith('/auth/callback')) {
        window.location.href = `/auth/callback?code=${encodeURIComponent(code)}`;
        return;
      }

      const path = window.location.pathname;
      if (path === '/' || EXEMPT_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) {
        setNeedsVerification(false);
        return;
      }
    }

    async function checkAuth() {
      try {
        const data = await getResilientSession();
        const user = data?.user;
        if (user) {
          const isExemptUser =
            Boolean(user.email_confirmed_at) ||
            user.user_metadata?.email_verified === true ||
            user.user_metadata?.role === 'creator';

          if (!isExemptUser) {
            if (mounted) {
              setNeedsVerification(true);
              setUserEmail(user.email || null);
            }
          } else {
            if (mounted) setNeedsVerification(false);
          }
        } else {
          if (mounted) setNeedsVerification(false);
        }
      } catch (err) {
        console.error('EmailVerificationGuard: Auth check failed:', err);
        if (mounted) setNeedsVerification(false);
      }
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path === '/' || EXEMPT_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) {
          setNeedsVerification(false);
          return;
        }
      }
      if (session?.user) {
        const isExemptUser =
          Boolean(session.user.email_confirmed_at) ||
          session.user.user_metadata?.email_verified === true ||
          session.user.user_metadata?.role === 'creator';

        if (!isExemptUser) {
          setNeedsVerification(true);
          setUserEmail(session.user.email || null);
        } else {
          setNeedsVerification(false);
        }
      } else {
        setNeedsVerification(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleResend = async () => {
    if (!userEmail) return;
    setResending(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });
      if (error) throw error;
      setMessage({ text: 'Verification email resent! Please check your inbox.', type: 'success' });
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || 'Failed to resend email.', type: 'error' });
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setNeedsVerification(false);
  };

  if (needsVerification && !dismissed) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-zinc-900 border border-white/10 p-8 rounded-3xl text-center space-y-6 shadow-2xl"
        >
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-10 h-10 text-primary" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Check Your Inbox</h2>
            <p className="text-white/60 text-sm">
              We&apos;ve sent a verification link to <strong className="text-white">{userEmail}</strong>. Please verify your email address or continue directly to setup.
            </p>
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl text-sm ${
                message.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-3 pt-4">
            <button
              onClick={() => setDismissed(true)}
              className="w-full py-4 bg-primary text-black font-black uppercase tracking-wider rounded-xl hover:bg-primary/90 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full py-3.5 bg-white/10 text-white font-bold uppercase tracking-wider rounded-xl hover:bg-white/15 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {resending ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Resend Verification Email'}
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-white/5 text-white/60 font-bold uppercase tracking-wider rounded-xl hover:bg-white/10 hover:text-white transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, RefreshCw, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmailVerificationGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let mounted = true;

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        window.location.href = `/auth/callback?code=${encodeURIComponent(code)}`;
        return;
      }
    }

    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('EmailVerificationGuard: Session error:', error);
          if (mounted) setNeedsVerification(false);
          return;
        }

        const session = data?.session;
        if (session?.user) {
          if (!session.user.email_confirmed_at) {
            if (mounted) {
              setNeedsVerification(true);
              setUserEmail(session.user.email || null);
            }
          } else {
            if (mounted) setNeedsVerification(false);
          }
        } else {
          // Not logged in, so we don't block them
          if (mounted) setNeedsVerification(false);
        }
      } catch (err) {
        console.error('EmailVerificationGuard: Auth check failed:', err);
        if (mounted) setNeedsVerification(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        if (!session.user.email_confirmed_at) {
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
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
        <div className="animate-spin text-primary">
          <RefreshCw className="w-8 h-8" />
        </div>
      </div>
    );
  }

  if (needsVerification) {
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
              We've sent a verification link to <strong className="text-white">{userEmail}</strong>. 
              Please verify your email address to access the platform.
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-3 pt-4">
            <button 
              onClick={handleResend}
              disabled={resending}
              className="w-full py-4 bg-primary text-black font-black uppercase tracking-wider rounded-xl hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {resending ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Resend Email'}
            </button>
            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-white/5 text-white/70 font-bold uppercase tracking-wider rounded-xl hover:bg-white/10 hover:text-white transition flex items-center justify-center gap-2"
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

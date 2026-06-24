'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Shield, Sparkles, MessageSquare, Trophy, RefreshCw, LogIn, User, Compass, Tv, Search, Bell, Heart } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Exclude navbar in onboarding, auth callback, or admin pages
  const isExcludedPage = pathname?.startsWith('/onboarding') || pathname?.startsWith('/auth') || pathname?.startsWith('/admin');

  // Sync search query from URL on load/pathname change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const query = params.get('search') || '';
      setSearchQuery(query);
    }
  }, [pathname]);

  // Load and listen to unread suggestions count
  useEffect(() => {
    if (!user) return;
    
    const loadUnreadCount = async () => {
      try {
        const { count } = await supabase
          .from('suggestion_caches')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        setUnreadCount(count || 0);
      } catch (err) {
        console.error('Error loading unread suggestions count in navbar:', err);
      }
    };

    loadUnreadCount();

    const channel = supabase
      .channel('navbar_suggestion_caches_unread')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'suggestion_caches',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    async function getSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (err) {
        console.error('Error fetching session/profile:', err);
      } finally {
        setIsLoading(false);
      }
    }

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profileData) {
          setProfile(profileData);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleRoleSwitch = async () => {
    if (!user || !profile || isSwitching) return;
    setIsSwitching(true);

    const newRole = profile.role === 'creator' ? 'member' : 'creator';

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);

      if (error) throw error;

      // Update local profile state
      setProfile((prev: any) => ({ ...prev, role: newRole }));

      // Redirect accordingly
      if (newRole === 'creator') {
        router.push('/studio');
      } else {
        router.push('/profile/member');
      }
    } catch (err) {
      console.error('Error switching role:', err);
      alert('Failed to switch profile role. Please try again.');
    } finally {
      setIsSwitching(false);
    }
  };

  if (isExcludedPage) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10 w-full px-6 md:px-12 py-3.5 flex justify-between items-center transition-all duration-300">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity">
          <img src="/images/seccion-logo-icon.png" alt="SECCION Icon" className="w-8 h-8 rounded-lg drop-shadow-[0_0_12px_rgba(0,251,251,0.4)] object-contain" />
          <img 
            src="/images/seccion-logo-text.png" 
            alt="SECCION" 
            className="h-6 object-contain hidden sm:block" 
          />
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all ${
              isActive('/') ? 'text-primary' : 'text-white/50 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Feed
          </Link>
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all ${
              isActive('/dashboard') ? 'text-primary' : 'text-white/50 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            Swipe
          </Link>
          <Link 
            href="/messages" 
            className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all ${
              isActive('/messages') ? 'text-primary' : 'text-white/50 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Messages
          </Link>
          <Link 
            href="/top-profile" 
            className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all ${
              isActive('/top-profile') ? 'text-primary' : 'text-white/50 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Top Profile
          </Link>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:flex relative w-64 xl:w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search creators or content..." 
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              const newUrl = val ? `/?search=${encodeURIComponent(val)}` : '/';
              window.history.replaceState(null, '', newUrl);
              window.dispatchEvent(new CustomEvent('search-changed', { detail: val }));
              if (pathname !== '/') {
                router.push(newUrl);
              }
            }}
            className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 pl-11 pr-4 outline-none focus:border-primary/40 focus:bg-white/10 transition-all text-xs font-semibold text-white placeholder-white/40"
          />
        </div>

        {/* CTA / Auth / Profile Section */}
        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-4">
                
                {/* Notification Bell */}
                <div className="relative shrink-0">
                  <button 
                    onClick={() => {
                      if (pathname === '/') {
                        const el = document.getElementById('ai-suggestion-panel');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      } else {
                        router.push('/#ai-suggestion-panel');
                      }
                    }}
                    className="relative p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 text-white/80 hover:text-white transition-all duration-300 flex items-center justify-center animate-fade-in"
                    title="AI Matchmaking Suggestions"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white ring-2 ring-black animate-pulse shadow-[0_0_10px_rgba(255,0,127,0.8)]">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
                
                {/* Role Switch Button */}
                {profile && (
                  <button
                    onClick={handleRoleSwitch}
                    disabled={isSwitching}
                    className={`relative flex items-center gap-2.5 px-2 py-2 sm:px-4 sm:py-2 border rounded-xl font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                      profile.role === 'creator'
                        ? 'border-[#ffabf3]/30 text-[#ffabf3] bg-[#ffabf3]/5 hover:bg-[#ffabf3]/10'
                        : 'border-[#00fbfb]/30 text-[#00fbfb] bg-[#00fbfb]/5 hover:bg-[#00fbfb]/10'
                    } disabled:opacity-50`}
                  >
                    {isSwitching ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : profile.role === 'creator' ? (
                      <>
                        <User className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Member Mode</span>
                      </>
                    ) : (
                      <>
                        <Tv className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Creator Mode</span>
                      </>
                    )}
                  </button>
                )}

                {/* Profile Dashboard link */}
                <Link 
                  href={profile?.role === 'creator' ? '/studio' : '/profile/member'}
                  className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center hover:border-primary transition group overflow-hidden"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-white/60 group-hover:text-primary transition" />
                  )}
                </Link>
              </div>
            ) : (
              <button 
                onClick={() => router.push('/onboarding')}
                className="flex items-center gap-2 px-5 py-2 border border-[#00fbfb]/40 text-[#00fbfb] bg-[#00fbfb]/5 font-['JetBrains_Mono'] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#00fbfb]/10 transition-all active:scale-[0.98]"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign Up
              </button>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/85 backdrop-blur-2xl border-t border-white/10 px-6 py-2.5 shadow-2xl flex justify-between items-center transition-all duration-300">
        <Link 
          href="/" 
          className={`flex flex-col items-center gap-1.5 py-1 px-3 transition ${
            isActive('/') ? 'text-primary' : 'text-white/40 hover:text-white'
          }`}
        >
          <Compass className="w-4.5 h-4.5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Feed</span>
        </Link>

        <Link 
          href="/dashboard" 
          className={`flex flex-col items-center gap-1.5 py-1 px-3 transition ${
            isActive('/dashboard') ? 'text-primary' : 'text-white/40 hover:text-white'
          }`}
        >
          <Heart className="w-4.5 h-4.5 fill-current" />
          <span className="text-[8px] font-black uppercase tracking-widest">Swipe</span>
        </Link>

        <Link 
          href="/messages" 
          className={`flex flex-col items-center gap-1.5 py-1 px-3 transition ${
            isActive('/messages') ? 'text-primary' : 'text-white/40 hover:text-white'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_5px_rgba(255,0,127,0.8)]" />
            )}
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest">Chat</span>
        </Link>

        <Link 
          href="/top-profile" 
          className={`flex flex-col items-center gap-1.5 py-1 px-3 transition ${
            isActive('/top-profile') ? 'text-primary' : 'text-white/40 hover:text-white'
          }`}
        >
          <Trophy className="w-4.5 h-4.5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Top</span>
        </Link>

        <Link 
          href={profile?.role === 'creator' ? '/studio' : '/profile/member'}
          className={`flex flex-col items-center gap-1.5 py-1 px-3 transition ${
            isActive(profile?.role === 'creator' ? '/studio' : '/profile/member') ? 'text-primary' : 'text-white/40 hover:text-white'
          }`}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="w-4.5 h-4.5 rounded-full object-cover border border-white/20" />
          ) : (
            <User className="w-4.5 h-4.5" />
          )}
          <span className="text-[8px] font-black uppercase tracking-widest">Profile</span>
        </Link>
      </div>
    </>
  );
}

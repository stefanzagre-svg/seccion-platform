'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, LogOut, Terminal, User as UserIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TopBarProps {
  title: string;
  adminUser?: {
    username: string;
    role: string;
  };
  onSearchClick?: () => void;
}

export default function AdminTopBar({ title, adminUser, onSearchClick }: TopBarProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/onboarding');
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      default: return 'Moderator';
    }
  };

  return (
    <header className="h-16 border-b border-white/10 backdrop-blur-xl bg-black/40 flex items-center justify-between px-8 z-20 shrink-0">
      {/* Title / Module info */}
      <div className="flex items-center gap-3">
        <h1 className="font-['Outfit'] text-lg font-black uppercase tracking-wider text-white">
          {title}
        </h1>
        {process.env.NODE_ENV === 'development' && (
          <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded text-[9px] font-mono text-yellow-400 font-bold uppercase tracking-wider">
            <Terminal className="w-3 h-3" />
            Dev Mode
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        {/* Cmd+K Search trigger */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 text-white/40 hover:text-white/60 transition-all text-xs font-semibold group"
        >
          <Search className="w-4 h-4 group-hover:text-primary transition-colors" />
          <span className="hidden sm:inline">Search station...</span>
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-white/10 bg-black/40 px-1.5 font-mono text-[9px] font-medium text-white/50">
            <span>⌘</span>K
          </kbd>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 text-white/60 hover:text-white transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full glow-cyan-sm animate-pulse" />
        </button>

        {/* Admin dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-primary" />
            </div>
            {adminUser && (
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-white leading-tight">{adminUser.username}</div>
                <div className="text-[9px] text-white/40 leading-none">{getRoleLabel(adminUser.role)}</div>
              </div>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl p-2 shadow-2xl z-50 animate-fade-in">
              <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                <div className="text-xs font-bold text-white truncate">{adminUser?.username}</div>
                <div className="text-[10px] text-primary font-mono">{getRoleLabel(adminUser?.role)}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

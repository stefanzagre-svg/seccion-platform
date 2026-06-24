'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  LayoutDashboard, 
  Users, 
  Tv, 
  ShieldAlert, 
  DollarSign, 
  Activity, 
  History, 
  Settings,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const items = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard, category: 'Navigation' },
    { name: 'Users Management', href: '/admin/users', icon: Users, category: 'Navigation' },
    { name: 'Creators Station', href: '/admin/creators', icon: Tv, category: 'Navigation' },
    { name: 'Content Moderation', href: '/admin/moderation', icon: ShieldAlert, category: 'Navigation' },
    { name: 'Financial Reconciliation', href: '/admin/finance', icon: DollarSign, category: 'Navigation' },
    { name: 'Feature Analytics', href: '/admin/features', icon: Activity, category: 'Navigation' },
    { name: 'Audit Trail Logs', href: '/admin/audit', icon: History, category: 'Navigation' },
    { name: 'Platform Settings', href: '/admin/settings', icon: Settings, category: 'Navigation' },
    { name: 'Exit Admin Station', href: '/', icon: ArrowLeft, category: 'System' },
  ];

  // Filter items
  const filtered = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  // Handle global keydown for trigger (Cmd+K or Ctrl+K)
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose();
    setSearch('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Spotlight box */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0B0C10]/95 backdrop-blur-xl shadow-2xl z-10 animate-fade-in">
        {/* Search header */}
        <div className="relative border-b border-white/10 px-4 py-3.5 flex items-center gap-3">
          <Search className="w-4 h-4 text-white/40" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or nav route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none font-semibold"
          />
          <span className="text-[9px] font-black uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/50">
            ESC
          </span>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/40 font-semibold">
              No matching routes found.
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleNavigate(item.href)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all text-left text-xs font-semibold text-white/70 group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-white/40 group-hover:text-primary transition-colors" />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30 group-hover:text-primary/75">
                      {item.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

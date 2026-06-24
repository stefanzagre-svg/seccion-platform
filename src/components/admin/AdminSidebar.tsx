'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Tv, 
  ShieldAlert, 
  DollarSign, 
  Activity, 
  History, 
  Settings, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils'; // wait, is cn helper available? Let's check or write our own simple one

interface SidebarProps {
  adminUser?: {
    username: string;
    role: string;
  };
}

export default function AdminSidebar({ adminUser }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Creators', href: '/admin/creators', icon: Tv },
    { name: 'Moderation', href: '/admin/moderation', icon: ShieldAlert },
    { name: 'Finance', href: '/admin/finance', icon: DollarSign },
    { name: 'Features', href: '/admin/features', icon: Activity },
    { name: 'Audit Logs', href: '/admin/audit', icon: History },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'admin': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      default: return 'Moderator';
    }
  };

  return (
    <div 
      className={cn(
        "relative flex flex-col h-screen border-r border-white/10 backdrop-blur-xl bg-black/60 transition-all duration-300 z-30 shrink-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full border border-white/10 bg-black flex items-center justify-center text-white/60 hover:text-white hover:border-primary/50 transition-colors"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Header Logo */}
      <div className={cn("p-6 flex items-center gap-3 border-b border-white/5", isCollapsed ? "justify-center" : "")}>
        <img src="/images/seccion-logo-icon.png" alt="SECCION" className="w-8 h-8 rounded-lg drop-shadow-[0_0_12px_rgba(0,251,251,0.4)]" />
        {!isCollapsed && (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-['Outfit'] font-black tracking-widest text-xs text-white">SECCION</span>
              <span className="text-[9px] font-['JetBrains_Mono'] uppercase tracking-widest text-primary font-bold">Station Control</span>
            </div>
          </div>
        )}
      </div>

      {/* Menu List */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/10 text-primary border-l-2 border-primary shadow-[inset_0_0_12px_rgba(102,252,241,0.05)]" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-white/60 group-hover:text-white")} />
              {!isCollapsed && <span>{item.name}</span>}
              {isCollapsed && (
                <div className="absolute left-16 bg-black border border-white/10 px-2 py-1 rounded text-[10px] uppercase font-bold text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Admin User Info */}
      {adminUser && !isCollapsed && (
        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{adminUser.username}</div>
              <div className="flex mt-1">
                <span className={cn("text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border", getRoleColor(adminUser.role))}>
                  {getRoleLabel(adminUser.role)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Switch back to platform */}
      <div className="p-4 border-t border-white/5">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Exit Station</span>}
        </Link>
      </div>
    </div>
  );
}

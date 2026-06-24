'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import CommandPalette from './CommandPalette';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  adminUser: {
    username: string;
    platform_role: string;
  };
}

export default function AdminLayoutClient({ children, adminUser }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut listener for CommandPalette (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getPageTitle = (path?: string) => {
    if (!path) return 'Overview';
    if (path === '/admin') return 'Overview';
    if (path.startsWith('/admin/users')) return 'User Management';
    if (path.startsWith('/admin/creators')) return 'Creators Station';
    if (path.startsWith('/admin/moderation')) return 'Content Moderation';
    if (path.startsWith('/admin/finance')) return 'Finance Reconciliation';
    if (path.startsWith('/admin/features')) return 'Feature Analytics';
    if (path.startsWith('/admin/audit')) return 'Audit Trail Logs';
    if (path.startsWith('/admin/settings')) return 'Platform Settings';
    return 'Station Control';
  };

  return (
    <div className="flex h-screen w-full bg-[#0B0C10] text-white overflow-hidden relative font-sans">
      {/* Background neon ambient decoration specifically for admin area */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[800px] h-[300px] bg-primary/5 rounded-full -top-40 right-20 blur-[120px]" />
        <div className="absolute w-[600px] h-[300px] bg-purple-500/5 rounded-full bottom-0 left-20 blur-[100px]" />
      </div>

      <AdminSidebar adminUser={{ username: adminUser.username, role: adminUser.platform_role }} />

      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        <AdminTopBar 
          title={getPageTitle(pathname)} 
          adminUser={{ username: adminUser.username, role: adminUser.platform_role }} 
          onSearchClick={() => setIsSearchOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>

      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

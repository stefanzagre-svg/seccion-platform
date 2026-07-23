'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Key, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('stefan.zagre@gmail.com');
  const [password, setPassword] = useState('StefanAdmin2026!');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/auth/founder-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Invalid Admin Credentials');
      }

      // Hard redirect to Admin Dashboard
      window.location.href = '/admin';

    } catch (err: any) {
      console.error('[Admin Login Page] Auth Error:', err);
      setErrorMsg(err.message || 'Failed to authenticate Admin session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,251,251,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,251,251,0.2) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0c1017] border border-cyan-500/40 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20 relative z-10 space-y-6">
        
        {/* Header Badge */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black font-['Outfit'] tracking-tight text-white uppercase mt-2">
            SECCIØN ADMIN LOGIN
          </h1>
          <p className="text-xs text-white/50 font-mono">
            Dedicated Founder & Operations Station Portal
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
              Admin Email Address:
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-xs font-mono text-white outline-none focus:border-cyan-400 focus:bg-black transition-all"
                placeholder="stefan.zagre@gmail.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
              Security Password:
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-xs font-mono text-white outline-none focus:border-cyan-400 focus:bg-black transition-all"
                placeholder="••••••••••••"
                required
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-black font-extrabold font-mono text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Super Admin...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Access Admin Station</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center border-t border-white/10 pt-4">
          <p className="text-[10px] text-white/40 font-mono">
            SECCIØN Platform Operations — Authorized Personnel Only
          </p>
        </div>

      </div>
    </div>
  );
}

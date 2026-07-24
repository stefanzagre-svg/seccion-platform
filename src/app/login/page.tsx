"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Key, Mail, Lock, ArrowLeft, AlertCircle, ShieldAlert, Sparkles, Crown } from "lucide-react";
import PrelaunchModal from "@/components/PrelaunchModal";

// Double bezel card wrapper
function DoubleBezelCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[2.5rem] p-1 bg-white/[0.04] border border-white/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-visible ${className}`}>
      <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] pointer-events-none" />
      <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0F0F1A]/95 p-8 border border-white/5 relative z-10">
        {children}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isPrelaunchModalOpen, setIsPrelaunchModalOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();

    try {
      if (useMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMagicLinkSent(true);
      } else {
        // Call server-side auth route to guarantee HTTP cookies are set cleanly
        const res = await fetch('/api/admin/auth/founder-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || 'Failed to authenticate.');
        }

        const searchParams = new URLSearchParams(window.location.search);
        const nextTarget = searchParams.get('next') || json.redirectUrl || '/admin';

        // Hard navigation so browser sends fresh auth cookies to Cloudflare Worker
        window.location.href = nextTarget;
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMsg(err.message || "Failed to authenticate. Only approved creators & founders have active pre-launch accounts.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-center items-center p-4 relative">
      <PrelaunchModal isOpen={isPrelaunchModalOpen} onClose={() => setIsPrelaunchModalOpen(false)} />

      {/* Background Cyber Grid */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/40 hover:text-[#00fbfb] transition mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Pre-Launch Locked Banner */}
        <div className="mb-4 p-3.5 bg-[#00fbfb]/10 border border-[#00fbfb]/30 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#00fbfb] font-mono font-bold text-[11px] uppercase">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Pre-Launch Access Only</span>
          </div>
          <button
            onClick={() => setIsPrelaunchModalOpen(true)}
            className="text-[10px] font-mono font-bold text-[#ffabf3] underline hover:text-white transition cursor-pointer"
          >
            Learn Why
          </button>
        </div>

        <DoubleBezelCard>
          <div className="space-y-6 text-left">
            <div className="text-center space-y-2">
              <img 
                src="/assets/logo/logo-wordmark.png" 
                alt="SECCIØN" 
                className="h-8 mx-auto object-contain drop-shadow-[0_0_20px_rgba(0,251,251,0.4)]"
              />
              <p className="text-[10px] font-mono font-bold text-[#ffabf3] uppercase tracking-widest">
                Approved Creator & Admin Access
              </p>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] text-[#b9cac9] leading-relaxed text-center">
              Public demo accounts are temporarily locked during the pre-launch phase. Logins are restricted to <strong className="text-white">approved creators</strong> & <strong className="text-white">founding team members</strong>.
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {magicLinkSent ? (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl space-y-2 text-center">
                <h4 className="font-bold uppercase tracking-wider">Magic Link Sent!</h4>
                <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                  We sent a secure magic sign-in link to **{email}**. Check your inbox and click the link to sign in instantly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-mono text-white/40 uppercase font-bold tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="approved.creator@example.com"
                      required
                      className="w-full bg-black/40 border border-white/10 focus:border-[#00fbfb]/50 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none transition"
                    />
                  </div>
                </div>

                {/* Password Input (Hidden for Magic Link) */}
                {!useMagicLink && (
                  <div className="space-y-1.5 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <label className="block text-[8px] font-mono text-white/40 uppercase font-bold tracking-wider">Password</label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required={!useMagicLink}
                        className="w-full bg-black/40 border border-white/10 focus:border-[#00fbfb]/50 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none transition"
                      />
                    </div>
                  </div>
                )}

                {/* Switch Login Method */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setUseMagicLink(!useMagicLink);
                      setErrorMsg(null);
                    }}
                    className="text-[9px] font-mono font-bold text-[#ffabf3] hover:underline uppercase tracking-wide cursor-pointer"
                  >
                    {useMagicLink ? "Sign in with password" : "Send magic link instead"}
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#00fbfb] text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl hover:shadow-[0_0_15px_rgba(0,251,251,0.5)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>{useMagicLink ? "Send Magic Link" : "Sign In to Creator / Admin"}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="border-t border-white/5 pt-4 text-center space-y-2">
              <p className="text-[10px] text-[#b9cac9]">
                Are you a creator wanting 90% revenue & 1-Year Free AI Assistant?{" "}
                <Link href="/become-creator#apply" className="text-[#00fbfb] hover:underline font-bold font-mono uppercase tracking-wide">
                  Apply Now
                </Link>
              </p>
              <p className="text-[10px] text-[#b9cac9]">
                Want early member rewards?{" "}
                <Link href="/early-access" className="text-[#ffabf3] hover:underline font-bold font-mono uppercase tracking-wide">
                  Join Early Access List
                </Link>
              </p>
            </div>
          </div>
        </DoubleBezelCard>

      </div>
    </div>
  );
}

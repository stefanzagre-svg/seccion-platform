"use client";

import React, { useState } from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import { useTranslation } from "@/context/LanguageContext";
import { ArrowLeft, Send, CheckCircle2, MessageSquare, Mail, User } from "lucide-react";

// Double bezel card
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

export default function HitUsUpPage() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setLoading(true);

    // Simulate contact submission
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen text-[#e2e2e2] overflow-x-hidden font-sans bg-transparent relative flex flex-col pb-20">
      
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

      {/* Floating Navbar */}
      <PublicNavbar />

      <div className="relative z-10 pt-36 px-6 md:px-[84px] max-w-[540px] mx-auto w-full flex-grow">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/40 hover:text-[#00fbfb] transition mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t("contact.backHome", "Back to Home")}</span>
        </Link>

        {/* Title */}
        <div className="text-left space-y-3 mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none">
            {t("contact.title", "Hit Us Up")}
          </h1>
          <p className="text-xs sm:text-sm text-[#b9cac9]">
            {t("contact.subtitle", "Have questions, ideas, or feedback? Reach out and our team will get back to you fast.")}
          </p>
        </div>

        <DoubleBezelCard>
          <div className="space-y-6 text-left">
            
            {success ? (
              <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-sm">{t("contact.success", "Message received! We will reply shortly.")}</h4>
                </div>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-[9px] font-mono text-[#00fbfb] hover:underline uppercase tracking-wide cursor-pointer"
                >
                  {t("contact.sendAnother", "Send another message")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-mono text-white/40 uppercase font-bold tracking-wider">{t("contact.nameLabel", "Your Name")}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("contact.namePlaceholder", "e.g. Valentina Gomez")}
                      required
                      className="w-full bg-black/40 border border-white/10 focus:border-[#00fbfb]/50 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none transition"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-mono text-white/40 uppercase font-bold tracking-wider">{t("contact.emailLabel", "Your Email")}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("contact.emailPlaceholder", "you@email.com")}
                      required
                      className="w-full bg-black/40 border border-white/10 focus:border-[#00fbfb]/50 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none transition"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-mono text-white/40 uppercase font-bold tracking-wider">{t("contact.subjectLabel", "Subject")}</label>
                  <input 
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t("contact.subjectPlaceholder", "Feedback / General query")}
                    className="w-full bg-black/40 border border-white/10 focus:border-[#00fbfb]/50 rounded-xl py-2.5 px-4 text-xs outline-none transition"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-mono text-white/40 uppercase font-bold tracking-wider">{t("contact.messageLabel", "Message")}</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("contact.messagePlaceholder", "How can we help you?")}
                    required
                    rows={4}
                    className="w-full bg-black/40 border border-white/10 focus:border-[#00fbfb]/50 rounded-xl py-2.5 px-4 text-xs outline-none transition resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#00fbfb] text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl hover:shadow-[0_0_15px_rgba(0,251,251,0.5)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? t("contact.sending", "Sending...") : t("contact.submit", "Send Message")}</span>
                </button>

              </form>
            )}

          </div>
        </DoubleBezelCard>

      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-[#0B0C10] border-t border-white/10 flex flex-col items-center justify-center w-full px-4 sm:px-6 md:px-12 lg:px-20 py-12 gap-8 text-center mt-20">
        {/* Top: Centered 3D Icon */}
        <div className="flex justify-center">
          <img 
            src="/assets/logo/logo-mark.png" 
            alt="SECCION Icon" 
            className="w-12 h-12 md:w-14 md:h-14 drop-shadow-[0_0_20px_rgba(0,251,251,0.4)] object-contain" 
          />
        </div>

        {/* Middle: Navigation Links */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
          <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/privacy">{t("footer.privacy")}</Link>
          <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/rules">{t("footer.rules")}</Link>
          <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/creator-hub">{t("footer.creatorHub")}</Link>
          <Link className="text-[#ffabf3] border-b border-[#ffabf3] pb-0.5 transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/hit-us-up">{t("footer.contact")}</Link>
        </div>

        {/* Bottom: Clean Wordmark Only (No Icon attached) */}
        <div className="flex flex-col items-center gap-3">
          <img 
            src="/assets/logo/logo-wordmark.png" 
            alt="SECCION Logo" 
            className="h-8 md:h-10 drop-shadow-[0_0_25px_rgba(0,251,251,0.4)] object-contain" 
          />
          <p className="font-mono text-[11px] font-medium tracking-widest text-[#b9cac9] opacity-40 pt-2">© 2026 SECCION. {t("footer.rights").toUpperCase()}</p>
        </div>
      </footer>
    </div>
  );
}

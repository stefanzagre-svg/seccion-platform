"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Check, ShieldAlert } from "lucide-react";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("seccion_cookie_consent");
    if (!consent) {
      // Delay showing it slightly for a smoother entry
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("seccion_cookie_consent", "accepted");
    setIsVisible(false);
    // Here we would typically initialize Google Analytics, Meta Pixel, etc.
  };

  const handleReject = () => {
    localStorage.setItem("seccion_cookie_consent", "rejected");
    setIsVisible(false);
    // Only strictly necessary cookies will be used.
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-4 right-4 z-[100] p-4 pointer-events-none flex justify-end max-w-md w-full"
        >
          <div className="pointer-events-auto w-full bg-black/95 border border-primary/30 p-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col gap-4">
            
            <div className="flex-1 space-y-2 text-center md:text-left">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center justify-center md:justify-start gap-2">
                <Cookie className="w-5 h-5 text-primary" /> Privacy & Cookies
              </h3>
              <p className="text-xs text-white/60 leading-relaxed max-w-2xl">
                We use cookies to secure your session, analyze our traffic, and enhance your platform experience. 
                Because we value your privacy, you can choose to reject non-essential cookies. By clicking "Accept All", you consent to our use of all cookies in accordance with our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
            </div>

            <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={handleAccept}
                className="flex-1 md:flex-none px-6 py-3 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(102,252,241,0.3)]"
              >
                <Check className="w-4 h-4" /> Accept All
              </button>
              <button
                onClick={handleReject}
                className="flex-1 md:flex-none px-6 py-3 bg-white/5 border border-white/10 text-white/70 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Reject Non-Essential
              </button>
            </div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

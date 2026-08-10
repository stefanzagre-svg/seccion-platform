"use client";

import React, { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X, Sparkles, CheckCircle2 } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isFirefox, setIsFirefox] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already in standalone app mode
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    // Check if dismissed recently (7 days)
    const lastDismissed = localStorage.getItem("seccion_pwa_prompt_dismissed");
    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed, 10);
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    const ua = navigator.userAgent;
    const isIOSDevice = /iPhone|iPad|iPod/i.test(ua) && !(window as any).MSStream;
    const isFirefoxDevice = /Firefox|FxiOS/i.test(ua);
    setIsIOS(isIOSDevice);
    setIsFirefox(isFirefoxDevice);

    // Android / Chrome beforeinstallprompt event handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show prompt on iOS (any browser) or Firefox (Android/mobile)
    if (isIOSDevice || (isFirefoxDevice && /Android/i.test(ua))) {
      const timer = setTimeout(() => setShowPrompt(true), 2500);
      return () => clearTimeout(timer);
    }

    // App installed event handler
    const handleAppInstalled = () => {
      setInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      // Attempt to close the browser so the user opens the native app
      setTimeout(() => {
        try {
          window.close();
        } catch (e) {}
      }, 1500);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("seccion_pwa_prompt_dismissed", Date.now().toString());
  };

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      setInstalled(true);
      setShowPrompt(false);
      setTimeout(() => {
        try {
          window.close();
        } catch (e) {}
      }, 1500);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[9990] max-w-md mx-auto animate-in slide-in-from-bottom-6 fade-in duration-300">
      <div className="bg-gradient-to-b from-slate-900/95 via-purple-950/95 to-slate-950/95 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-5 shadow-2xl shadow-purple-950/60 text-white relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 shadow-lg shadow-black/50 shrink-0 flex items-center justify-center">
            <img
              src="/assets/logo/logo-mark.png"
              alt="SECCION Logo"
              className="w-full h-full object-contain p-2"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-base text-white">Install SECCION App</h3>
              <Sparkles className="w-4 h-4 text-pink-400 fill-pink-400/20" />
            </div>
            <p className="text-xs text-gray-300">
              {isIOS ? "Add to Home Screen for native experience" : isFirefox ? "Install via Firefox menu for native app" : "Fast, full-screen, offline-ready native app"}
            </p>
          </div>
        </div>

        {installed ? (
          <div className="flex items-center justify-center gap-2 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            App Installed Successfully!
          </div>
        ) : isIOS ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 mt-2 space-y-2 text-xs text-gray-300">
            <div className="flex items-center gap-2.5 text-purple-200">
              <div className="p-1.5 bg-purple-500/20 rounded-lg shrink-0">
                <Share className="w-4 h-4 text-purple-300" />
              </div>
              <span>1. Tap the <strong className="text-white">Share</strong> button in your iOS browser</span>
            </div>
            <div className="flex items-center gap-2.5 text-purple-200">
              <div className="p-1.5 bg-pink-500/20 rounded-lg shrink-0">
                <PlusSquare className="w-4 h-4 text-pink-300" />
              </div>
              <span>2. Select <strong className="text-white">Add to Home Screen</strong></span>
            </div>
          </div>
        ) : isFirefox ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 mt-2 space-y-2 text-xs text-gray-300">
            <div className="flex items-center gap-2.5 text-purple-200">
              <div className="p-1.5 bg-purple-500/20 rounded-lg shrink-0">
                <Share className="w-4 h-4 text-purple-300" />
              </div>
              <span>1. Tap the <strong className="text-white">Menu (⋮)</strong> button in Firefox</span>
            </div>
            <div className="flex items-center gap-2.5 text-purple-200">
              <div className="p-1.5 bg-pink-500/20 rounded-lg shrink-0">
                <PlusSquare className="w-4 h-4 text-pink-300" />
              </div>
              <span>2. Select <strong className="text-white">Install</strong> or <strong className="text-white">Add to Home screen</strong></span>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <button
              onClick={handleAndroidInstall}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold rounded-2xl shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Install Native App (1-Tap)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

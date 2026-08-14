"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, X, Compass, Smartphone } from "lucide-react";

export default function InAppBrowserDetector() {
  const [inAppInfo, setInAppInfo] = useState<{
    isInApp: boolean;
    isAndroid: boolean;
    isIOS: boolean;
    appName: string;
  }>({
    isInApp: false,
    isAndroid: false,
    isIOS: false,
    appName: "",
  });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent || navigator.vendor || "";
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);

    // Common In-App Browser signatures
    let appName = "";
    if (/Instagram/i.test(ua)) appName = "Instagram";
    else if (/FBAN|FBAV/i.test(ua)) appName = "Facebook";
    else if (/TikTok/i.test(ua)) appName = "TikTok";
    else if (/Telegram/i.test(ua)) appName = "Telegram";
    else if (/Twitter|TwitterAndroid/i.test(ua)) appName = "X (Twitter)";
    else if (/Snapchat/i.test(ua)) appName = "Snapchat";
    else if (/Line/i.test(ua)) appName = "Line";

    const isInApp = Boolean(appName);

    if (isInApp && !sessionStorage.getItem("seccion_inapp_dismissed")) {
      setInAppInfo({ isInApp, isAndroid, isIOS, appName });
    }
  }, []);

  if (!inAppInfo.isInApp || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("seccion_inapp_dismissed", "true");
  };

  const handleOpenExternalAndroid = () => {
    const rawUrl = window.location.href.replace(/^https?:\/\//, "");
    // Android Intent URL format to escape WebView into system Chrome browser
    const intentUrl = `intent://${rawUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intentUrl;
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-[9999] max-w-md mx-auto bg-gradient-to-r from-purple-950/90 via-slate-900/95 to-pink-950/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-2xl shadow-purple-950/50 text-white animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-purple-500/20 border border-purple-400/30 rounded-xl text-purple-300 shrink-0">
          {inAppInfo.isIOS ? <Compass className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm text-purple-100">
              Open in System Browser
            </h4>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-300 mt-1 leading-relaxed">
            You are viewing SECCION inside <span className="text-purple-300 font-medium">{inAppInfo.appName}</span>. Open in {inAppInfo.isAndroid ? "Chrome" : "Safari"} to install the native SECCION app.
          </p>

          <div className="mt-3 flex items-center gap-2">
            {inAppInfo.isAndroid ? (
              <button
                onClick={handleOpenExternalAndroid}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition-transform active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open in Chrome
              </button>
            ) : (
              <p className="text-[11px] text-pink-300 font-medium bg-pink-500/10 border border-pink-500/20 rounded-lg px-2.5 py-1.5 w-full text-center">
                Tap <span className="font-bold">⋮</span> or <span className="font-bold">🧭</span> at the bottom/top right to open in Safari
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

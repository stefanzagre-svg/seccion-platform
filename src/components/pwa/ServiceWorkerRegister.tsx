"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, RefreshCw, X } from "lucide-react";

export default function ServiceWorkerRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered with scope:", registration.scope);

          // Check if there's already a waiting worker (e.g. from previous background fetch)
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setUpdateAvailable(true);
          }

          // Listen for new service worker updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    console.log("[PWA] New update installed & ready!");
                    setWaitingWorker(installingWorker);
                    setUpdateAvailable(true);
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          console.warn("[PWA] Service Worker registration failed:", error);
        });

      // Handle controller change (reloads page seamlessly when new SW takes over)
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const handleApplyUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-md bg-[#0F0F1A]/95 border border-[#00fbfb]/50 backdrop-blur-2xl rounded-2xl p-4 shadow-[0_0_30px_rgba(0,251,251,0.3)] animate-slide-down text-white flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/30 text-[#00fbfb]">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-white">
            SECCION Update Ready
          </h4>
          <p className="text-[11px] text-white/70">
            A fresh platform update is available!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleApplyUpdate}
          className="px-3.5 py-2 bg-gradient-to-r from-primary to-emerald-400 text-black font-black uppercase text-[10px] tracking-wider rounded-xl hover:scale-105 active:scale-95 transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(102,252,241,0.4)] cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Update
        </button>

        <button
          type="button"
          onClick={() => setUpdateAvailable(false)}
          className="p-1.5 text-white/40 hover:text-white transition rounded-lg"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

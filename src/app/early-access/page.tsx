"use client";

import React from "react";
import PublicNavbar from "@/components/PublicNavbar";
import { WaitlistSignup } from "@/components/WaitlistSignup";
import AgeGateSplash from "@/components/onboarding/AgeGateSplash";

export default function EarlyAccessPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-4 relative overflow-hidden font-sans">
      <AgeGateSplash />
      <PublicNavbar />

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

      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#ffabf3]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00fbfb]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 pt-36 md:pt-40 pb-16 flex-grow flex flex-col justify-center">
        {/* Early Access form */}
        <WaitlistSignup variant="card" />
      </div>
    </div>
  );
}

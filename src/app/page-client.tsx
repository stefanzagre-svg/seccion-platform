"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import LandingPageHook from "@/components/onboarding/LandingPageHook";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare, Send, X, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PlatformFeed = dynamic(() => import('@/components/PlatformFeed'), {
  loading: () => (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
    </div>
  ),
});

import { useTranslation } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('archetype, lifestyle_habits')
            .eq('id', currentUser.id)
            .single();
          setOnboardingCompleted(!!(profile?.archetype && profile?.lifestyle_habits));
        } catch (err) {
          console.warn("Error checking onboarding status:", err);
          setOnboardingCompleted(false);
        }
      } else {
        setOnboardingCompleted(false);
      }
      setLoading(false);
    }
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('archetype, lifestyle_habits')
            .eq('id', currentUser.id)
            .single();
          setOnboardingCompleted(!!(profile?.archetype && profile?.lifestyle_habits));
        } catch (err) {
          console.warn("Error checking onboarding status on auth change:", err);
          setOnboardingCompleted(false);
        }
      } else {
        setOnboardingCompleted(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user && onboardingCompleted) {
    return <PlatformFeed />;
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col relative overflow-hidden">
      
      
      {/* Subtle Cyber Grid Texture over global background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>


      <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-4">
        <LandingPageHook
          onAccept={() => router.push("/early-access")}
          onBecomeCreator={() => router.push("/onboarding")}
        />
      </div>
    </div>
  );
}

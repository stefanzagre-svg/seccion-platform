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
    let isCancelled = false;

    // Safety timeout: Never let the page spinner hang indefinitely
    const safetyTimer = setTimeout(() => {
      if (!isCancelled) {
        setLoading(false);
      }
    }, 4000);

    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        if (isCancelled) return;
        
        if (currentUser) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('archetype, lifestyle_habits')
            .eq('id', currentUser.id)
            .maybeSingle();
          
          if (isCancelled) return;

          // If auth user exists but profile was deleted/doesn't exist, sign out cleanly
          if (!profile && error?.code === 'PGRST116' || (!profile && !error)) {
            console.warn("[page-client] Orphan auth session detected (no profile found). Signing out cleanly.");
            await supabase.auth.signOut();
            setUser(null);
            setOnboardingCompleted(false);
          } else {
            setUser(currentUser);
            setOnboardingCompleted(!!(profile?.archetype && profile?.lifestyle_habits));
          }
        } else {
          setUser(null);
          setOnboardingCompleted(false);
        }
      } catch (err) {
        console.warn("Error checking onboarding status:", err);
        if (!isCancelled) {
          setUser(null);
          setOnboardingCompleted(false);
        }
      } finally {
        if (!isCancelled) {
          clearTimeout(safetyTimer);
          setLoading(false);
        }
      }
    }
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isCancelled) return;
      const currentUser = session?.user || null;
      
      if (currentUser) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('archetype, lifestyle_habits')
            .eq('id', currentUser.id)
            .maybeSingle();

          if (isCancelled) return;

          if (!profile && error?.code === 'PGRST116' || (!profile && !error)) {
            console.warn("[page-client] Orphan auth session detected on state change. Signing out cleanly.");
            await supabase.auth.signOut();
            setUser(null);
            setOnboardingCompleted(false);
          } else {
            setUser(currentUser);
            setOnboardingCompleted(!!(profile?.archetype && profile?.lifestyle_habits));
          }
        } catch (err) {
          console.warn("Error checking onboarding status on auth change:", err);
          if (!isCancelled) {
            setUser(null);
            setOnboardingCompleted(false);
          }
        }
      } else {
        setUser(null);
        setOnboardingCompleted(false);
      }
    });

    return () => {
      isCancelled = true;
      clearTimeout(safetyTimer);
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

  if (user && !onboardingCompleted) {
    router.replace('/onboarding');
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
          onBecomeCreator={() => router.push("/become-creator")}
        />
      </div>
    </div>
  );
}

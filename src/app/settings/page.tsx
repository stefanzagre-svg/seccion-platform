"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, Lock, PauseCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getResilientSession, getResilientProfile } from "@/lib/supabase-safe";

export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    async function loadData() {
      const sessionData = await getResilientSession();
      if (sessionData?.user) {
        setCurrentUser(sessionData.user);
        const profile = await getResilientProfile(sessionData.user.id);
        if (profile) {
          setCurrentUserProfile(profile);
        }
      }
    }
    loadData();
  }, []);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;
    setIsDeletingAccount(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");
      
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      if (!res.ok) throw new Error("Failed to delete account");
      
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err) {
      console.error("Delete account error:", err);
      alert("Failed to delete account. Please try again or contact support.");
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-white/50 hover:text-white transition mb-8 text-sm font-bold uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </button>

      <div className="space-y-6 text-left">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-2 text-white">
              <Settings className="text-primary w-6 h-6" /> Account & App Preferences
            </h2>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">
              Configure your account settings, privacy gates, and app preferences.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Face Blur Settings */}
          <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1 pr-4 text-left">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Face Blur Privacy
                </h3>
                <p className="text-[10px] text-white/50 leading-relaxed font-semibold">
                  When active, your profile images will remain encrypted (blurred) for connections until you reach Level 3 relationship status.
                </p>
              </div>

              <button
                onClick={async () => {
                  const nextVal = !currentUserProfile?.face_blur_active;
                  if (currentUser) {
                    const { error } = await supabase
                      .from("profiles")
                      .update({ face_blur_active: nextVal })
                      .eq("id", currentUser.id);
                    if (error) {
                      console.error("Error updating face blur:", error);
                      return;
                    }
                  }
                  setCurrentUserProfile((prev: any) => ({
                    ...prev,
                    face_blur_active: nextVal
                  }));
                }}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shrink-0 ${
                  currentUserProfile?.face_blur_active
                    ? "bg-primary text-black shadow-[0_0_15px_rgba(102,252,241,0.4)] border border-primary/20"
                    : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                }`}
              >
                {currentUserProfile?.face_blur_active ? "Blur: Enabled" : "Blur: Disabled"}
              </button>
            </div>
          </div>

          {/* Pause Account */}
          <div className="glass-card p-6 bg-[#00fbfb]/5 border border-[#00fbfb]/20 rounded-3xl space-y-4 md:col-span-2 mt-4 text-left">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-1.5 flex-1 min-w-[240px]">
                <div className="flex items-center gap-2">
                  <PauseCircle className="w-5 h-5 text-[#00fbfb]" />
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                    🎮 Take a Breather (Pause Account)
                  </h3>
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-normal">
                  Going off-grid for a bit? Pausing your account hides your profile from new discovery feeds and matchmaking decks. Don't worry—your existing matches can still message you in your inbox, and your XP, vibes, and unlocked connections stay safe until you unpause!
                </p>
              </div>

              <button
                onClick={async () => {
                  const newPausedState = !currentUserProfile?.is_paused;
                  if (currentUser) {
                    await supabase
                      .from("profiles")
                      .update({ is_paused: newPausedState })
                      .eq("id", currentUser.id);
                  }
                  setCurrentUserProfile((prev: any) => ({
                    ...prev,
                    is_paused: newPausedState,
                  }));
                }}
                className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shrink-0 cursor-pointer ${
                  currentUserProfile?.is_paused
                    ? "bg-emerald-500 text-black shadow-emerald-500/20 hover:bg-emerald-400"
                    : "bg-[#00fbfb]/15 text-[#00fbfb] border border-[#00fbfb]/40 hover:bg-[#00fbfb]/30"
                }`}
              >
                {currentUserProfile?.is_paused ? "▶️ Resume Discovery (Unpause)" : "⏸️ Pause Account"}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-6 bg-red-900/10 border border-red-500/20 rounded-3xl space-y-4 md:col-span-2 mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 pr-4 text-left">
                <h3 className="text-xs font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Danger Zone
                </h3>
                <p className="text-[10px] text-red-400/70 leading-relaxed font-semibold">
                  Irreversibly delete your account, matches, media, and all personal data. This action cannot be undone.
                </p>
              </div>

              <button
                onClick={() => {
                  setDeleteConfirmation("");
                  setShowDeleteModal(true);
                }}
                className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shrink-0 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
              >
                Delete Account
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card bg-[#0c1017] border border-red-500/30 rounded-3xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold uppercase tracking-tighter text-red-500 mb-2">Delete Account</h2>
            <p className="text-sm text-white/70 mb-6">
              This action is permanent and cannot be undone. Please type <span className="text-red-400 font-bold">DELETE</span> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full bg-black/50 border border-red-500/30 rounded-xl px-4 py-3 text-white mb-6 focus:border-red-500 focus:outline-none"
              placeholder="Type DELETE"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== "DELETE" || isDeletingAccount}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold uppercase tracking-widest transition disabled:opacity-50"
              >
                {isDeletingAccount ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

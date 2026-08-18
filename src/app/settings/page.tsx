"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, Lock, PauseCircle, AlertCircle, ArrowLeft, Mic, Crown, Bell, Moon, Map, LifeBuoy, FileText, Shield, MessageSquare, ShieldCheck, Cpu, ExternalLink, QrCode, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getResilientSession, getResilientProfile } from "@/lib/supabase-safe";
import { useTranslation } from "@/context/LanguageContext";
import ZkpWalletGuideModal from "@/components/onboarding/ZkpWalletGuideModal";

export default function SettingsPage() {
  const { t: translate, locale } = useTranslation();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isZkpModalOpen, setIsZkpModalOpen] = useState(false);

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
      <ZkpWalletGuideModal isOpen={isZkpModalOpen} onClose={() => setIsZkpModalOpen(false)} />
      
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
              <Settings className="text-primary w-6 h-6" /> {translate("settings.title", "Account & App Preferences")}
            </h2>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">
              {translate("settings.subtitle", "Configure your account settings, privacy gates, and app preferences.")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Face Blur Settings */}
          <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1 pr-4 text-left">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Lock className="w-4 h-4" /> {translate("settings.face_blur", "Face Blur Privacy")}
                </h3>
                <p className="text-[10px] text-white/50 leading-relaxed font-semibold">
                  {translate("settings.face_blur_desc", "When active, your profile images will remain encrypted (blurred) for connections until you reach Level 3 relationship status.")}
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
                {currentUserProfile?.face_blur_active ? translate("settings.blur_enabled", "Blur: Enabled") : translate("settings.blur_disabled", "Blur: Disabled")}
              </button>
            </div>
          </div>

          {/* Age Verification & ZKP Identity Privacy Protocol */}
          <div className="glass-card p-6 bg-gradient-to-br from-[#00fbfb]/10 via-[#0a0f18] to-[#ffabf3]/10 border border-[#00fbfb]/30 rounded-3xl space-y-4 md:col-span-2 text-left">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-1.5 flex-1 min-w-[260px]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#00fbfb]/15 border border-[#00fbfb]/40 flex items-center justify-center text-[#00fbfb]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                      <span>{locale === 'es' ? 'Verificación de Edad & Protocolo ZKP' : 'Age Verification & ZKP Privacy'}</span>
                      <span className="text-[9px] font-mono bg-[#00fbfb]/20 text-[#00fbfb] px-2 py-0.5 rounded-full uppercase font-bold">
                        DSA Compliant
                      </span>
                    </h3>
                    <p className="text-[10px] text-[#00fbfb] font-mono">
                      {locale === 'es' ? 'Pruebas de Conocimiento Cero & Privacidad Soberana' : 'Zero-Knowledge Proofs & Sovereign Privacy'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed pt-1">
                  {locale === 'es'
                    ? 'SECCION cumple con la Ley de Servicios Digitales (DSA Art. 28) y las leyes internacionales. Puedes verificar tu mayoría de edad de forma 100% anónima conectando una billetera de identidad ZKP (Privado ID / Polygon ID / zkPass) sin subir tu documento de identidad ni compartir tu fecha de nacimiento.'
                    : 'SECCION complies with the EU Digital Services Act (DSA Art. 28) and international mandates. You can verify your legal age 100% anonymously using a ZKP identity wallet (Privado ID / Polygon ID / zkPass) with zero personal data leakage.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <button
                  onClick={() => setIsZkpModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#00fbfb] hover:bg-[#00fbfb]/90 text-black text-xs font-mono font-black uppercase tracking-wider transition shadow-[0_0_15px_rgba(0,251,251,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Cpu className="w-4 h-4" />
                  <span>{locale === 'es' ? 'Guía de Billeteras ZKP' : 'ZKP Wallet Guide'}</span>
                </button>
              </div>
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

          {/* {translate("settings.premium", "Premium Upgrades")} (Speech to Speech & VIP) */}
          <div className="glass-card p-6 bg-gradient-to-br from-[#ff00ff]/10 to-[#7c3aed]/10 border border-[#ff00ff]/20 rounded-3xl space-y-4 md:col-span-2 mt-4 text-left">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#ff00ff] flex items-center gap-2 mb-4">
              <Crown className="w-4 h-4" /> Premium Upgrades
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-accent" />
                  <span className="text-sm font-extrabold uppercase tracking-wider text-white">{translate("settings.speech", "Speech-to-Speech")}</span>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed font-semibold">
                  {translate("settings.speech_desc", "Unlock real-time voice cloning and speech-to-speech translation in 14 languages. Requires the Creator Ultimate Pack or an active promo.")}
                </p>
                <button className="w-full px-4 py-2 bg-[#ff00ff]/20 text-[#ff00ff] border border-[#ff00ff]/50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff00ff]/40 transition">
                  {translate("settings.unlock_btn", "Unlock Feature")}
                </button>
              </div>

              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-extrabold uppercase tracking-wider text-white">{translate("settings.vip", "VIP Subscription")}</span>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed font-semibold">
                  {translate("settings.vip_desc", "Get priority matchmaking, unlimited swipes, advanced read receipts, and exclusive profile badges.")}
                </p>
                <button className="w-full px-4 py-2 bg-yellow-400/20 text-yellow-400 border border-yellow-400/50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400/40 transition">
                  {translate("settings.upgrade_btn", "Upgrade to VIP")}
                </button>
              </div>
            </div>
          </div>

          {/* App Preferences */}
          <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-4 md:col-span-2 mt-4 text-left">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4" /> App Preferences
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Moon className="w-4 h-4 text-white/50" />
                  <span className="text-xs font-bold text-white/80">{translate("settings.theme", "Theme Display")}</span>
                </div>
                <select className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none">
                  <option>{translate("settings.dark_mode", "Dark Mode")}</option>
                  <option>{translate("settings.light_mode", "Light Mode")}</option>
                  <option>{translate("settings.system_default", "System Default")}</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Map className="w-4 h-4 text-white/50" />
                  <span className="text-xs font-bold text-white/80">{translate("settings.distance", "Distance Unit")}</span>
                </div>
                <select className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none">
                  <option>{translate("settings.km", "Kilometers (km)")}</option>
                  <option>{translate("settings.mi", "Miles (mi)")}</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-white/50" />
                  <span className="text-xs font-bold text-white/80">{translate("settings.notifications", "Notifications")}</span>
                </div>
                <button className="px-4 py-1.5 bg-white/10 text-white border border-white/20 rounded-lg text-xs font-bold hover:bg-white/20 transition">
                  Manage Alerts
                </button>
              </div>
            </div>
          </div>

          {/* {translate("settings.support_legal", "Support & Legal")} */}
          <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-4 md:col-span-2 mt-4 text-left">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2 mb-4">
              <LifeBuoy className="w-4 h-4" /> Support & Legal
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition border border-white/5 text-white/70 hover:text-white">
                <LifeBuoy className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{translate("settings.help", "Help & Support")}</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition border border-white/5 text-white/70 hover:text-white">
                <MessageSquare className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{translate("settings.contact", "Contact Us")}</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition border border-white/5 text-white/70 hover:text-white">
                <FileText className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{translate("settings.terms", "Terms of Service")}</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition border border-white/5 text-white/70 hover:text-white">
                <Shield className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{translate("settings.privacy", "Privacy Policy")}</span>
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
                  {translate("settings.delete_desc", "Irreversibly delete your account, matches, media, and all personal data. This action cannot be undone.")}
                </p>
              </div>

              <button
                onClick={() => {
                  setDeleteConfirmation("");
                  setShowDeleteModal(true);
                }}
                className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shrink-0 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
              > {translate("settings.delete_btn", "Delete Account")} </button>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card bg-[#0c1017] border border-red-500/30 rounded-3xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold uppercase tracking-tighter text-red-500 mb-2"> {translate("settings.delete_btn", "Delete Account")} </h2>
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

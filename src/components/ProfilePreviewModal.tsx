"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Sparkles, Heart, MapPin, Globe, Eye, Lock, Users, Compass } from "lucide-react";
import { ARCHETYPES } from "@/components/ArchetypeSelector";

interface ProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
    archetype?: string;
    core_passion?: string;
    bio_prompt_answer?: string;
    bio_prompt_answer_2?: string;
    bio_prompt_question?: string;
    bio_prompt_question_2?: string;
    privacy_settings?: any;
    spoken_languages?: string[];
    album_photos?: string[];
    relationship_goals?: string[];
    relationship_types?: string[];
    sexual_preferences?: string[];
    family_goals?: string;
    hobbies?: string[];
    role?: string;
  };
}

export default function ProfilePreviewModal({
  isOpen,
  onClose,
  profile,
}: ProfilePreviewModalProps) {
  if (!isOpen) return null;

  const archetypeObj = ARCHETYPES.find((a) => a.id === profile.archetype);
  const displayAge = profile.privacy_settings?.display_age || "18+";
  const languages = profile.spoken_languages && profile.spoken_languages.length > 0
    ? profile.spoken_languages
    : ["English"];

  const hiddenValues = profile.privacy_settings?.hidden_values || {};
  const isFieldHidden = (fieldKey: string) => {
    return !!(hiddenValues[fieldKey] && Object.keys(hiddenValues[fieldKey]).length > 0);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-[#0d111a] border border-[#00fbfb]/40 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,251,251,0.2)] overflow-hidden max-h-[90vh] flex flex-col text-left"
        >
          {/* Header Bar */}
          <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#00fbfb]" />
              <span className="text-xs font-black uppercase tracking-wider text-[#00fbfb]">
                Public Profile Preview
              </span>
              <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full text-white/60 font-mono">
                How others see you
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
            
            {/* Top Card / Hero */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-black/60 via-black/40 to-[#121622] p-5">
              <div className="flex items-center gap-4">
                {/* Main Avatar */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#00fbfb]/60 shrink-0 shadow-[0_0_20px_rgba(0,251,251,0.3)]">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || "Avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center text-2xl font-bold text-white">
                      {(profile.display_name || "U")[0]}
                    </div>
                  )}
                </div>

                {/* Name & Badges */}
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white tracking-tight truncate">
                      {profile.display_name || "Anonymous Member"}
                    </h3>
                    <span className="text-xs font-bold text-[#00fbfb] bg-[#00fbfb]/10 border border-[#00fbfb]/30 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3 h-3" /> {displayAge}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 font-mono">
                    @{profile.username || "seccion_member"}
                  </p>
                  
                  {profile.core_passion && (
                    <div className="pt-1">
                      <span className="text-[10px] bg-primary/10 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
                        🔥 {profile.core_passion}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Archetype Aura Card */}
            {archetypeObj && (
              <div className={`p-5 rounded-3xl border bg-gradient-to-b ${archetypeObj.color} border-white/10 space-y-2`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{archetypeObj.icon}</span>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary block">
                      Archetype Synergy
                    </span>
                    <h4 className="text-base font-extrabold text-white">{archetypeObj.title}</h4>
                  </div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">{archetypeObj.description}</p>
              </div>
            )}

            {/* Connection Preferences (Goals, Types, Sexual Prefs) */}
            <div className="space-y-4 pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-primary" /> Connection Desires
              </span>

              {/* Relationship Goals */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] font-black uppercase text-white/60 tracking-wider">Relationship Goals</span>
                {isFieldHidden("relationship_goals") ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-xl">
                    <Lock className="w-3.5 h-3.5" /> Hidden Info (Requires higher level)
                  </div>
                ) : profile.relationship_goals && profile.relationship_goals.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.relationship_goals.map((goal, i) => (
                      <span key={i} className="text-xs bg-white/10 text-white px-3 py-1 rounded-xl font-bold uppercase tracking-wider">
                        {goal}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 italic">Not specified</p>
                )}
              </div>

              {/* Relationship Types */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] font-black uppercase text-primary tracking-wider">Relationship Types</span>
                {isFieldHidden("relationship_types") ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-xl">
                    <Lock className="w-3.5 h-3.5" /> Hidden Info (Requires higher level)
                  </div>
                ) : profile.relationship_types && profile.relationship_types.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.relationship_types.map((type, i) => (
                      <span key={i} className="text-xs bg-primary/15 text-primary border border-primary/30 px-3 py-1 rounded-xl font-bold uppercase tracking-wider">
                        {type}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 italic">Monogamous</p>
                )}
              </div>

              {/* Sexual Preferences */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] font-black uppercase text-accent tracking-wider">Sexual Preferences</span>
                {isFieldHidden("sexual_preferences") ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-xl">
                    <Lock className="w-3.5 h-3.5" /> Hidden Info (Requires higher level)
                  </div>
                ) : profile.sexual_preferences && profile.sexual_preferences.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.sexual_preferences.map((pref, i) => (
                      <span key={i} className="text-xs bg-accent/15 text-accent border border-accent/30 px-3 py-1 rounded-xl font-bold uppercase tracking-wider">
                        {pref}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 italic">Open to all</p>
                )}
              </div>
            </div>

            {/* Lifestyle, Family & Hobbies */}
            <div className="space-y-4 pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#00fbfb]" /> Lifestyle & Vibe
              </span>

              {/* Family Goals */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] font-black uppercase text-white/60 tracking-wider">Family Goals</span>
                {isFieldHidden("familyGoals") ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-xl">
                    <Lock className="w-3.5 h-3.5" /> Hidden Info (Requires higher level)
                  </div>
                ) : (
                  <span className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider inline-block">
                    {profile.family_goals || "Open to children"}
                  </span>
                )}
              </div>

              {/* Hobbies */}
              {profile.hobbies && profile.hobbies.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[10px] font-black uppercase text-white/60 tracking-wider">Hobbies & Passions</span>
                  {isFieldHidden("hobbies") ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-xl">
                      <Lock className="w-3.5 h-3.5" /> Hidden Info (Requires higher level)
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.hobbies.map((h, i) => (
                        <span key={i} className="text-xs bg-white/5 border border-white/10 text-white/80 px-3 py-1 rounded-xl font-medium">
                          ⚡ {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Spoken Languages */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#00fbfb]" /> Spoken Languages
              </span>
              <div className="flex flex-wrap gap-1.5">
                {languages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white/5 border border-white/10 text-white/90 px-3 py-1 rounded-full font-medium"
                  >
                    {idx === 0 ? `🗣️ ${lang} (Primary)` : `🌐 ${lang}`}
                  </span>
                ))}
              </div>
            </div>

            {/* Relational Prompts Preview */}
            {(profile.bio_prompt_answer || profile.bio_prompt_answer_2) && (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Relational Answers
                </span>
                
                {profile.bio_prompt_answer && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <p className="text-xs font-bold text-primary">
                      {profile.bio_prompt_question || "What is your dream first date?"}
                    </p>
                    {isFieldHidden("bio_prompt_answer") ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-xl">
                        <Lock className="w-3.5 h-3.5" /> Hidden Info (Requires higher level)
                      </div>
                    ) : (
                      <p className="text-xs text-white/80 leading-relaxed italic">
                        "{profile.bio_prompt_answer}"
                      </p>
                    )}
                  </div>
                )}

                {profile.bio_prompt_answer_2 && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <p className="text-xs font-bold text-accent">
                      {profile.bio_prompt_question_2 || "What is your biggest green flag?"}
                    </p>
                    {isFieldHidden("bio_prompt_answer_2") ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-xl">
                        <Lock className="w-3.5 h-3.5" /> Hidden Info (Requires higher level)
                      </div>
                    ) : (
                      <p className="text-xs text-white/80 leading-relaxed italic">
                        "{profile.bio_prompt_answer_2}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Public Album Preview */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                  🖼️ Public Album ({profile.album_photos?.length || 0} Photos)
                </span>
                <span className="text-[9px] text-[#00fbfb] font-mono">Visible to all members</span>
              </div>

              {profile.album_photos && profile.album_photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {profile.album_photos.map((url, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                      <img src={url} alt={`Album ${i+1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-dashed border-white/10 bg-white/2 text-center text-xs text-white/40">
                  No public album photos added yet.
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 bg-white/5 border-t border-white/10 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-primary text-black font-black uppercase tracking-wider text-xs rounded-full shadow-[0_0_20px_rgba(0,251,251,0.4)]"
            >
              Close Preview
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}

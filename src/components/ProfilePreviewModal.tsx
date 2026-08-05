"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Sparkles, Heart, Globe, Eye, Lock, Users, Briefcase, GraduationCap, Moon, BookOpen, Video, Image as ImageIcon } from "lucide-react";
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
    album_media?: any[];
    relationship_goals?: string[];
    relationship_types?: string[];
    sexual_preferences?: string[];
    family_goals?: string;
    hobbies?: string[];
    role?: string;
    education_level?: string;
    career?: string;
    astro_sign?: string;
    habits?: string[];
    bio?: string;
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
  const getHiddenCount = (fieldKey: string) => {
    return hiddenValues[fieldKey] ? Object.keys(hiddenValues[fieldKey]).length : 0;
  };

  const renderHiddenBadge = (count: number) => {
    if (count === 0) return null;
    const label = count === 1 ? "Hidden" : `Hidden +${count}`;
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-xl shrink-0">
        <Lock className="w-3 h-3" /> {label}
      </div>
    );
  };

  // Determine media to show. Prioritize album_media array (which includes video metadata)
  const mediaItems = profile.album_media && profile.album_media.length > 0 
    ? profile.album_media 
    : (profile.album_photos || []).map((url) => ({ media_type: "image", media_url: url }));

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
                {translate("profile.public_preview", "Public Profile Preview")}
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
          <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
            
            {/* PUBLIC ALBUM (PRIORITIZED AT TOP) */}
            {mediaItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-white/70 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#00fbfb]" /> Media Album ({mediaItems.length})
                  </span>
                  <span className="text-[9px] text-[#00fbfb] font-mono border border-[#00fbfb]/30 px-2 py-0.5 rounded bg-[#00fbfb]/10">Visible to all</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {mediaItems.map((media: any, i: number) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/40 relative group">
                      {media.media_type === "video" ? (
                        <>
                          <Video className="w-6 h-6 text-white/50 absolute top-2 right-2 z-10" />
                          <video 
                            src={media.video_start_time != null && media.video_end_time != null ? `${media.media_url}#t=${media.video_start_time},${media.video_end_time}` : media.media_url} 
                            className="w-full h-full object-cover" 
                            muted 
                            loop 
                            autoPlay 
                            playsInline 
                          />
                        </>
                      ) : (
                        <img src={media.media_url || media.url} alt={`Album ${i+1}`} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CORE IDENTITY SECTION */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#00fbfb] flex items-center gap-2 border-b border-white/10 pb-2">
                Core Identity
              </h3>

              {/* Hero Card */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-black/60 via-black/40 to-[#121622] p-5">
                <div className="flex items-center gap-4">
                  {/* Main Avatar */}
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#00fbfb]/60 shrink-0 shadow-[0_0_20px_rgba(0,251,251,0.3)] bg-[#1a1a24]">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.display_name || "Avatar"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center text-3xl font-bold text-[#00fbfb]">
                        {(profile.display_name || profile.username || "U")[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Name & Badges */}
                  <div className="space-y-1.5 overflow-hidden flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-black text-white tracking-tight truncate">
                        {profile.display_name || `@${profile.username || "member"}`}
                      </h3>
                      <span className="text-xs font-bold text-[#00fbfb] bg-[#00fbfb]/10 border border-[#00fbfb]/30 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <ShieldCheck className="w-3 h-3" /> {displayAge}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 font-mono">
                      @{profile.username || "seccion_member"}
                    </p>
                    
                    {profile.core_passion && (
                      <div className="pt-2 flex items-center gap-2">
                        <span className="text-[10px] bg-primary/10 text-primary border border-primary/30 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-block">
                          🔥 {profile.core_passion}
                        </span>
                        {renderHiddenBadge(getHiddenCount("core_passion"))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio & Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.bio && (
                  <div className="md:col-span-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] font-black uppercase text-white/50 tracking-wider flex items-center gap-1.5 mb-2">
                      <BookOpen className="w-3 h-3" /> Biography
                    </span>
                    <div className="flex items-start justify-between gap-4">
                      {!hiddenValues["bio"]?.[profile.bio] && (
                        <p className="text-xs text-white/80 leading-relaxed italic border-l-2 border-primary/50 pl-3">"{profile.bio}"</p>
                      )}
                      {renderHiddenBadge(getHiddenCount("bio"))}
                    </div>
                  </div>
                )}

                {profile.education_level && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-black uppercase text-white/50 tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-3 h-3 text-[#00fbfb]" /> Education
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      {!hiddenValues["education_level"]?.[profile.education_level] && (
                        <span className="text-xs font-semibold text-white/90">{profile.education_level}</span>
                      )}
                      {renderHiddenBadge(getHiddenCount("education_level"))}
                    </div>
                  </div>
                )}

                {profile.career && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-black uppercase text-white/50 tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3 text-[#00fbfb]" /> Career / Passion
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      {!hiddenValues["career"]?.[profile.career] && (
                        <span className="text-xs font-semibold text-white/90">{profile.career}</span>
                      )}
                      {renderHiddenBadge(getHiddenCount("career"))}
                    </div>
                  </div>
                )}
              </div>

              {/* Spoken Languages */}
              {languages.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[10px] font-black uppercase text-white/50 tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-[#00fbfb]" /> Languages
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {languages.filter(l => !hiddenValues["spoken_languages"]?.[l]).map((lang, idx) => (
                      <span key={idx} className="text-xs bg-white/10 text-white px-3 py-1 rounded-full font-medium">
                        {idx === 0 ? `🗣️ ${lang}` : `🌐 ${lang}`}
                      </span>
                    ))}
                    {renderHiddenBadge(getHiddenCount("spoken_languages"))}
                  </div>
                </div>
              )}
            </div>


            {/* RELATIONAL INSIGHTS SECTION */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 border-b border-white/10 pb-2">
                Relational Insights
              </h3>

              {/* Archetype & Astro */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {archetypeObj && (
                  <div className={`p-4 rounded-2xl border bg-gradient-to-br ${archetypeObj.color} border-white/10 flex flex-col justify-center`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{archetypeObj.icon}</span>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary block">
                            Archetype
                          </span>
                          <h4 className="text-sm font-extrabold text-white">{archetypeObj.title}</h4>
                        </div>
                      </div>
                      {renderHiddenBadge(getHiddenCount("archetype"))}
                    </div>
                  </div>
                )}

                {profile.astro_sign && (
                  <div className="p-4 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/30 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#7c3aed] flex items-center gap-1.5">
                          <Moon className="w-3 h-3" /> Astro Sign
                        </span>
                        {!hiddenValues["astro_sign"]?.[profile.astro_sign] && (
                          <h4 className="text-sm font-extrabold text-white">{profile.astro_sign}</h4>
                        )}
                      </div>
                      {renderHiddenBadge(getHiddenCount("astro_sign"))}
                    </div>
                  </div>
                )}
              </div>

              {/* {translate("profile.connection_desires", "Connection Desires")} */}
              {((profile.relationship_goals && profile.relationship_goals.length > 0) || 
                (profile.relationship_types && profile.relationship_types.length > 0) || 
                (profile.sexual_preferences && profile.sexual_preferences.length > 0) || 
                profile.family_goals) && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <span className="text-[10px] font-black uppercase text-white/50 tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Heart className="w-3 h-3 text-primary" /> Connection Desires
                  </span>

                  {profile.relationship_goals && profile.relationship_goals.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase text-white/40">Looking For</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {profile.relationship_goals.filter(g => !hiddenValues["relationship_goals"]?.[g]).map((goal, i) => (
                          <span key={i} className="text-[10px] bg-white/10 text-white px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                            {goal}
                          </span>
                        ))}
                        {renderHiddenBadge(getHiddenCount("relationship_goals"))}
                      </div>
                    </div>
                  )}

                  {profile.relationship_types && profile.relationship_types.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase text-primary/70">Relationship Type</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {profile.relationship_types.filter(t => !hiddenValues["relationship_types"]?.[t]).map((type, i) => (
                          <span key={i} className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                            {type}
                          </span>
                        ))}
                        {renderHiddenBadge(getHiddenCount("relationship_types"))}
                      </div>
                    </div>
                  )}

                  {profile.sexual_preferences && profile.sexual_preferences.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase text-[#ff00ff]/70">{translate("profile.preferences", "Preferences")}</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {profile.sexual_preferences.filter(p => !hiddenValues["sexual_preferences"]?.[p]).map((pref, i) => (
                          <span key={i} className="text-[10px] bg-[#ff00ff]/10 text-[#ff00ff] border border-[#ff00ff]/20 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                            {pref}
                          </span>
                        ))}
                        {renderHiddenBadge(getHiddenCount("sexual_preferences"))}
                      </div>
                    </div>
                  )}

                  {profile.family_goals && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase text-emerald-400/70">Family Goals</span>
                      <div className="flex items-center gap-2">
                        {!hiddenValues["family_goals"]?.[profile.family_goals] && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                            {profile.family_goals}
                          </span>
                        )}
                        {renderHiddenBadge(getHiddenCount("family_goals"))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hobbies & Habits */}
              {((profile.hobbies && profile.hobbies.length > 0) || (profile.habits && profile.habits.length > 0)) && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <span className="text-[10px] font-black uppercase text-white/50 tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Users className="w-3 h-3 text-[#00fbfb]" /> Lifestyle
                  </span>

                  {profile.hobbies && profile.hobbies.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase text-white/40">Hobbies & Passions</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {profile.hobbies.filter(h => !hiddenValues["hobbies"]?.[h]).map((h, i) => (
                          <span key={i} className="text-[10px] bg-white/10 text-white/90 px-2.5 py-1 rounded-full font-medium">
                            ⚡ {h}
                          </span>
                        ))}
                        {renderHiddenBadge(getHiddenCount("hobbies"))}
                      </div>
                    </div>
                  )}

                  {profile.habits && profile.habits.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase text-white/40">Habits</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {profile.habits.filter(h => !hiddenValues["habits"]?.[h]).map((h, i) => (
                          <span key={i} className="text-[10px] border border-white/20 text-white/70 px-2.5 py-1 rounded-full font-medium">
                            {h}
                          </span>
                        ))}
                        {renderHiddenBadge(getHiddenCount("habits"))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* {translate("profile.relational_prompts", "Relational Prompts")} */}
              {(profile.bio_prompt_answer || profile.bio_prompt_answer_2) && (
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Prompt Answers
                  </span>
                  
                  {profile.bio_prompt_answer && (
                    <div className="p-4 rounded-2xl bg-black/40 border border-primary/20 space-y-1.5">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                        {profile.bio_prompt_question || "What is your dream first date?"}
                      </p>
                      <div className="flex items-center gap-2">
                        {!hiddenValues["bio_prompt_answer"]?.[profile.bio_prompt_answer] && (
                          <p className="text-sm text-white leading-relaxed italic">
                            "{profile.bio_prompt_answer}"
                          </p>
                        )}
                        {renderHiddenBadge(getHiddenCount("bio_prompt_answer"))}
                      </div>
                    </div>
                  )}

                  {profile.bio_prompt_answer_2 && (
                    <div className="p-4 rounded-2xl bg-black/40 border border-[#ff00ff]/20 space-y-1.5">
                      <p className="text-[10px] font-bold text-[#ff00ff] uppercase tracking-widest">
                        {profile.bio_prompt_question_2 || "What is your biggest green flag?"}
                      </p>
                      <div className="flex items-center gap-2">
                        {!hiddenValues["bio_prompt_answer_2"]?.[profile.bio_prompt_answer_2] && (
                          <p className="text-sm text-white leading-relaxed italic">
                            "{profile.bio_prompt_answer_2}"
                          </p>
                        )}
                        {renderHiddenBadge(getHiddenCount("bio_prompt_answer_2"))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white/5 border-t border-white/10 text-center shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-primary text-black font-black uppercase tracking-wider text-xs rounded-full shadow-[0_0_20px_rgba(0,251,251,0.4)] transition hover:scale-105"
            >
              Close Preview
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}

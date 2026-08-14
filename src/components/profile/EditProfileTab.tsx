"use client";

import React from "react";
import { Heart, Users, User, Edit3, Briefcase, Star, ChevronDown, Book, GraduationCap, Sparkles, Ruler, MapPin, Globe, Lock } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import {
  RELATIONSHIP_GOALS,
  RELATIONSHIP_TYPES,
  SEXUAL_PREFERENCES,
  FAMILY_GOALS,
  HOBBIES,
  LANGUAGES,
  HABIT_CHOICES,
  EDUCATION_LEVELS,
  ASTRO_SIGNS,
} from "@/lib/constants";

interface EditProfileTabProps {
  mappedCurrentUser: any;
  currentUserProfile: any;
  handleOpenMultiSelect: (fieldKey: string, title: string, options: string[], initialSelected: string[]) => void;
  renderPrivacyToggle: (fieldKey: string, value: string) => React.ReactNode;
  handleCycleFamilyGoals: () => void;
  handleUpdateHabit: (category: string, value: string) => void;
  handleUpdateProfileField?: (field: string, value: any) => void;
}

export default function EditProfileTab({
  mappedCurrentUser,
  currentUserProfile,
  handleOpenMultiSelect,
  renderPrivacyToggle,
  handleCycleFamilyGoals,
  handleUpdateHabit,
  handleUpdateProfileField,
}: EditProfileTabProps) {
  const { t: translate } = useTranslation();
  const HABIT_CATEGORIES = Object.keys(HABIT_CHOICES);
  const currentLifestyle = currentUserProfile?.lifestyle_habits || {};

  const handleCycleSingleField = (field: string, currentValue: string, options: string[]) => {
    if (!handleUpdateProfileField) return;
    const currentIndex = options.indexOf(currentValue || "");
    const nextIndex = (currentIndex + 1) % options.length;
    handleUpdateProfileField(field, options[nextIndex]);
  };

  return (
    <div className="space-y-8 text-left">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-2 text-white">
            <Edit3 className="text-primary w-6 h-6" /> Edit Profile
          </h2>
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">
            Build your matchmaking profile. Organized for engine accuracy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* SECTION A: CORE IDENTITY & INTENT */}
        <div className="space-y-6">
          <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-primary/20 transition-all duration-700"></div>
            
            <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <User className="w-5 h-5" /> Core Identity
            </h3>
            
            <div className="space-y-5 relative z-10">
              
              {/* Bio Field (Textarea) */}
              <div>
                 <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase text-white/80 tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/45" /> About Me</p>
                 </div>
                 <textarea
                   className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[12px] text-white placeholder-white/30 focus:border-primary focus:ring-1 focus:ring-primary/50 transition resize-none h-24"
                   placeholder="A brief bio about yourself..."
                   value={currentUserProfile?.bio || ""}
                   onChange={(e) => handleUpdateProfileField && handleUpdateProfileField("bio", e.target.value)}
                 />
              </div>

              {/* Education Level */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase text-white/80 tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/45" /> Education</p>
                </div>
                <button
                  onClick={() => handleCycleSingleField("education_level", currentUserProfile?.education_level, EDUCATION_LEVELS)}
                  className="flex items-center gap-2 text-[11px] text-white/90 font-bold tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 cursor-pointer hover:border-white/30 transition w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-white/60" />
                    {currentUserProfile?.education_level || "Not specified"}
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/40" />
                </button>
              </div>

              {/* Height */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase text-white/80 tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/45" /> Height</p>
                </div>
                <div className="relative flex items-center">
                  <Ruler className="w-4 h-4 text-white/40 absolute left-3 pointer-events-none" />
                  <input
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-9 pr-3 text-[12px] text-white placeholder-white/30 focus:border-primary focus:ring-1 focus:ring-primary/50 transition"
                    placeholder="E.g. 178 cm / 5'10&quot;"
                    value={currentUserProfile?.height || mappedCurrentUser?.height || ""}
                    onChange={(e) => handleUpdateProfileField && handleUpdateProfileField("height", e.target.value)}
                  />
                </div>
              </div>

              {/* Current Location */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase text-white/80 tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/45" /> Current Location</p>
                  {renderPrivacyToggle("location", "all")}
                </div>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-white/40 absolute left-3 pointer-events-none" />
                  <input
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-9 pr-3 text-[12px] text-white placeholder-white/30 focus:border-primary focus:ring-1 focus:ring-primary/50 transition"
                    placeholder="E.g. Miami, USA"
                    value={currentUserProfile?.location || currentUserProfile?.residence || mappedCurrentUser?.location || ""}
                    onChange={(e) => handleUpdateProfileField && handleUpdateProfileField("location", e.target.value)}
                  />
                </div>
              </div>

              {/* Originally From (City, Country) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase text-white/80 tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/45" /> Originally From (City, Country)</p>
                </div>
                <div className="relative flex items-center">
                  <Globe className="w-4 h-4 text-white/40 absolute left-3 pointer-events-none" />
                  <input
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-9 pr-3 text-[12px] text-white placeholder-white/30 focus:border-primary focus:ring-1 focus:ring-primary/50 transition"
                    placeholder="E.g. Medellín, Colombia"
                    value={currentUserProfile?.origins || currentUserProfile?.native_town || mappedCurrentUser?.origins || ""}
                    onChange={(e) => handleUpdateProfileField && handleUpdateProfileField("origins", e.target.value)}
                  />
                </div>
              </div>

              {/* Sexual Preferences */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent" /> Sexual Preferences</p>
                  {renderPrivacyToggle("sexual_preferences", "all")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(mappedCurrentUser.sexualPreferences && mappedCurrentUser.sexualPreferences.length > 0 ? mappedCurrentUser.sexualPreferences : ["Add Preference"]).map((pref: string, idx: number) => (
                    <span 
                      key={idx}
                      onClick={() => handleOpenMultiSelect("sexual_preferences", "Sexual Preferences", SEXUAL_PREFERENCES, mappedCurrentUser.sexualPreferences || [])}
                      className="text-[11px] bg-accent/10 hover:bg-accent/20 text-accent font-bold tracking-widest px-3 py-1.5 rounded-xl border border-accent/25 cursor-pointer hover:border-accent transition flex items-center gap-1"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase text-white/80 tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/45" /> Languages</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(mappedCurrentUser.favoriteLanguages && mappedCurrentUser.favoriteLanguages.length > 0 ? mappedCurrentUser.favoriteLanguages : ["Add Primary Language"]).map((lang: string) => (
                    <span 
                      key={lang}
                      onClick={() => handleOpenMultiSelect("favorite_languages", "Favorite Language(s)", LANGUAGES, mappedCurrentUser.favoriteLanguages || [])}
                      className="text-[11px] text-primary font-bold tracking-widest bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 cursor-pointer hover:border-primary transition"
                    >
                      {lang}
                    </span>
                  ))}
                  {(mappedCurrentUser.additionalLanguages && mappedCurrentUser.additionalLanguages.length > 0 ? mappedCurrentUser.additionalLanguages : []).map((lang: string) => (
                    <span 
                      key={lang}
                      onClick={() => handleOpenMultiSelect("additional_languages", "Additional Language(s)", LANGUAGES, mappedCurrentUser.additionalLanguages || [])}
                      className="text-[11px] text-white/70 font-bold tracking-widest bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 cursor-pointer hover:border-white transition"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6 relative overflow-hidden group">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Heart className="w-5 h-5" /> Relationship Intent
            </h3>
            
            <div className="space-y-5 relative z-10">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase text-white/80 tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white" /> Relationship Goals</p>
                  {renderPrivacyToggle("relationship_goals", "all")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(mappedCurrentUser.relationshipGoals && mappedCurrentUser.relationshipGoals.length > 0 ? mappedCurrentUser.relationshipGoals : ["Add Goal"]).map((goal: string, idx: number) => (
                    <span 
                      key={idx}
                      onClick={() => handleOpenMultiSelect("relationship_goals", "Relationship Goals", RELATIONSHIP_GOALS, mappedCurrentUser.relationshipGoals || [])}
                      className="text-[11px] bg-white/5 hover:bg-white/10 text-white font-bold tracking-widest px-3 py-1.5 rounded-xl border border-white/10 cursor-pointer hover:border-primary transition flex items-center gap-1"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Relationship Types</p>
                  {renderPrivacyToggle("relationship_types", "all")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(mappedCurrentUser.relationshipTypes && mappedCurrentUser.relationshipTypes.length > 0 ? mappedCurrentUser.relationshipTypes : ["Add Type"]).map((type: string, idx: number) => (
                    <span 
                      key={idx}
                      onClick={() => handleOpenMultiSelect("relationship_types", "Relationship Types", RELATIONSHIP_TYPES, mappedCurrentUser.relationshipTypes || [])}
                      className="text-[11px] bg-primary/10 hover:bg-primary/20 text-primary font-bold tracking-widest px-3 py-1.5 rounded-xl border border-primary/25 cursor-pointer hover:border-primary transition flex items-center gap-1"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent" /> Family Plan</p>
                </div>
                <button
                  onClick={handleCycleFamilyGoals}
                  className="flex items-center gap-2 text-[11px] text-white/90 font-bold tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 cursor-pointer hover:text-accent hover:border-accent transition w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    {mappedCurrentUser.familyGoals || "Not specified"}
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/40" />
                </button>
              </div>
            </div>
          </div>

          {/* SENSITIVE PURPOSE FIELDS */}
          <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6 relative overflow-hidden group">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Lock className="w-5 h-5" /> Verified & Sensitive
            </h3>
            
            <div className="space-y-5 relative z-10">
              {/* Age */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase text-white/80 tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/45" /> Age</p>
                  {renderPrivacyToggle("age", "all")}
                </div>
                <div className="relative flex items-center">
                  <div className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-3 text-[12px] text-white/60">
                    {mappedCurrentUser?.age ? `${mappedCurrentUser.age} years old (Verified via KYC)` : "Verified via KYC"}
                  </div>
                </div>
              </div>

              {/* Income Bracket */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase text-white/80 tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/45" /> Income Bracket (Growth)</p>
                  {renderPrivacyToggle("income_bracket", "all")}
                </div>
                <button
                  onClick={() => handleCycleSingleField("income_bracket", currentUserProfile?.income_bracket, ["$0-$50k", "$50k-$100k", "$100k-$250k", "$250k+"])}
                  className="flex items-center gap-2 text-[11px] text-white/90 font-bold tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 cursor-pointer hover:border-white/30 transition w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    {currentUserProfile?.income_bracket || "Not specified"}
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/40" />
                </button>
              </div>

              {/* NSFW Boundaries */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent" /> Explicit Boundaries</p>
                  {renderPrivacyToggle("nsfw_boundaries", "all")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(currentUserProfile?.nsfw_boundaries && currentUserProfile.nsfw_boundaries.length > 0 ? currentUserProfile.nsfw_boundaries : ["Add Boundaries"]).map((boundary: string, idx: number) => (
                    <span 
                      key={idx}
                      onClick={() => handleOpenMultiSelect("nsfw_boundaries", "Explicit Boundaries", ["No Nudity", "Artistic Nudity", "Implied", "Full Explicit", "Fetish/Kink"], currentUserProfile?.nsfw_boundaries || [])}
                      className="text-[11px] bg-accent/10 hover:bg-accent/20 text-accent font-bold tracking-widest px-3 py-1.5 rounded-xl border border-accent/25 cursor-pointer hover:border-accent transition flex items-center gap-1"
                    >
                      {boundary}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B: RELATION INSIGHTS */}
        <div className="space-y-6">
          <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6 relative overflow-hidden group h-full">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none group-hover:bg-accent/20 transition-all duration-700"></div>

            <h3 className="text-sm font-black uppercase tracking-widest text-accent flex items-center gap-2 relative z-10">
              <Star className="w-5 h-5" /> Relation Insights
            </h3>

            <div className="space-y-6 relative z-10">
              
              {/* Astro Sign */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase text-white/80 tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/45" /> Astrology Sign</p>
                </div>
                <button
                  onClick={() => handleCycleSingleField("astro_sign", currentUserProfile?.astro_sign, ASTRO_SIGNS)}
                  className="flex items-center gap-2 text-[11px] text-white/90 font-bold tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 cursor-pointer hover:border-accent transition w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    {currentUserProfile?.astro_sign || "Not specified"}
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/40" />
                </button>
              </div>

              {/* Hobbies */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase text-white/80 tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/45" /> Hobbies & Interests</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(mappedCurrentUser.hobbies && mappedCurrentUser.hobbies.length > 0 ? mappedCurrentUser.hobbies : ["Add Hobbies"]).map((hobby: string) => (
                    <span 
                      key={hobby}
                      onClick={() => handleOpenMultiSelect("hobbies", "Hobbies & Interests", HOBBIES, mappedCurrentUser.hobbies || [])}
                      className="text-[11px] bg-white/5 hover:bg-white/10 text-white/90 font-bold tracking-widest px-3 py-1.5 rounded-xl border border-white/10 cursor-pointer hover:border-primary transition flex items-center gap-1"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>

              {/* Habits */}
              <div className="border-t border-white/5 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">{translate("profile.lifestyle_habits", "Lifestyle & Habits")}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {HABIT_CATEGORIES.map((category) => {
                    const currentValue = currentLifestyle[category] || "Not specified";
                    const choices = HABIT_CHOICES[category as keyof typeof HABIT_CHOICES] || [];
                    const currentIndex = choices.indexOf(currentValue);
                    const nextIndex = currentIndex === -1 || currentIndex === choices.length - 1 ? 0 : currentIndex + 1;
                    const nextValue = choices[nextIndex];

                    return (
                      <div key={category} className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-wider text-white/40 block">
                          {category}
                        </label>
                        <button
                          onClick={() => handleUpdateHabit(category, nextValue)}
                          className="w-full text-left px-3 py-2 bg-black/40 border border-white/5 rounded-xl text-[10px] font-bold text-white/80 hover:bg-white/5 hover:border-white/20 transition cursor-pointer flex justify-between items-center"
                        >
                          <span className="truncate">{currentValue}</span>
                          <ChevronDown className="w-3 h-3 text-white/30 shrink-0" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

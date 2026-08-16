/**
 * Platform Constants — Project Fusion / Seccion
 * Single source of truth for all categorical data, quest configs, and archetypes.
 */

// ─── Lifestyle Habits ────────────────────────────────────────────────────────

export const HABIT_CHOICES = {
  workout:            ['Every Day', 'Often', 'Sometimes', 'Never'],
  traveling:          ['Every Week', 'Monthly', 'Yearly', 'Never'],
  partying:           ['Every Weekend', 'Often', 'Sometimes', 'Never'],
  'healthy eating':   ['Every Day', 'Most Days', 'Sometimes', 'Never'],
  socializing:        ['Every Day', 'Often', 'Sometimes', 'Never'],
  reading:            ['Daily', 'Weekly', 'Monthly', 'Never'],
  sleep:              ['8+ Hours', '6-7 Hours', '4-5 Hours', '< 4 Hours'],
  smoking:            ['Non-Smoker', 'Socially', 'Regularly', 'Trying to Quit'],
  drinking:           ['Never', 'Socially', 'Regularly', 'Most Nights'],
  'social media':     ['Influencer status', 'Socially active', 'Off the grid', 'Passive scroller'],
  pets:               ['Dog', 'Cat', 'Other', 'Do not have but love', 'Want one', 'Not for me'],
  'morning/night':    ['Early Bird', 'Night Owl', 'Balanced'],
  'creative flow':    ['Every Day', 'Often', 'Sometimes', 'Never'],
  'adventure seek':   ['High Adrenaline', 'Moderate', 'Low Impact', 'Couch Potato'],
  'love style':       ['Thoughtful gestures', 'Presents', 'Touch', 'Compliments', 'Time together'],
  'communication':    ['Into texting', 'Into phone call', 'Into video chat', 'Not into long Chat', 'Into meet in person'],
};

// ─── Relationship Config ──────────────────────────────────────────────────────

export const RELATIONSHIP_GOALS = [
  'Long term partner',
  'Long term not against Short term Crush',
  'Good Vibe Instant Crush',
  'Short term Vibe leads to long term',
  'Not limit myself',
  "Let's figure after a date.",
  'Travel Companion',
  'Make New Frends',
  'Flat Mate',
  'Social & Economical Support',
  'Sex Mate',
];

export const RELATIONSHIP_TYPES = [
  'Monogamous',
  'Polyamorous',
  'Open Relationship',
  'Ethical Non-Monogamy',
  'Open to Explore',
  'Libertinism Mindset',
  'Swinging Open',
  'Open to Distant Relation',
  'Digital Relationship',
  'FWB',
  'Not sure yet',
];

export const FAMILY_GOALS = [
  'I want children',
  "I don't want children",
  'I have children and want more',
  "I have children and don't want more",
  'Not sure yet',
];

export const SEXUAL_PREFERENCES = [
  'Straight',
  'Gay',
  'Lesbian',
  'Bisexual',
  'Pansexual',
  'Queer',
  'Questioning',
  'Asexual',
  'Demisexual',
  'Aromantic',
  'Omnisexual',
];

export const SEXUAL_ORIENTATIONS = [
  { id: 'Straight', label: 'Straight', description: 'A person who is exclusively attracted to members of the opposite gender' },
  { id: 'Gay', label: 'Gay', description: 'An umbrella term used to describe someone who is attracted to members of their gender' },
  { id: 'Lesbian', label: 'Lesbian', description: 'A woman who is emotionally, romantically, or sexually attracted to other women and non-binary people' },
  { id: 'Bisexual', label: 'Bisexual', description: 'A person who has potential for emotional, romantic or sexual attraction to people of more than one gender' },
  { id: 'Asexual', label: 'Asexual', description: 'A person who may not experience sexual attraction or may experience a limited amount of sexual desire. May still experience romantic attraction or desire' },
  { id: 'Demisexual', label: 'Demisexual', description: 'A person who does not experience sexual attraction unless they form a strong emotional connection. May still experience romantic attraction or desire' },
  { id: 'Pansexual', label: 'Pansexual', description: 'A person who has potential for emotional, romantic or sexual attraction to people regardless of gender' },
  { id: 'Queer', label: 'Queer', description: 'An umbrella term used to express a spectrum of sexual orientations and genders often used to include those who do not identify as exclusively heterosexual' },
  { id: 'Questioning', label: 'Questioning', description: 'A person in the process of exploring their sexual orientation and/or gender' },
  { id: 'Aromantic', label: 'Aromantic', description: 'A person who does not experience romantic attraction, although they may still experience sexual attraction' },
  { id: 'Omnisexual', label: 'Omnisexual', description: 'A person who has potential for emotional, romantic or sexual attraction to people of all genders' },
];

export const HOBBIES = [
  'Fitness & Gym', 'Tech & AI', 'Live Music & Concerts', 'Fine Art & Museums',
  'Gaming & Esports', 'Gourmet Cooking', 'World Travel', 'Reading & Books',
  'Photography', 'Yoga & Wellness', 'Dancing & Nightlife', 'Fashion & Styling',
  'Cars & Motorsports', 'Outdoors & Hiking', 'Entrepreneurship & Startups',
  'Mentorship & Coaching', 'Investments & Crypto', 'Meditation & Mindfulness',
  'Mixology & Wine Tasting', 'Language Exchange', 'Podcasting & Streaming',
  'Cosplay & Anime', 'Glamour & Modeling', 'Exotic Fitness & Dance',
  'Film & Cinema', 'Coffee & Tea Culture', 'Board Games & Trivia', 'Pet Care & Animals'
];

export const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Mandarin',
  'Japanese', 'Korean', 'Portuguese', 'Italian', 'Russian',
  'Arabic', 'Hindi', 'Dutch', 'Turkish', 'Swedish', 'Polish'
];

export const EDUCATION_LEVELS = [
  'High School Diploma',
  'Tech/Trade School',
  'Currently in College',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctorate/PhD',
  'Life experience'
];

export const ASTRO_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// ─── Onboarding Quest — Stage 1 Quick Win ────────────────────────────────────

/** Vibe Check Mood Cards — Step 2 of Stage 1 */
export const MOODS = [
  // Learning, Mentorship & Growth Vibes (Knowledge & Growth)
  { id: 'skill_learning', label: 'Skill & Mentorship', emoji: '🎓', description: 'Masterclasses, 1-on-1 coaching & skill transfer', gradient: 'from-cyan-900/80 to-blue-900/60' },
  { id: 'career_finance', label: 'Career & Wealth', emoji: '📈', description: 'Startup advice, career coaching & wealth building', gradient: 'from-emerald-900/80 to-teal-900/60' },
  { id: 'zen_alignment', label: 'Zen & Alignment', emoji: '🧘‍♀️', description: 'Meditation, spiritual growth & high frequency', gradient: 'from-indigo-900/80 to-purple-900/60' },
  { id: 'late_night_brainstorm', label: 'Late Night Brainstorm', emoji: '🧠', description: 'Co-founders, hackathons & endless ideas', gradient: 'from-fuchsia-900/80 to-pink-900/60' },
  { id: 'cultural_exchange', label: 'Cultural Exchange', emoji: '🗣️', description: 'Fluent conversation & cultural immersion', gradient: 'from-orange-900/80 to-amber-900/60' },

  // Digital / Connection Vibes (Online / Creator / Explicit)
  { id: 'flirty_playful', label: 'Flirty & Playful', emoji: '😈', description: 'Lighthearted, teasing & fun', gradient: 'from-pink-900/80 to-purple-900/60' },
  { id: 'secret_confessions', label: 'Secret Confessions', emoji: '🤫', description: 'No judgment, deep secrets & anonymity', gradient: 'from-slate-800/80 to-stone-900/60' },
  { id: 'creative_showcase', label: 'Creative Stream', emoji: '🎬', description: 'Watch me & perform', gradient: 'from-indigo-900/80 to-blue-900/60' },
  { id: 'after_hours_raw', label: 'After Hours Unfiltered', emoji: '🔞', description: 'Raw, bold & completely uncensored', gradient: 'from-red-900/80 to-rose-900/60' },
  { id: 'co_op_gaming', label: 'Co-Op Gaming', emoji: '🎮', description: 'Late night lobbies & chill streams', gradient: 'from-violet-900/80 to-fuchsia-900/60' },
  
  // IRL / Real Meeting Vibes (Date Real)
  { id: 'dinner_date',    label: 'Dinner & Romance', emoji: '🍽️', description: 'Fine dining & romance', gradient: 'from-red-900/70 to-rose-900/50' },
  { id: 'late_night_drive', label: 'Late Night Drive', emoji: '🥂', description: 'Good music, deep talks & no destination', gradient: 'from-slate-900/80 to-blue-900/60' },
  { id: 'art_aesthetics', label: 'Art & Aesthetics', emoji: '🎨', description: 'Gallery openings, museums & vibe curation', gradient: 'from-purple-900/70 to-violet-900/50' },
  { id: 'adrenaline_junkie', label: 'Adrenaline Junkie', emoji: '🏃', description: 'Extreme sports, fast cars & high thrills', gradient: 'from-orange-900/70 to-red-900/50' },
  { id: 'vip_lifestyle', label: 'VIP Lifestyle', emoji: '✈️', description: 'Exclusive access, high-end events & luxury', gradient: 'from-amber-900/80 to-yellow-900/60' },
] as const;

export type MoodId = typeof MOODS[number]['id'];

/** Core Passion — Step 3 of Stage 1 */
export const CORE_PASSIONS = [
  { id: 'travel',  label: 'Travel',    emoji: '🌍', description: 'Explore the world'       },
  { id: 'art',     label: 'Art',       emoji: '🎨', description: 'Create & express'         },
  { id: 'music',   label: 'Music',     emoji: '🎵', description: 'Feel the rhythm'          },
  { id: 'fitness', label: 'Fitness',   emoji: '💪', description: 'Push your limits'         },
  { id: 'career',  label: 'Ambition',  emoji: '🚀', description: 'Build something great'    },
] as const;

export type PassionId = typeof CORE_PASSIONS[number]['id'];

// ─── Onboarding Quest — Stage 2 Archetypes ───────────────────────────────────

export const ARCHETYPE_PROFILES = {
  caregiver: {
    id: 'caregiver',
    name: 'The Caregiver',
    emoji: '🌸',
    tagline: 'You lead with your heart.',
    description: 'Nurturing, empathetic, community-driven. You thrive when others thrive, and your connections are built on deep trust.',
    color: '#F472B6',
    accentColor: 'rgba(244, 114, 182, 0.15)',
    traits: ['Empathetic', 'Family-oriented', 'Emotionally available', 'Supportive', 'Community-first', 'Collaborative'],
    relationshipStyle: 'Deep, long-horizon connections built on stability and trust.',
    defaultHabits: { socializing: 'Every Day', 'healthy eating': 'Most Days', reading: 'Weekly' },
  },
  rebel: {
    id: 'rebel',
    name: 'The Rebel',
    emoji: '🔥',
    tagline: 'You write your own rules.',
    description: 'Independent, unconventional, and intensity-driven. You live without limits and attract people who crave authenticity.',
    color: '#F97316',
    accentColor: 'rgba(249, 115, 22, 0.15)',
    traits: ['Independent', 'Spontaneous', 'High-energy', 'Bold', 'Non-conformist', 'Risk-taker'],
    relationshipStyle: 'High-intensity, authenticity-first connections with no room for pretense.',
    defaultHabits: { 'adventure seek': 'High Adrenaline', partying: 'Often', traveling: 'Every Week' },
  },
  dreamer: {
    id: 'dreamer',
    name: 'The Dreamer',
    emoji: '✨',
    tagline: 'You see beauty in everything.',
    description: 'Visionary, creative, and emotionally deep. You connect through imagination and shared worlds of thought.',
    color: '#93C5FD',
    accentColor: 'rgba(147, 197, 253, 0.15)',
    traits: ['Creative', 'Visionary', 'Introspective', 'Romantic', 'Philosophical', 'Deep-thinker'],
    relationshipStyle: 'Emotionally deep, growth-oriented connections centered on imagination.',
    defaultHabits: { 'creative flow': 'Every Day', reading: 'Daily', 'morning/night': 'Night Owl' },
  },
  visionary: {
    id: 'visionary',
    name: 'The Visionary',
    emoji: '🚀',
    tagline: 'You build the future.',
    description: 'Ambitious, strategic, and relentlessly driven. You see 10 steps ahead and attract people who share your hunger to create something extraordinary.',
    color: '#8B5CF6',
    accentColor: 'rgba(139, 92, 246, 0.15)',
    traits: ['Ambitious', 'Strategic', 'Disciplined', 'Innovative', 'Goal-driven', 'Focused'],
    relationshipStyle: 'Power-couple dynamics built on mutual ambition and shared growth trajectories.',
    defaultHabits: { workout: 'Every Day', 'healthy eating': 'Most Days', 'social media': 'Heavy User' },
  },
  protector: {
    id: 'protector',
    name: 'The Protector',
    emoji: '🛡️',
    tagline: 'You guard what matters.',
    description: 'Loyal, dependable, and deeply principled. You create safe spaces and your presence makes others feel secure enough to be vulnerable.',
    color: '#10B981',
    accentColor: 'rgba(16, 185, 129, 0.15)',
    traits: ['Loyal', 'Dependable', 'Principled', 'Protective', 'Honest', 'Resilient'],
    relationshipStyle: 'Steady, trust-anchored connections where vulnerability is rewarded with unwavering loyalty.',
    defaultHabits: { workout: 'Often', sleep: '8+ Hours', 'pet lover': 'Dog Person' },
  },
  explorer: {
    id: 'explorer',
    name: 'The Explorer',
    emoji: '🌍',
    tagline: 'You live for the unknown.',
    description: 'Curious, adaptable, and fearlessly open-minded. You collect experiences like others collect things, and your energy is magnetic.',
    color: '#06B6D4',
    accentColor: 'rgba(6, 182, 212, 0.15)',
    traits: ['Curious', 'Adaptable', 'Open-minded', 'Energetic', 'Worldly', 'Spontaneous'],
    relationshipStyle: 'Dynamic, ever-evolving connections fueled by shared curiosity and new experiences.',
    defaultHabits: { traveling: 'Every Week', 'adventure seek': 'High Adrenaline', socializing: 'Often' },
  },
  creator: {
    id: 'creator',
    name: 'The Creator',
    emoji: '🎭',
    tagline: 'You light up the stage.',
    description: 'Expressive, magnetic, and born to captivate. You channel your passions into art, streams, and unforgettable moments.',
    color: '#F59E0B',
    accentColor: 'rgba(245, 158, 11, 0.15)',
    traits: ['Expressive', 'Magnetic', 'Charismatic', 'Artistic', 'Captivating', 'Social'],
    relationshipStyle: 'Dynamic, collaborative partnerships with mutual spotlight and creative chemistry.',
    defaultHabits: { 'social media': 'Influencer status', 'creative flow': 'Every Day', socializing: 'Often' },
  },
  alchemist: {
    id: 'alchemist',
    name: 'The Alchemist',
    emoji: '🧪',
    tagline: 'You master inner & outer equilibrium.',
    description: 'Introspective, bio-optimized, and spiritually grounded. You transform raw energy into health, mindfulness, and evolution.',
    color: '#A855F7',
    accentColor: 'rgba(168, 85, 247, 0.15)',
    traits: ['Mindful', 'Bio-optimized', 'Introspective', 'Balanced', 'Transformative', 'Intuitive'],
    relationshipStyle: 'Conscious, high-vibration partnerships centered on personal evolution and presence.',
    defaultHabits: { workout: 'Often', 'healthy eating': 'Every Day', reading: 'Daily' },
  },
  hedonist: {
    id: 'hedonist',
    name: 'The Hedonist',
    emoji: '🥂',
    tagline: 'You savor every drop of life.',
    description: 'Sophisticated, pleasure-seeking, and unapologetically sensual. You appreciate fine dining, luxury aesthetics, and indulgence.',
    color: '#E11D48',
    accentColor: 'rgba(225, 29, 72, 0.15)',
    traits: ['Sensual', 'Sophisticated', 'Pleasure-seeking', 'Aesthetic-driven', 'Passionate', 'Indulgent'],
    relationshipStyle: 'Passionate, sensory-rich connections anchored in indulgence, intimacy, and shared luxury.',
    defaultHabits: { drinking: 'Socially', partying: 'Sometimes', socializing: 'Often' },
  },
} as const;

export type ArchetypeId = keyof typeof ARCHETYPE_PROFILES;

// ─── Quest Reward System ──────────────────────────────────────────────────────

export const QUEST_REWARDS = {
  stage1: {
    questId: 'onboarding_stage1',
    title: 'Connection Points Activated',
    points: 100,
    badge: 'Dedicated Viewer',
    description: 'You have entered the network. Your journey has begun.',
  },
  stage2: {
    questId: 'onboarding_stage2',
    title: 'Archetype Unlocked',
    points: 250,
    badge: 'Aspiring Member',
    description: 'Advanced filters activated. Your matches are now smarter.',
  },
  stage3: {
    questId: 'hidden_goals',
    title: 'Hidden Goals Revealed',
    points: 500,
    badge: 'Inner Circle',
    description: 'Relationship gauge reasoning is now visible to you.',
  },
} as const;

// ─── Frequency Levels for Lifestyle Matching ──────────────────────────────────

export const FREQUENCY_LEVELS: Record<string, number> = {
  // Generic
  'Every Day': 3,
  'Often': 2,
  'Sometimes': 1,
  'Never': 0,

  // Traveling
  'Every Week': 3,
  'Monthly': 2,
  'Yearly': 1,

  // Partying
  'Every Weekend': 3,

  // Healthy eating
  'Most Days': 2,

  // Reading
  'Daily': 3,
  'Weekly': 2,

  // Sleep
  '8+ Hours': 3,
  '6-7 Hours': 2,
  '4-5 Hours': 1,
  '< 4 Hours': 0,

  // Smoking
  'Non-Smoker': 0,
  'Trying to Quit': 0.5,
  'Socially': 1.5,
  'Regularly': 2.5,

  // Drinking
  'Most Nights': 3,

  // Social Media / Digital Wellness
  'Heavy User': 3,
  'Moderate': 2,
  'Minimal': 1,
  'Minimalist': 1.5,
  'Always Connected': 0,
  'Daily Detox': 3,
  'Weekly Detox': 2,

  // Morning/Night
  'Early Bird': 3,
  'Night Owl': 0,
  'Balanced': 1.5,

  // Pet Lover
  'Dog Person': 3,
  'Cat Person': 0,
  'Both': 1.5,
  'None': 0.75,

  // Adventure
  'High Adrenaline': 3,
  'Low Impact': 1,
  'Couch Potato': 0,

  // Financial
  'Aggressive Saver': 3,
  'Investor': 2,
  'Spender': 0,
};

// ─── Creator Specialization & Visibility Moats ────────────────────────────────

export interface CreatorSpecialization {
  id: string;
  title: string;
  badge: string;
  icon: string;
  color: string;
  description: string;
  sampleTags: string[];
  isAdult: boolean;
}

export const CREATOR_SPECIALIZATIONS: CreatorSpecialization[] = [
  {
    id: 'beauty',
    title: 'Makeup & Beauty Artistry',
    badge: 'Beauty Architect 💄',
    icon: '💄',
    color: 'from-[#ffabf3]/20 to-pink-500/20 border-[#ffabf3]/40 text-[#ffabf3]',
    description: 'Expert makeup tutorials, skincare routines, date-night glam & product audits.',
    sampleTags: ['#MakeupGlowUp', '#SkincareTips', '#EveningGlam', '#BeautyAdvice', '#GRWM'],
    isAdult: false,
  },
  {
    id: 'style',
    title: 'Style & Fashion Architecture',
    badge: 'Style Advisor 👠',
    icon: '👠',
    color: 'from-amber-400/20 to-orange-500/20 border-amber-400/40 text-amber-300',
    description: '1:1 outfit feedback, date-night fit checks, capsule wardrobe styling & color advice.',
    sampleTags: ['#DateStyle', '#WardrobeAudit', '#FitCheck', '#OutfitAdvice', '#CapsuleStyle'],
    isAdult: false,
  },
  {
    id: 'culinary',
    title: 'Culinary & Romantic Dining',
    badge: 'Culinary Master 👨‍🍳',
    icon: '👨‍🍳',
    color: 'from-emerald-400/20 to-teal-500/20 border-emerald-400/40 text-emerald-300',
    description: 'Live cook-along streams, romantic dinner recipes, wine pairing & custom menus.',
    sampleTags: ['#RomanticRecipes', '#CookAlong', '#ImpressionDinner', '#WinePairing', '#ChefSecret'],
    isAdult: false,
  },
  {
    id: 'dating',
    title: 'Dating & Relationship Coach',
    badge: 'Dating Wingman 🔮',
    icon: '🔮',
    color: 'from-purple-400/20 to-indigo-500/20 border-purple-400/40 text-purple-300',
    description: 'Icebreaker openers, profile optimization, chemistry reading & confidence coaching.',
    sampleTags: ['#DatingCoach', '#OpenerAdvice', '#ChemistryCoach', '#FlirtMaster', '#ConfidenceCode'],
    isAdult: false,
  },
  {
    id: 'health',
    title: 'Health & Psychology Coaching',
    badge: 'Mental Wellness 🧠',
    icon: '🧠',
    color: 'from-blue-400/20 to-indigo-500/20 border-blue-400/40 text-blue-300',
    description: 'Mental health guidance, somatic therapy, anxiety management & deep psychological insights.',
    sampleTags: ['#MentalHealth', '#PsychologyTips', '#AnxietyRelief', '#SomaticHealing', '#Mindfulness'],
    isAdult: false,
  },
  {
    id: 'fitness',
    title: 'Fitness & Vitality Coaching',
    badge: 'Fitness Coach 🏋️',
    icon: '🏋️',
    color: 'from-[#00fbfb]/20 to-cyan-500/20 border-[#00fbfb]/40 text-[#00fbfb]',
    description: 'Workout routines, posture audits, bio-hacking habits & active lifestyle goals.',
    sampleTags: ['#FitnessMotivation', '#PostureAudit', '#WorkoutRoutine', '#BioHacking', '#Vitality'],
    isAdult: false,
  },
  {
    id: 'creative',
    title: 'Art, Performance & Creative Flow',
    badge: 'Creative Alchemist 🎨',
    icon: '🎨',
    color: 'from-rose-400/20 to-red-500/20 border-rose-400/40 text-rose-300',
    description: 'Live acoustic sets, visual art commissions, photography & creative workshops.',
    sampleTags: ['#LiveMusic', '#ArtCommission', '#CreativeFlow', '#AcousticSet', '#Photography'],
    isAdult: false,
  },
  {
    id: 'career',
    title: 'Career & Ambition Coach',
    badge: 'Career Strategist 💼',
    icon: '💼',
    color: 'from-blue-500/20 to-indigo-600/20 border-blue-400/40 text-blue-300',
    description: 'Resume & LinkedIn audits, interview prep, salary negotiation & executive presence coaching.',
    sampleTags: ['#CareerCoach', '#LinkedInAudit', '#ExecutivePresence', '#SalaryNegotiation', '#InterviewPrep'],
    isAdult: false,
  },
  {
    id: 'wellness',
    title: 'Mindfulness & Holistic Wellness',
    badge: 'Wellness Guide 🌿',
    icon: '🌿',
    color: 'from-teal-400/20 to-emerald-500/20 border-teal-400/40 text-teal-300',
    description: 'Stress management, breathwork, sleep optimization, mindfulness & burnout recovery.',
    sampleTags: ['#WellnessGuide', '#Mindfulness', '#Breathwork', '#BurnoutRecovery', '#HolisticHealth'],
    isAdult: false,
  },
  {
    id: 'financial',
    title: 'Financial & Wealth Architect',
    badge: 'Financial Architect 💰',
    icon: '💰',
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-400/40 text-amber-300',
    description: 'Personal budgeting, investment fundamentals, wealth building & financial independence goals.',
    sampleTags: ['#FinancialCoach', '#WealthBuilding', '#Budgeting101', '#InvestmentTips', '#FinancialFreedom'],
    isAdult: false,
  },
  {
    id: 'adult',
    title: 'Sensual & Explicit Creator (18+)',
    badge: '18+ Sensual Creator 🔞',
    icon: '🔞',
    color: 'from-red-600/30 to-pink-600/30 border-red-500/50 text-red-400',
    description: 'Private 18+ VIP content, behind-closed-doors streams & sensual art.',
    sampleTags: ['#SensualContent', '#18PlusVIP', '#PrivateStream', '#BehindClosedDoors'],
    isAdult: true,
  },
];

// ─── Purpose Segmentation ─────────────────────────────────────────────────────

export const MEMBER_PURPOSES = [
  { 
    id: 'dating', 
    label: 'Dating & Romance', 
    emoji: '🩷', 
    description: 'Find your match — dating, relationships & romance',
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/40',
    features: ['Sexual preference matching', 'Relationship goal alignment', 'AI Wingman chat moves', 'Family planning compatibility'],
    requiresAgeVerification: true,
    connectionHorizonDefault: 'intimate',
  },
  { 
    id: 'lifestyle', 
    label: 'Lifestyle & Growth', 
    emoji: '🎓', 
    description: 'Mentorship, career coaching & skill building',
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40',
    features: ['Skill masterclasses', 'Career coaching', 'Wellness guidance', 'Creative collaboration'],
    requiresAgeVerification: true,
    connectionHorizonDefault: 'growth',
  },
  { 
    id: 'explicit', 
    label: 'Explicit Content (18+)', 
    emoji: '🔞', 
    description: 'Adult content discovery & interaction',
    color: 'from-red-600/20 to-pink-600/20 border-red-500/40',
    features: ['18+ content unlocked', 'Explicit creator discovery', 'Behind-closed-doors access'],
    requiresAgeVerification: true, // mandatory, not optional
    connectionHorizonDefault: 'intimate',
  },
  { 
    id: 'creator', 
    label: 'Become a Creator', 
    emoji: '🎬', 
    description: 'Monetize your content & build your audience',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40',
    features: ['Content monetization', 'Subscription tiers', 'Creator AI assistant'],
    requiresAgeVerification: true,
    requiresKyc: true,
    connectionHorizonDefault: 'dual',
  },
] as const;

export type MemberPurposeId = typeof MEMBER_PURPOSES[number]['id'];

export const PURPOSE_PROMPTS: Record<MemberPurposeId, Record<string, { categoryName: string; prompts: string[] }>> = {
  dating: {
    chemistry: {
      categoryName: "Chemistry & Connection",
      prompts: [
        "What is your dream first date?",
        "What is your biggest green flag in a partner?",
        "How do you show someone you care?"
      ]
    },
    conflict: {
      categoryName: "Vibes & Communication",
      prompts: [
        "When stressed, do you prefer space or talking it out?",
        "What is a funny or annoying pet peeve of yours?",
        "Do you resolve arguments immediately or cool down first?"
      ]
    },
    investment: {
      categoryName: "Lifestyle & Space",
      prompts: [
        "Cozy homebody or active explorer on weekends?",
        "What is a thoughtful gesture you always appreciate?",
        "How would you spend a perfect free day?"
      ]
    },
    archetype: {
      categoryName: "Passions & Vibe",
      prompts: [
        "What hobby could you talk about for hours?",
        "What song or movie always boosts your mood?",
        "What is a simple daily pleasure you love?"
      ]
    },
    ethics: {
      categoryName: "Growth & Values",
      prompts: [
        "What is a goal you're excited about right now?",
        "What is an important relationship boundary for you?"
      ]
    }
  },
  lifestyle: {
    ambition: {
      categoryName: "Ambition & Drive",
      prompts: [
        "What would you build if money and time were unlimited?",
        "What is a recent achievement you're genuinely proud of?",
        "What drives you to keep going when things get hard?"
      ]
    },
    skills: {
      categoryName: "Skills & Learning",
      prompts: [
        "What skill are you currently obsessed with mastering?",
        "Who is a mentor or role model that shaped your path?",
        "What is the last thing you taught someone?"
      ]
    },
    collaboration: {
      categoryName: "Collaboration & Growth",
      prompts: [
        "Describe your ideal creative or business partner.",
        "What project would you love to co-create with someone?",
        "What is a lesson failure taught you that success couldn't?"
      ]
    },
    wellness: {
      categoryName: "Wellness & Balance",
      prompts: [
        "How do you recharge after an intense work sprint?",
        "What daily ritual keeps you grounded?",
        "What does 'success' look like to you outside of money?"
      ]
    },
    creative: {
      categoryName: "Creative Vision",
      prompts: [
        "If you could master one creative craft overnight, what would it be?",
        "What content or creator inspires you most right now?",
        "What would your dream workshop or masterclass be about?"
      ]
    }
  },
  explicit: {
    desires: {
      categoryName: "Desires & Boundaries",
      prompts: [
        "What makes you feel most confident and desired?",
        "What is your biggest non-negotiable in intimacy?",
        "Describe the energy you're looking for in a connection."
      ]
    },
    chemistry: {
      categoryName: "Chemistry & Attraction",
      prompts: [
        "What is the first thing that catches your attention about someone?",
        "What kind of tension do you enjoy most — playful, mysterious, or direct?",
        "What is your guilty pleasure that you'd share with the right person?"
      ]
    },
    fantasy: {
      categoryName: "Fantasy & Expression",
      prompts: [
        "If you could set the mood for one perfect night, what would it look like?",
        "What is the boldest thing you've ever done to get someone's attention?",
        "What is your definition of 'exclusive access'?"
      ]
    }
  },
  creator: {
    identity: {
      categoryName: "Creator Identity",
      prompts: [
        "What makes your content different from everyone else's?",
        "What is the one thing your audience always comes back for?",
        "If you could collaborate with any creator in the world, who and why?"
      ]
    }
  }
};

export const PURPOSE_PROMPTS_ES: Record<MemberPurposeId, Record<string, { categoryName: string; prompts: string[] }>> = {
  dating: {
    chemistry: {
      categoryName: "Química & Conexión",
      prompts: [
        "¿Cómo sería tu primera cita soñada?",
        "¿Cuál es tu mayor 'green flag' en una pareja?",
        "¿Cómo le demuestras a alguien que te importa?"
      ]
    },
    conflict: {
      categoryName: "Vibra & Comunicación",
      prompts: [
        "Al estar estresado/a, ¿prefieres espacio o hablar las cosas?",
        "¿Cuál es una manía o pet peeve curioso que tienes?",
        "¿Resuelves desacuerdos de inmediato o prefieres enfriarte primero?"
      ]
    },
    investment: {
      categoryName: "Estilo de Vida & Espacio",
      prompts: [
        "¿Hogareño/a o explorador/a activo los fines de semana?",
        "¿Qué detalle atento siempre agradeces?",
        "¿Cómo pasarías un día libre perfecto?"
      ]
    },
    archetype: {
      categoryName: "Pasiones & Vibe",
      prompts: [
        "¿De qué pasatiempo podrías hablar durante horas?",
        "¿Qué canción o película siempre te sube el ánimo?",
        "¿Cuál es un placer diario simple que disfrutas mucho?"
      ]
    },
    ethics: {
      categoryName: "Crecimiento & Valores",
      prompts: [
        "¿Qué meta te emociona alcanzar ahora mismo?",
        "¿Cuál es un límite personal no negociable en una relación?"
      ]
    }
  },
  lifestyle: {
    ambition: {
      categoryName: "Ambición & Propósito",
      prompts: [
        "¿Qué construirías si el dinero y el tiempo fueran ilimitados?",
        "¿Cuál es un logro reciente del que te sientas muy orgulloso/a?",
        "¿Qué te motiva a seguir adelante cuando las cosas se complican?"
      ]
    },
    skills: {
      categoryName: "Habilidades & Aprendizaje",
      prompts: [
        "¿Qué habilidad te apasiona dominar en este momento?",
        "¿Quién es un mentor o referente que marcó tu camino?",
        "¿Qué fue lo último que le enseñaste a alguien?"
      ]
    },
    collaboration: {
      categoryName: "Colaboración & Red",
      prompts: [
        "Describe a tu socio/a creativo o de negocios ideal.",
        "¿Qué proyecto te encantaría co-crear con alguien?",
        "¿Qué lección te dejó un fracaso que el éxito no pudo darte?"
      ]
    },
    wellness: {
      categoryName: "Bienestar & Balance",
      prompts: [
        "¿Cómo recargas energía tras una jornada intensa de trabajo?",
        "¿Qué ritual diario te mantiene centrado/a?",
        "¿Cómo defines el 'éxito' más allá del dinero?"
      ]
    },
    creative: {
      categoryName: "Visión Creativa",
      prompts: [
        "Si pudieras dominar un arte creativo de la noche a la mañana, ¿cuál sería?",
        "¿Qué creador o contenido te inspira más actualmente?",
        "¿De qué trataría tu taller o masterclass soñado?"
      ]
    }
  },
  explicit: {
    desires: {
      categoryName: "Deseos & Límites",
      prompts: [
        "¿Qué te hace sentir con mayor confianza y atractivo/a?",
        "¿Cuál es tu mayor requisito no negociable en la intimidad?",
        "Describe la energía y química que buscas en una conexión."
      ]
    },
    chemistry: {
      categoryName: "Química & Atracción",
      prompts: [
        "¿Qué es lo primero que llama tu atención de alguien?",
        "¿Qué tipo de tensión disfrutas más: juguetona, misteriosa o directa?",
        "¿Cuál es tu placer culposo que compartirías con la persona indicada?"
      ]
    },
    fantasy: {
      categoryName: "Fantasía & Expresión",
      prompts: [
        "Si pudieras diseñar la noche perfecta, ¿cómo sería el ambiente?",
        "¿Qué es lo más audaz que has hecho para llamar la atención de alguien?",
        "¿Cuál es tu definición de 'acceso exclusivo'?"
      ]
    }
  },
  creator: {
    identity: {
      categoryName: "Identidad de Creador",
      prompts: [
        "¿Qué hace que tu contenido sea único y diferente al resto?",
        "¿Qué es lo que tu comunidad siempre busca en tus transmisiones?",
        "Si pudieras colaborar con cualquier creador del mundo, ¿con quién y por qué?"
      ]
    }
  }
};


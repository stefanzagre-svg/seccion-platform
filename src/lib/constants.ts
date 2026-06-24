/**
 * Platform Constants — Project Fusion / Session
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
  'Distant Relationship',
  'New Friends',
  'Flat Mate',
  'Social & Economical Support',
  'Content Provider',
];

export const RELATIONSHIP_TYPES = [
  'Monogamous',
  'Polyamorous',
  'Open Relationship',
  'Ethical Non-Monogamy',
  'Open to Explore',
  'Libertinism Mindset',
  'Swinging Open',
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
  'Fitness', 'Tech', 'Music', 'Art', 'Gaming',
  'Cooking', 'Traveling', 'Reading', 'Photography',
  'Yoga', 'Dancing', 'Fashion', 'Cars', 'Outdoors',
];

export const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Mandarin',
  'Japanese', 'Korean', 'Portuguese', 'Italian', 'Russian',
  'Arabic', 'Hindi', 'Dutch', 'Turkish', 'Swedish', 'Polish'
];

// ─── Onboarding Quest — Stage 1 Quick Win ────────────────────────────────────

/** Vibe Check Mood Cards — Step 2 of Stage 1 */
export const MOODS = [
  // Digital / Streaming Vibes (Behind Screen)
  { id: 'flirty_playful', label: 'Flirty & Playful', emoji: '😈', description: 'Lighthearted, teasing & fun', gradient: 'from-pink-900/80 to-purple-900/60' },
  { id: 'deep_intimate',  label: 'Deep Connection',  emoji: '🖤', description: 'No Small talk & Open Minded', gradient: 'from-slate-800/80 to-stone-900/60' },
  { id: 'creative_showcase', label: 'Creative Stream', emoji: '🎬', description: 'Watch me & perform', gradient: 'from-indigo-900/80 to-blue-900/60' },
  { id: 'exclusive_vip',  label: 'Exclusive VIP',    emoji: '💎', description: 'Premium & behind closed doors', gradient: 'from-fuchsia-900/70 to-pink-900/50' },
  { id: 'high_energy',    label: 'High Energy Live', emoji: '⚡', description: 'Loud, chaotic & entertaining', gradient: 'from-yellow-800/60 to-orange-700/50' },
  
  // IRL / Real Meeting Vibes (Date Real)
  { id: 'dinner_date',    label: 'Dinner Date',      emoji: '🍽️', description: 'Fine dining & romance', gradient: 'from-red-900/70 to-rose-900/50' },
  { id: 'grab_drink',     label: 'Grab a Drink',     emoji: '🍸', description: 'Cocktails & conversation, Picnic', gradient: 'from-teal-900/70 to-cyan-900/50' },
  { id: 'party_dance',    label: 'Party & Dance',    emoji: '🪩', description: 'Clubs & festivals', gradient: 'from-purple-900/70 to-violet-900/50' },
  { id: 'workout_mate',   label: 'Workout Mate',     emoji: '🏃', description: 'Running, gym & Health', gradient: 'from-emerald-900/70 to-green-900/50' },
  { id: 'travel_trip',    label: 'Travel & Trips',   emoji: '✈️', description: 'Weekend getaways & adventures', gradient: 'from-sky-900/70 to-blue-900/50' },
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

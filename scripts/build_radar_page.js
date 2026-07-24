import fs from 'fs';

const baselinePath = 'src/app/vibe-radar/page.recovered_from_map_2.tsx';
const outputPath = 'src/app/vibe-radar/page.tsx';

if (!fs.existsSync(baselinePath)) {
  console.error(`Baseline file not found at ${baselinePath}`);
  process.exit(1);
}

const content = fs.readFileSync(baselinePath, 'utf8');
const lines = content.split('\n');

// 1. Insert SpecializationFilter import
// Find index of imports
let insertImportIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('import PublicNavbar')) {
    insertImportIdx = i + 1;
    break;
  }
}

if (insertImportIdx !== -1) {
  lines.splice(insertImportIdx, 0, `import { SpecializationFilter } from "@/components/SpecializationFilter";`);
}

// 2. Define mockCreators array right before VibeRadarPage function
const mockCreatorsCode = `
const mockCreators = [
  {
    id: "elena",
    name: "Elena Vance",
    specialization: "beauty",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    badge: "Beauty Architect 💄",
    badgeColor: "bg-[#ffabf3]/15 border-[#ffabf3]/40 text-[#ffabf3]",
    borderColor: "border-[#ffabf3]",
    sampleActivity: "Makeup Glow-Up",
    description: "I help members create glowing date-night makeup looks and personalized skincare routines.",
    tags: ["#EveningGlam", "#GRWM"],
    actionLabel: "Request Style Order ($15)",
    buttonHoverColor: "hover:bg-[#ffabf3]/20 hover:border-[#ffabf3]/50",
    isAdult: false
  },
  {
    id: "sofia",
    name: "Sofia Rossi",
    specialization: "style",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80",
    badge: "Outfit Stylist 👗",
    badgeColor: "bg-amber-500/15 border border-amber-400/40 text-amber-300",
    borderColor: "border-amber-400",
    sampleActivity: "Fit Check",
    description: "Send me 2 outfit choices before your date - I'll tell you which fit check gets the best vibe.",
    tags: ["#DateStyle", "#FitCheck"],
    actionLabel: "Request Fit Audit ($15)",
    buttonHoverColor: "hover:bg-amber-500/20 hover:border-amber-400/50",
    isAdult: false
  },
  {
    id: "marco",
    name: "Chef Marco",
    specialization: "cooking",
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&q=80",
    badge: "Romance Chef 🍳",
    badgeColor: "bg-orange-500/15 border border-orange-400/40 text-orange-300",
    borderColor: "border-orange-400",
    sampleActivity: "Impression Dinner",
    description: "Learn 20-minute gourmet recipes that impress dates every single time. Simple, high-vibe dishes.",
    tags: ["#RomanticRecipes", "#ImpressionDinner"],
    actionLabel: "Book Cooking Class ($20)",
    buttonHoverColor: "hover:bg-orange-500/20 hover:border-orange-400/50",
    isAdult: false
  },
  {
    id: "liam",
    name: "Liam Vance",
    specialization: "relationship",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80",
    badge: "Chemistry Coach 💬",
    badgeColor: "bg-purple-500/15 border border-purple-400/40 text-purple-300",
    borderColor: "border-purple-400",
    sampleActivity: "Opener Advice",
    description: "We analyze your match's archetype and craft tailored icebreaker advice to unlock Chemistry Level 3+.",
    tags: ["#OpenerAdvice", "#ChemistryCoach"],
    actionLabel: "Request Opener Audit ($10)",
    buttonHoverColor: "hover:bg-purple-500/20 hover:border-purple-400/50",
    isAdult: false
  },
  {
    id: "david",
    name: "David Chen",
    specialization: "relationship",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    badge: "Executive Presence 💼",
    badgeColor: "bg-blue-500/15 border border-blue-400/40 text-blue-300",
    borderColor: "border-blue-400",
    sampleActivity: "LinkedIn Audit",
    description: "I audit your LinkedIn, refine your executive presence, and coach salary negotiation strategy.",
    tags: ["#ExecutivePresence", "#CareerCoaching"],
    actionLabel: "Request LinkedIn Audit ($25)",
    buttonHoverColor: "hover:bg-blue-500/20 hover:border-blue-400/50",
    isAdult: false
  },
  {
    id: "amara",
    name: "Amara Okafor",
    specialization: "wellness",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    badge: "Wellness Guide 🧘",
    badgeColor: "bg-teal-500/15 border border-teal-400/40 text-teal-300",
    borderColor: "border-teal-400",
    sampleActivity: "Mindfulness Workshop",
    description: "Breathwork sessions, sleep optimization protocols, and stress resilience for high achievers.",
    tags: ["#WellnessGuide", "#Mindfulness"],
    actionLabel: "Join Breathwork Session ($15)",
    buttonHoverColor: "hover:bg-teal-500/20 hover:border-teal-400/50",
    isAdult: false
  },
  {
    id: "alexandre",
    name: "Alexandre Dubois",
    specialization: "finance",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
    badge: "Wealth Planner 💰",
    badgeColor: "bg-amber-500/15 border border-amber-400/40 text-amber-300",
    borderColor: "border-amber-400",
    sampleActivity: "Wealth Review",
    description: "Build financial independence, master automated investing, and plan long-term wealth goals.",
    tags: ["#WealthPlanning", "#FinancialFreedom"],
    actionLabel: "Schedule Wealth Review ($25)",
    buttonHoverColor: "hover:bg-amber-500/20 hover:border-amber-400/50",
    isAdult: false
  },
  {
    id: "valeria",
    name: "Valeria Night",
    specialization: "adult",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&q=80",
    badge: "18+ Sensual Creator 💋",
    badgeColor: "bg-red-500/20 border border-red-500/50 text-red-300",
    borderColor: "border-red-500",
    sampleActivity: "Sensual Art & Private VIP Streams",
    description: "Private 18+ VIP content, behind-closed-doors streams, and intimate artistic shoots.",
    tags: ["#SensualContent", "#PrivateStream"],
    actionLabel: "Access VIP Space ($15)",
    buttonHoverColor: "hover:bg-red-600/50",
    isAdult: true
  }
];
`;

// Find index of VibeRadarPage function definition
let insertCreatorsIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export default function VibeRadarPage()')) {
    insertCreatorsIdx = i;
    break;
  }
}

if (insertCreatorsIdx !== -1) {
  lines.splice(insertCreatorsIdx, 0, mockCreatorsCode);
}

// 3. Insert filter states inside the component
// Find index inside VibeRadarPage
let insertStatesIdx = -1;
let foundFunc = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export default function VibeRadarPage()')) {
    foundFunc = true;
  }
  if (foundFunc && lines[i].includes('const router = useRouter();')) {
    insertStatesIdx = i + 1;
    break;
  }
}

if (insertStatesIdx !== -1) {
  const filterStates = `
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all");
  const [includeAdultContent, setIncludeAdultContent] = useState<boolean>(false);
  `;
  lines.splice(insertStatesIdx, 0, filterStates);
}

// 4. Insert the Creators by Specialization section right before Swipe Recession
// Find index of Swipe Recession comment
let insertSectionIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* Swipe Recession / Sociological Section */}')) {
    insertSectionIdx = i;
    break;
  }
}

const creatorsSectionCode = `
      {/* Creators by Specialization Section */}
      <section className="relative z-10 py-24 px-6 md:px-[84px] max-w-[1440px] mx-auto w-full border-t border-white/5 bg-[#050505]/20">
        <div className="max-w-6xl mx-auto space-y-12 text-center">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffabf3]/5 border border-[#ffabf3]/25 text-xs font-mono font-bold text-[#ffabf3]">
                <Sparkles className="w-3.5 h-3.5 text-[#ffabf3]" />
                <span>Mentors & Connection Catalysts</span>
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
                Explore Creators by Specialization
              </h2>
              <p className="text-xs sm:text-sm text-[#b9cac9] max-w-xl leading-relaxed">
                Level up your date night confidence, outfit style, makeup glow-up, and chemical connection index with our hand-selected vibe specialists.
              </p>
            </div>
          </div>

          {/* Interactive Specialization Filter & SafeSearch Toggle */}
          <div className="pt-4">
            <SpecializationFilter
              selectedSpecialization={selectedSpecialization}
              onSelectSpecialization={setSelectedSpecialization}
              includeAdult={includeAdultContent}
              onToggleAdult={setIncludeAdultContent}
            />
          </div>

          {/* Grid of Creators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {mockCreators
              .filter(creator => {
                if (creator.isAdult && !includeAdultContent) return false;
                if (selectedSpecialization !== 'all' && creator.specialization !== selectedSpecialization) return false;
                return true;
              })
              .map(creator => (
                <div 
                  key={creator.id}
                  className={\`p-5 rounded-2xl bg-white/[0.02] border \${creator.borderColor || 'border-white/5'} hover:bg-white/[0.04] transition-all space-y-4 text-left group\`}
                >
                  <div className="flex items-center justify-between">
                    <span className={\`px-3 py-1 rounded-full text-[10px] font-mono font-bold \${creator.badgeColor} flex items-center gap-1.5\`}>
                      {creator.badge}
                    </span>
                    <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                      {creator.sampleActivity}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={\`w-12 h-12 rounded-full overflow-hidden border-2 \${creator.borderColor || 'border-white/20'} shrink-0\`}>
                      <img src={creator.image} alt={creator.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#00fbfb] transition-colors">{creator.name}</h3>
                      <p className="text-[11px] text-[#b9cac9] font-mono capitalize">{creator.specialization} specialist</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#b9cac9] leading-relaxed min-h-[36px]">
                    {creator.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {creator.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[9px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button 
                    type="button"
                    onClick={() => alert(\`Connecting with \${creator.name} for \${creator.sampleActivity}...\`)}
                    className={\`w-full py-2 rounded-xl bg-white/5 border border-white/10 \${creator.buttonHoverColor || 'hover:bg-[#00fbfb]/20 hover:border-[#00fbfb]/50'} text-xs font-mono font-bold text-white transition-all text-center block cursor-pointer\`}
                  >
                    {creator.actionLabel}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </section>
`;

if (insertSectionIdx !== -1) {
  lines.splice(insertSectionIdx, 0, creatorsSectionCode);
}

fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');
console.log('Rebuilt vibe-radar/page.tsx successfully!');

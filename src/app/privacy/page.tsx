"use client";

import PublicFooter from "@/components/PublicFooter";
import React from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import { useTranslation } from "@/context/LanguageContext";
import { ArrowLeft, Shield, Eye, Lock, RefreshCw, HelpCircle, Users, Activity } from "lucide-react";

// Double bezel card
function DoubleBezelCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[2.5rem] p-1 bg-white/[0.04] border border-white/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-visible ${className}`}>
      <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] pointer-events-none" />
      <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0F0F1A]/95 p-8 border border-white/5 relative z-10">
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <div className="w-full min-h-screen text-[#e2e2e2] overflow-x-hidden font-sans bg-transparent relative flex flex-col justify-between">
      
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Floating Navbar */}
      <PublicNavbar />

      {/* Main Content Area */}
      <div className="relative z-10 pt-36 px-6 md:px-[84px] max-w-[840px] mx-auto w-full flex-grow">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/40 hover:text-[#00fbfb] transition mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Title */}
        <div className="text-left space-y-3 mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none font-['Outfit']">
            {t("privacy.title", "Privacy Policy")}
          </h1>
          <p className="text-xs sm:text-sm text-[#b9cac9] max-w-xl">
            {t("privacy.subtitle", "We protect your personal data, face, and preferences with high security standards.")}
          </p>
          <div className="p-3 bg-[#ffabf3]/5 border border-[#ffabf3]/20 rounded-xl text-left text-[10px] text-[#ffabf3]">
            💡 **{t("creatorHub.badge", "LEGAL STANDARDS & MONETIZATION")}**: {t("creatorHub.subtitle", "Terms, legal guidelines, and monetization tools for creators on SECCION.")} <Link href="/creator-hub" className="underline font-bold">[Creator Hub]</Link>
          </div>
        </div>

        <DoubleBezelCard>
          <div className="space-y-10 text-left text-xs font-medium leading-relaxed text-[#b9cac9] font-sans">
            
            {/* Section 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Eye className="w-5 h-5 text-[#00fbfb]" />
                <h3>1. Sensitive Data Collection & Explicit Opt-In</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">🔮 Magic Translation (TL;DR)</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  We collect details about who you are, what you like, and your location to power our matchmaking and creator interactions. We will never process this without your clear, active opt-in. No pre-ticked boxes, no hidden terms. You are in control of your vibes.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">⚖️ Legal Terms</span>
                <p>
                  The Platform processes sensitive personal data, including sexual orientation, relationship preferences, location data, and communication records. In accordance with Article 9 of the GDPR, the processing of this "special category" data requires your explicit, freely given, specific, informed, and unambiguous consent.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>**Mechanism**: You must complete a manual, unticked opt-in checkbox during onboarding.</li>
                  <li>**Consent Records**: We maintain secure, auditable logs of your consent timestamps and parameters to comply with AEPD (Agencia Española de Protección de Datos) requirements.</li>
                  <li>**Right to Withdraw**: You have the right to withdraw your consent at any time, which can be done via your Account Settings or by requesting account deletion.</li>
                </ul>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Shield className="w-5 h-5 text-[#ffabf3]" />
                <h3>2. Biometric Data & Age Verification</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#ffabf3] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#ffabf3] uppercase tracking-wider block">🔮 Magic Translation (TL;DR)</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  To keep the community safe, real, and 18+, we use a quick selfie check. AI estimates your age from a live snap and immediately deletes it. If you're a member, we do not store your government ID on our servers. Biometric template matches keep catfish and bots out of Co-Op Mode.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">⚖️ Legal Terms</span>
                <p>
                  Biometric data (e.g., facial templates extracted from verification selfies) is classified as special category data under the GDPR.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>**Age Estimation**: During onboarding, users upload a live liveness-verified selfie. Third-party age estimation AI estimates eligibility (18+). The selfie image is processed in memory and **deleted immediately** (within 5 seconds) after the age estimation is complete (Data Minimization).</li>
                  <li>**Anti-Catfishing Profile Verification**: The Platform compares the biometric template of your liveness selfie against your uploaded profile photos using facial matching. The mathematical facial templates are stored in an encrypted database and are deleted immediately upon account termination.</li>
                  <li>**Biometric Consent**: A dedicated, explicit consent checkbox is mandatory before biometric scans are initiated.</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Activity className="w-5 h-5 text-[#00fbfb]" />
                <h3>3. Automated Decision-Making & Recommender Systems</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">🔮 Magic Translation (TL;DR)</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  Our Synergy Engine runs matching algorithms based on archetype chemistry, location, and lifestyle sync to suggest connection cards. Under the hood, this is automated, but you always have the right to challenge the algorithm or request a human coach to review it.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">⚖️ Legal Terms</span>
                <p>
                  Under Article 22 of the GDPR and Article 27 of the DSA, we disclose the use of automated profiling and matchmaking:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>**The Synergy Algorithm**: Matches are calculated using lifestyle preferences, archetype alignment, and location proximity. These scores determine profile visibility and ranking.</li>
                  <li>**Transparency**: We provide clear explanations of the matching logic upon request.</li>
                  <li>**Human Intervention**: Users have a legal right to challenge automated decisions (such as compatibility ratings or automated safety flags) and request a manual review by a human moderator.</li>
                </ul>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Lock className="w-5 h-5 text-[#ffabf3]" />
                <h3>4. Technical Security & Data Breach Notifications</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#ffabf3] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#ffabf3] uppercase tracking-wider block">🔮 Magic Translation (TL;DR)</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  We encrypt your data at rest and in transit, using strict access rules to lock down sensitive information. If a data leak ever happens, we will notify the Spanish AEPD and you within 72 hours with full details and next steps.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">⚖️ Legal Terms</span>
                <p>
                  We implement robust Technical and Organizational Measures (TOMs) to secure your data:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>**Encryption**: All personal and behavioral data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.</li>
                  <li>**Access Control**: We enforce the principle of least privilege, requiring multi-factor authentication (MFA) for all administrative access.</li>
                  <li>**Data Breach Protocols**: In the event of a physical or technical data breach, we will notify the Spanish Supervisory Authority (AEPD) within **72 hours** of discovery. If the breach poses a high risk to user privacy or safety, we will notify the affected individuals directly and without undue delay.</li>
                </ul>
              </div>
            </div>

            {/* Section 5: Platform Guidance Additions */}
            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3>5. Member Verification & EU Wallet Standards</h3>
              </div>
              <div className="space-y-2">
                <p>
                  We implement a privacy-centric age check that confirms you are 18 or older without storing your personally identifiable information (PII):
                </p>
                <ul className="list-disc pl-4 space-y-2">
                  <li>**Zero-Knowledge Proofs (ZKP)**: We integrate with accredited identity providers supporting the European Commission's open-source age-verification blueprint.</li>
                  <li>**Selective Disclosure**: The system requests a simple cryptographic proof (e.g., `IsOver18: True`) from your EU Digital Identity Wallet. We do **not** receive or store your name, exact date of birth, or address.</li>
                  <li>**Ephemeral Media Security**: All disappearing photos, videos, and voice notes shared in chat are processed in volatile memory. They are immediately wiped and deleted from our active cache once viewed or after expiration, ensuring your private exchanges remain secure.</li>
                </ul>
              </div>
            </div>

          </div>
        </DoubleBezelCard>

      </div>

      {/* Footer */}
      <PublicFooter />

    </div>
  );
}

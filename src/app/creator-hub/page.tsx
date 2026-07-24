"use client";

import React from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import { useTranslation } from "@/context/LanguageContext";
import { ArrowLeft, Scale, Shield, Landmark, Globe, FileText, Bot, AlertTriangle, Eye, ShieldAlert, BadgePercent } from "lucide-react";

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

export default function CreatorHubPage() {
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
            {t("creatorHub.title", "Creator Hub")}
          </h1>
          <p className="text-xs sm:text-sm text-[#b9cac9] max-w-xl">
            {t("creatorHub.subtitle", "Terms, legal guidelines, and monetization tools for creators on SECCION.")}
          </p>
        </div>

        <DoubleBezelCard>
          <div className="space-y-10 text-left text-xs font-medium leading-relaxed text-[#b9cac9] font-sans">
            
            {/* Section 1: Age verification & KYC Gates */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <ShieldAlert className="w-5 h-5 text-[#00fbfb]" />
                <h3>1. Age Verification & KYC Gates</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">🔮 Magic Translation (TL;DR)</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  Zero minor tolerance. You must be 18+ to view or post. If you're a creator, you must clear SnapSign liveness checks and upload a valid government ID before you can share posts, launch live streams, or receive tips.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">⚖️ Legal Terms</span>
                <p>
                  The Platform maintains a strict gating system to prevent minors from accessing or publishing content. Before publishing content, launching live streams, or enabling monetization features (subscriptions, tips, goals), creators must complete **KYC Tier 3**. This requires:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>**ID Verification**: Submit a clear, unexpired scan of a government-issued photo ID.</li>
                  <li>**Liveness holding Selfie**: Take a selfie holding your government ID next to your face to prove identity ownership.</li>
                  <li>**Model Release**: Sign the digital Model Release Agreement (using SnapSign) confirming your voluntary participation and commercial consent.</li>
                  <li>**Sanctions & Watchlist Screening**: All creators undergo automated screening against international registers (including US OFAC, EU, and UK watchlists). Onboarding is prohibited for blocked/sanctioned individuals or residents of embargoed territories.</li>
                  <li>**Life of Records**: All identity documentation is encrypted and stored securely for the duration of platform operations plus an additional 5 years.</li>
                </ul>
              </div>
            </div>

            {/* Section 2: Revenue splits and tax setup */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <BadgePercent className="w-5 h-5 text-[#ffabf3]" />
                <h3>2. 80/20 Net Revenue Split & Tax Reporting</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#ffabf3] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#ffabf3] uppercase tracking-wider block">🔮 Magic Translation (TL;DR)</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  Creators receive **80% of Net Revenue** (Gross Revenue minus credit card processing fees). SECCION retains 20% of Net Revenue, guaranteeing a 15%–18% net platform operating margin. We handle automatic payout distribution and report earnings under DAC7 and IRS 1099 guidelines.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">⚖️ Legal Terms</span>
                <p>
                  Creators on SECCION retain **80% of Net Revenue** on subscriptions, tips, and custom escrow orders. Net Revenue is defined as Gross Customer Payments minus third-party payment processing fees (Segpay / CCBill credit card transaction fees & chargeback reserves).
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>**Net Revenue Payout Formula**: Creator Payout = 80% × (Gross Revenue - Payment Processing Fees). SECCION retains 20% of Net Revenue, maintaining a guaranteed 15%–18% net margin.</li>
                  <li>**Tax Identification & Reporting**: Creators are solely responsible for reporting and paying all applicable taxes. In compliance with the **EU DAC7 Directive** and U.S. IRS regulations, the Platform will collect and verify your Tax Identification Number (TIN) and VAT details.</li>
                  <li>**Reporting to Authorities**: The Platform is legally mandated to report creator transactions and payouts annually to the Spanish tax authorities and the IRS (via Form **1099**-NEC).</li>
                  <li>**CNMC Registration & Transparency**: In compliance with Spain's **General Law on Audiovisual and Media Communication (2025 Reform)**, the Platform is registered in the National Registry for Media Service Providers. We disclose our Ultimate Beneficial Ownership (UBO) structures and declare advertising revenue.</li>
                </ul>
              </div>
            </div>

            {/* Section 3: Co-Performer Verification & 2257 Rules */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Scale className="w-5 h-5 text-emerald-400" />
                <h3>3. Co-Performer Verification & 2257 Rules</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-emerald-400 rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">🔮 Magic Translation (TL;DR)</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  If you film with a partner, they must be verified too. No exceptions. We require a government ID and a selfie holding that ID for every single co-performer before you post the content. Unverified background appearances will trigger a ban.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">⚖️ Legal Terms</span>
                <p>
                  To protect payment rails and comply with U.S. 18 U.S.C. § 2257:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>**Co-Performer KYC**: Collaborative or co-performed explicit content cannot be uploaded unless all participants are verified members of the Platform and tagged in the post.</li>
                  <li>**Selfie Holding ID**: Creators must collect a government photo ID and a liveness selfie of the co-performer holding their ID.</li>
                  <li>**Background Auditing**: Ensure that no unverified or minor individuals appear in the background of any uploaded content. The presence of unverified bystanders is a primary trigger for permanent account suspension.</li>
                </ul>
              </div>
            </div>

            {/* Section 4: Content watermarking and copyright tools */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Globe className="w-5 h-5 text-[#00fbfb]" />
                <h3>4. Anti-Piracy & Content Watermarking</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">🔮 Magic Translation (TL;DR)</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  We protect your content using visible tags and invisible steganographic signatures embedded secretly into media. If someone leaks your work, we locate their subscriber account and issue automated DMCA takedowns to search engines immediately.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">⚖️ Legal Terms</span>
                <p>
                  SECCION equips creators with advanced resources to safeguard their digital presence:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>**Visible Watermarks**: The Platform overlays your username or stage name onto images and videos.</li>
                  <li>**Invisible Steganographic Watermarks**: Advanced invisible tracking data is secretly embedded into media files, allowing us to identify the specific subscriber account responsible in the event of a leak.</li>
                  <li>**DMCA Takedowns**: SECCION provides automated tools to generate and issue Digital Millennium Copyright Act (DMCA) takedown notices to third-party hosts or search engines hosting stolen media.</li>
                </ul>
              </div>
            </div>

            {/* Section 5: Creator Operations AI Assistant & privacy tools */}
            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Bot className="w-5 h-5 text-emerald-400" />
                <h3>5. Creator Back-Office AI Suite & Safety Tools</h3>
              </div>
              <div className="space-y-2">
                <p>
                  To render exploitative talent agencies obsolete, SECCION provides automated tools and privacy filters:
                </p>
                <ul className="list-disc pl-4 space-y-2">
                  <li>**Contract Copilot**: Our built-in legal scanner reviews brand contracts and agency agreements, flagging predatory terms such as likeness lock-in clauses or exclusive IP forfeitures.</li>
                  <li>**Operations Assistant**: AI assistant helps you manage custom booking requests, schedule streams, write description teasers, and translate chat messages (text and speech note translation) in real-time.</li>
                  <li>**Geofencing & Blocking Filters**: Protect your local identity by geofencing specific countries, states, or cities, preventing profiles in those regions from seeing your streams, content albums, or matching cards.</li>
                  <li>**Creator Safety PO Box**: Creators are strongly advised to use a distinct stage name, PO Box, and dedicated business bank account for tax/business registration.</li>
                </ul>
              </div>
            </div>

          </div>
        </DoubleBezelCard>

      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-[#0B0C10] border-t border-white/10 flex flex-col items-center justify-center w-full px-4 sm:px-6 md:px-12 lg:px-20 py-12 gap-8 text-center mt-20">
        {/* Top: Centered 3D Icon */}
        <div className="flex justify-center">
          <img 
            src="/assets/logo/logo-mark.png" 
            alt="SECCION Icon" 
            className="w-12 h-12 md:w-14 md:h-14 drop-shadow-[0_0_20px_rgba(0,251,251,0.4)] object-contain" 
          />
        </div>

        {/* Middle: Navigation Links */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
          <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/privacy">{t("footer.privacy")}</Link>
          <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/rules">{t("footer.rules")}</Link>
          <Link className="text-[#ffabf3] border-b border-[#ffabf3] pb-0.5 transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/creator-hub">{t("footer.creatorHub")}</Link>
          <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/hit-us-up">{t("footer.contact")}</Link>
        </div>

        {/* Bottom: Clean Wordmark Only (No Icon attached) */}
        <div className="flex flex-col items-center gap-3">
          <img 
            src="/assets/logo/logo-wordmark.png" 
            alt="SECCION Logo" 
            className="h-8 md:h-10 drop-shadow-[0_0_25px_rgba(0,251,251,0.4)] object-contain" 
          />
          <p className="font-mono text-[11px] font-medium tracking-widest text-[#b9cac9] opacity-40 pt-2">© 2026 SECCION. {t("footer.rights").toUpperCase()}</p>
        </div>
      </footer>

    </div>
  );
}

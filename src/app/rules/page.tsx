"use client";

import React from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import { useTranslation } from "@/context/LanguageContext";
import { ArrowLeft, AlertTriangle, Scale, UserCheck, MessageCircle, Heart, CreditCard, ShieldAlert } from "lucide-react";

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

export default function RulesPage() {
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
            {t("rules.title", "Community Rules")}
          </h1>
          <p className="text-xs sm:text-sm text-[#b9cac9] max-w-xl">
            {t("rules.subtitle", "Guidelines ensuring a safe, respectful, and authentic community on SECCION.")}
          </p>
          <div className="p-3 bg-[#ffabf3]/5 border border-[#ffabf3]/20 rounded-xl text-left text-[10px] text-[#ffabf3]">
            💡 **{t("creatorHub.badge", "LEGAL STANDARDS & MONETIZATION")}**: {t("creatorHub.subtitle", "Terms, legal guidelines, and monetization tools for creators on SECCION.")} <Link href="/creator-hub" className="underline font-bold">[Creator Hub]</Link>
          </div>
        </div>

        <DoubleBezelCard>
          <div className="space-y-10 text-left text-xs font-medium leading-relaxed text-[#b9cac9] font-sans">
            
            {/* Section 1: Prohibited content & behaviors */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <ShieldAlert className="w-5 h-5 text-[#00fbfb]" />
                <h3>1. Prohibited Content & Behaviors</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">🔮 Magic Translation (TL;DR)</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  Respect is absolute. We ban non-consensual explicit content (no leaks, no stealthing, no cyberflashing), hate speech, bullying, scams, and pseudo-profiles (fake/bot accounts). Keep the vibe clean and consensual.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">⚖️ Legal Terms</span>
                <p>
                  The following content types and behaviors are strictly prohibited on the Platform:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>**Non-Consensual Explicit Material**: Uploading or distributing explicit images, videos, or audio without the documented consent of all participants is strictly banned (including "cyberflashing," condom removal without consent ["stealthing"], or unauthorized redistribution of personal media).</li>
                  <li>**Minor Exploitation**: The Platform maintains zero tolerance for any content depicting, soliciting, or involving minors. Any such content will be removed immediately, and details will be forwarded to law enforcement and the NCMEC.</li>
                  <li>**Hate Speech & Harassment**: Content depicting slurs, harmful stereotypes, misgendering, targeted harassment, or hate group ideologies will result in immediate strikes or account bans.</li>
                  <li>**Deceptive Practices & Scams**: Financial scams, unauthorized advertising, and the operation of unlabelled automated or "pseudo-profiles" are prohibited. Any automated accounts must be clearly marked.</li>
                </ul>
              </div>
            </div>

            {/* Section 2: Subscriptions, Cancellations & Refunds */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <CreditCard className="w-5 h-5 text-[#ffabf3]" />
                <h3>2. Subscriptions, Cancellations, & Refunds</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#ffabf3] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#ffabf3] uppercase tracking-wider block">🔮 Magic Translation (TL;DR)</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  Subscriptions auto-renew, but you can cancel anytime with a simple two-click path (no hidden traps). We send reminders before renewing. Under EU/UK law, you have a 14-day right to withdraw from a new purchase, and a 3-day window applies in certain US states.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">⚖️ Legal Terms</span>
                <p>
                  In compliance with the UK DMCCA 2024 and EU consumer protection regulations:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>**Auto-Renewal**: Subscriptions automatically renew at the end of each billing cycle unless cancelled. The Platform will provide a clear renewal notification prior to taking payment.</li>
                  <li>**Cancellation Path**: Users can cancel subscriptions at any time via a prominent, simple, two-click path in their Account Settings. Access to paid content remains active until the end of the current billing cycle.</li>
                  <li>**Right of Withdrawal (EU/UK)**: Users residing in the European Union or United Kingdom have a **14-day right of withdrawal** from new subscriptions or digital purchases, provided the digital content has not been fully streamed or downloaded.</li>
                  <li>**US Cancellation Window**: In certain US states, a **3-day cancellation window** applies, allowing users to cancel and receive a refund within 3 days of purchase.</li>
                </ul>
              </div>
            </div>

            {/* Section 3: Chargebacks & Virtual Currencies */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Scale className="w-5 h-5 text-emerald-400" />
                <h3>3. Chargebacks & Virtual Currencies</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-emerald-400 rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">🔮 Magic Translation (TL;DR)</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  Gold Coins are virtual items for tipping and goals; they are not real money and cannot be cashed out or transferred. If you initiate a fraudulent refund request or chargeback, your account will be immediately banned.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">⚖️ Legal Terms</span>
                <p>
                  Our tokens policy and virtual coin terms:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>**Virtual Currency (Gold Coins/Tokens)**: The Platform may offer virtual items or in-app currency ("Gold Coins") for tipping and contribution goals. Gold Coins represent a limited, non-refundable, and non-transferable license, have no cash value, and cannot be exchanged for fiat currency or transferred off-platform.</li>
                  <li>**Chargeback Policy**: The Platform has a zero-tolerance policy for chargeback fraud. Unjustified chargebacks or fraudulent refund requests filed through payment networks will result in immediate and permanent account termination, forfeiture of virtual currency, and collection of outstanding debts.</li>
                </ul>
              </div>
            </div>

            {/* Section 4: Content Tagging & DSA Compliance */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <MessageCircle className="w-5 h-5 text-[#00fbfb]" />
                <h3>4. Content Tagging & DSA Compliance</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">🔮 Magic Translation (TL;DR)</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  Keep public feeds clean. Explicit content must be tagged properly and placed behind VIP/Master subscription locks. AI scanners and human moderators screen all uploads. If we remove a post or lock an account, we will send you a clear Statement of Reasons.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">⚖️ Legal Terms</span>
                <p>
                  The Platform implements a multi-layer upload safety pipeline and content moderation framework to satisfy the Digital Services Act (DSA):
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>**Content Tagging**: Creators must assign descriptive and explicit tags to all media uploads.</li>
                  <li>**VIP/Master Gating & Minor Protection**: All explicit content must be gated behind paid VIP/Master subscription tiers. In compliance with Article 28 of the DSA, we implement strict age gates to ensure minor protection from explicit material.</li>
                  <li>**Statement of Reasons (Article 17)**: If we take action against your content (e.g., removal, suspension, or monetization lock), we will provide a detailed Statement of Reasons explaining the specific rule violated and the transparency parameters of our decision.</li>
                </ul>
              </div>
            </div>

            {/* Section 5: Date Plan commitments and accessibility */}
            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3>5. Date Plan Intentionality & Trust Ratings</h3>
              </div>
              <div className="space-y-2">
                <p>
                  Our Date Plan module is an anti-situationship tool. Please do not publish Date Plans or apply to other members' or creators' date plans unless you have genuine intent to meet. Canceling confirmed plans repeatedly without cause violates community guidelines and reduces your trust rating score (max 20.00 scale).
                </p>
                <p>
                  In compliance with Spanish **Law 11/2023** (transposing the European Accessibility Act), the Platform’s public interfaces, e-commerce pathways, and subscription flows conform to the **EN 301 549** technical standards, incorporating **WCAG 2.1 Level AA** compliance.
                </p>
              </div>
            </div>

            {/* Section 6: Creator Revenue & Net Revenue Terms */}
            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <CreditCard className="w-5 h-5 text-[#00fbfb]" />
                <h3>6. Creator Revenue & Net Payout Terms</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">🔮 Magic Translation (TL;DR)</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  Creators earn **80% of Net Revenue**. Net Revenue is calculated after deducting third-party payment processing fees (Segpay / CCBill credit card fees). This guarantees SECCION maintains a solid 15%–18% net operating margin while delivering high yield to creators.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">⚖️ Legal Terms</span>
                <p>
                  Creator payout calculation and distribution framework:
                </p>
                <ul className="list-disc pl-4 space-y-1 font-mono text-[11px] text-[#b9cac9]">
                  <li><strong className="text-white">Net Revenue Definition:</strong> Net Revenue is defined as Gross Customer Payments minus mandatory third-party payment processing costs (e.g., Segpay / CCBill transaction fees, credit card interchange, and chargeback reserves).</li>
                  <li><strong className="text-white">80% Net Payout Split:</strong> Creators receive <strong className="text-[#00fbfb]">80% of Net Revenue</strong> across all subscription tiers, pay-per-view unlocks, live streams, and custom escrow orders. SECCION retains the remaining 20% of Net Revenue.</li>
                  <li><strong className="text-white">Guaranteed Operating Margin:</strong> This Net Revenue formula guarantees SECCION consistently maintains a healthy <strong className="text-emerald-400">15% to 18% net platform margin</strong> regardless of international credit card processing fees.</li>
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
          <Link className="text-[#ffabf3] border-b border-[#ffabf3] pb-0.5 transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/rules">{t("footer.rules")}</Link>
          <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/creator-hub">{t("footer.creatorHub")}</Link>
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

import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import Script from "next/script";

export const metadata: Metadata = {
  title: "AI Copilot for Creators — 24/7 DM Manager in Your Exact Voice",
  description: "SECCION's AI Copilot engages your fans 24/7 in direct messages using your exact tone and voice — trained with your explicit permission. Replace chatting agencies taking 40–50% and keep 90% of your earnings.",
  keywords: [
    "AI DM manager for content creators",
    "AI copilot for creators 2026",
    "auto reply fan DMs AI",
    "replace chatting agency AI",
    "AI voice clone for creator DMs",
    "24/7 fan engagement AI",
    "creator AI operations manager",
    "AI fan chat automation",
    "chatting agency alternative AI",
    "SECCION AI copilot",
    "creator AI assistant"
  ],
  alternates: {
    canonical: "https://seccion.ai/features/ai-copilot",
  },
  openGraph: {
    title: "AI Copilot for Creators — 24/7 DM Manager in Your Exact Voice | SECCION",
    description: "Your AI Copilot handles fan DMs 24/7 in your exact tone and voice — trained with your consent. Replaces chatting agencies that take 40–50% of your revenue.",
    url: "https://seccion.ai/features/ai-copilot",
    siteName: "SECCION",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Copilot — 24/7 DMs in Your Exact Voice | SECCION",
    description: "Replace your chatting agency. SECCION's AI Copilot engages fans 24/7 in your real tone and voice — with your consent. Keep 90% of your earnings.",
    site: "@steveseccion",
    creator: "@steveseccion",
  }
};

const breadcrumbs = [
  { name: "Home", url: "https://seccion.ai" },
  { name: "Features", url: "https://seccion.ai/features/ai-copilot" },
  { name: "AI Copilot", url: "https://seccion.ai/features/ai-copilot" },
];

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How SECCION's 24/7 AI Copilot Works for Creator DMs",
  "description": "SECCION's AI Copilot engages your fans in direct messages 24/7 using your exact voice, tone, and style — trained exclusively with your explicit consent.",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Train the AI on your voice",
      "text": "Upload or sync your historical messaging samples. The AI learns your vocabulary, tone, emoji usage, and response patterns — securely and with your full consent."
    },
    {
      "@type": "HowToStep",
      "name": "Set your engagement rules",
      "text": "Define which types of messages the AI handles (FAQs, PPV previews, greetings) and which escalate to you directly (Level 4+ chemistry connections, custom requests)."
    },
    {
      "@type": "HowToStep",
      "name": "Go live 24/7",
      "text": "Your AI Copilot starts engaging fans across all time zones — maintaining your authentic voice, sharing content previews, and driving subscription revenue while you sleep."
    }
  ]
};

export default function AICopilotPage() {
  return (
    <>
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">

          {/* Hero */}
          <div className="mb-16 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#00fbfb]/30 bg-[#00fbfb]/5 text-[#00fbfb] text-xs font-mono font-bold uppercase tracking-widest mb-5">
              Feature — AI Operations
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-5 leading-tight">
              Your 24/7 AI Copilot<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00fbfb] to-[#ffabf3]">
                In Your Exact Voice
              </span>
            </h1>
            <p className="text-lg text-[#b9cac9] max-w-2xl mx-auto leading-relaxed mb-8">
              Stop paying a chatting agency <strong className="text-white">40–50% of your revenue</strong> to ghostwrite your DMs.
              SECCION's independent AI Copilot engages your fans around the clock in your authentic tone —{" "}
              <strong className="text-[#00fbfb]">trained strictly with your permission</strong>.
            </p>
            <a
              href="/become-creator"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#00fbfb] to-[#ffabf3] text-black font-mono text-sm font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(0,251,251,0.5)] transition"
            >
              Activate Your AI Copilot
            </a>
          </div>

          {/* The Agency Problem */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 text-center">
              The Chatting Agency Problem
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { stat: "40–50%", label: "Agency cut of your revenue", color: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/5" },
                { stat: "24hrs", label: "Delay when your team is offline", color: "text-orange-400", border: "border-orange-500/20", bg: "bg-orange-500/5" },
                { stat: "High risk", label: "Ghostwriters break character & leak content", color: "text-yellow-400", border: "border-yellow-500/20", bg: "bg-yellow-500/5" },
              ].map((item, i) => (
                <div key={i} className={`p-6 rounded-3xl border ${item.border} ${item.bg} text-center`}>
                  <div className={`text-3xl font-black ${item.color} mb-2`}>{item.stat}</div>
                  <p className="text-sm text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How the AI Copilot Works */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 text-center">
              How SECCION&apos;s AI Copilot Works
            </h2>
            <p className="text-center text-[#b9cac9] text-sm mb-8 max-w-xl mx-auto">
              Three simple steps to replace your chatting agency and keep 90% of your earnings.
            </p>
            <div className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Train the AI on your voice",
                  body: "Upload your messaging history. The AI learns your vocabulary, signature phrases, emoji patterns, and response tempo — securely processed and never shared with third parties.",
                  color: "text-[#00fbfb]",
                  border: "border-[#00fbfb]/20",
                },
                {
                  step: "02",
                  title: "Set your engagement rules",
                  body: "Define what the AI handles autonomously (FAQs, PPV previews, new subscriber greetings) and what gets escalated to you directly (high-chemistry Level 4+ connections, custom content requests).",
                  color: "text-[#ffabf3]",
                  border: "border-[#ffabf3]/20",
                },
                {
                  step: "03",
                  title: "Go live — earn 24/7",
                  body: "Your Copilot engages fans across every time zone in your authentic voice. It drives PPV unlocks, subscription renewals, and tip revenue while you create content, rest, and live your life.",
                  color: "text-[#39FF14]",
                  border: "border-[#39FF14]/20",
                },
              ].map((item, i) => (
                <div key={i} className={`p-6 sm:p-8 rounded-3xl bg-white/[0.02] border ${item.border} flex gap-6 items-start`}>
                  <span className={`text-3xl font-black font-mono ${item.color} shrink-0 leading-none`}>{item.step}</span>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
                    <p className="text-sm text-[#b9cac9] leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Savings Calculator */}
          <section className="mb-16 p-8 rounded-3xl bg-gradient-to-br from-[#00fbfb]/10 via-transparent to-[#ffabf3]/10 border border-[#00fbfb]/20">
            <h2 className="text-2xl font-black text-white mb-6 text-center">
              What You Actually Keep
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
                <h3 className="font-mono text-red-400 font-bold uppercase text-xs mb-4">OnlyFans + Chatting Agency</h3>
                <ul className="text-sm space-y-2 text-white/80">
                  <li>Gross Monthly Revenue: <strong>$10,000</strong></li>
                  <li className="text-red-400">Platform Fee (20%): −$2,000</li>
                  <li className="text-red-400">Agency Cut (45%): −$3,600</li>
                  <li className="pt-3 border-t border-red-500/30 text-base font-black text-red-300">
                    You Keep: $4,400 (44%)
                  </li>
                </ul>
              </div>
              <div className="p-6 rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/20">
                <h3 className="font-mono text-[#39FF14] font-bold uppercase text-xs mb-4">SECCION Founding Creator + AI Copilot</h3>
                <ul className="text-sm space-y-2 text-white/80">
                  <li>Gross Monthly Revenue: <strong>$10,000</strong></li>
                  <li className="text-[#39FF14]">Platform Fee (10%): −$1,000</li>
                  <li className="text-[#39FF14]">AI Copilot (Year 1): $0 included</li>
                  <li className="pt-3 border-t border-[#39FF14]/30 text-base font-black text-[#39FF14]">
                    You Keep: $9,000 (90%)
                  </li>
                </ul>
              </div>
            </div>
            <p className="text-center text-xs font-mono text-[#00fbfb] mt-4">
              Net annual difference: <strong>+$54,720 in retained creator earnings</strong>
            </p>
          </section>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-black text-white mb-3">Ready to fire your chatting agency?</h2>
            <p className="text-sm text-[#b9cac9] mb-6">Apply for the Founding Creator cohort and activate your AI Copilot on Day 1.</p>
            <a
              href="/become-creator"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#00fbfb] to-[#ffabf3] text-black font-mono text-sm font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(0,251,251,0.5)] transition"
            >
              Become a Founding Creator →
            </a>
          </div>

        </div>
      </main>
    </>
  );
}

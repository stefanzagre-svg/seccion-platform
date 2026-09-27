import type { Metadata } from "next";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "FAQ — SECCION Platform Guide for Creators & Members",
  description: "Everything you need to know about SECCION: how the 90% creator payout works, the 24/7 AI Copilot DMs, DRM anti-piracy vault, Warm Paywall, KYC verification, and how to join as a Founding Creator.",
  keywords: [
    "SECCION FAQ",
    "how does SECCION work",
    "SECCION creator payout explained",
    "AI copilot for creators FAQ",
    "DRM content protection explained",
    "OnlyFans alternative FAQ 2026",
    "warm paywall explained",
    "SECCION vs OnlyFans",
    "how to join SECCION as creator",
    "creator platform no agency fees",
    "SECCION KYC verification"
  ],
  alternates: {
    canonical: "https://seccion.ai/faq",
  },
  openGraph: {
    title: "FAQ — Everything About SECCION | 90% Payout, AI Copilot & DRM",
    description: "Your full guide to SECCION: 90% creator payout, 24/7 AI Copilot DMs in your voice, DRM anti-piracy vault, Warm Paywall, and how to become a Founding Creator.",
    url: "https://seccion.ai/faq",
    siteName: "SECCION",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SECCION FAQ — 90% Payout, AI Copilot & DRM Vault Explained",
    description: "Everything you need to know about SECCION's creator platform: payouts, AI Copilot, DRM protection, and how to join.",
    site: "@steveseccion",
    creator: "@steveseccion",
  }
};

const faqs = [
  {
    question: "What is SECCION?",
    answer: "SECCION (pronounced 'Session') is an AI-powered creator monetization platform that combines chemistry-first matchmaking with a full creator economy. It offers a 90% direct payout for Founding Creators, a 24/7 AI Copilot that engages fans in the creator's exact voice, and an unbreakable DRM content vault that prevents piracy and leaks."
  },
  {
    question: "What percentage of revenue does SECCION pay creators?",
    answer: "Founding Creators (the first 500 approved creators globally) receive a guaranteed 90% net revenue split. After the founding allocation, SECCION's permanent baseline remains 80% — significantly above industry averages. There are zero hidden fees, zero agency commissions, and zero intermediary deductions."
  },
  {
    question: "How does SECCION's 24/7 AI Copilot work?",
    answer: "SECCION's independent AI Copilot engages with your fans in direct messages 24/7 using your exact tone, vocabulary, and messaging style. It is trained strictly with your explicit permission and consent — you remain in full control at all times. The AI Copilot replaces expensive chatting agencies that typically take 40–50% of creator revenue, saving creators over €4,000/month in agency fees."
  },
  {
    question: "How does SECCION protect creator content from piracy?",
    answer: "SECCION uses a DRM (Digital Rights Management) content vault with cryptographic watermarking on every piece of media. An autonomous web sweeper continuously scans web indexes, forums, and piracy sites for leaked content and automatically files DMCA takedown notices — all without manual effort. Zero-Knowledge face blur technology also prevents unauthorized facial identification in public feeds."
  },
  {
    question: "What is the Warm Paywall?",
    answer: "The Warm Paywall is SECCION's core philosophy: financial transactions and premium content access are only unlocked after genuine chemistry and trust have been established between a creator and a fan. Basic discovery, matching, and messaging are 100% free for members. This eliminates impulse chargebacks, reduces subscriber churn by over 30%, and increases creator customer lifetime value by 3.4x compared to cold paywall platforms."
  },
  {
    question: "Is SECCION a good alternative to OnlyFans?",
    answer: "Yes. SECCION offers a higher payout (90% vs OnlyFans' 80%), a free 24/7 AI Copilot replacing the need for expensive chatting agencies, built-in automated DRM anti-piracy protection, and a chemistry-based discovery system that builds genuine fan loyalty. OnlyFans has no native AI tools, no DRM protection, and no organic discovery — creators must drive all traffic externally."
  },
  {
    question: "Is SECCION a good alternative to Patreon?",
    answer: "Yes. Patreon charges 8–12% platform fees plus processing fees (effective creator cut: 75–82%). SECCION's Founding Creator offer guarantees 90% net retention. Unlike Patreon, SECCION also includes a 24/7 AI Operations Copilot, DRM anti-piracy vaulting, live streaming, and chemistry-gated fan discovery — all in one platform."
  },
  {
    question: "How does SECCION verify creator age and identity?",
    answer: "SECCION uses the DIDIT Zero-Knowledge Identity Gateway (verify.didit.me) for creator verification across 220+ countries, combined with Sightengine AI for biometric 3D facial liveness and age estimation. Identity verification is processed ephemerally with zero document storage — fully compliant with GDPR data minimization and 18 U.S.C. § 2257."
  },
  {
    question: "What is the 8-Level Chemistry Meter?",
    answer: "The Relationship Level System (RLS v2.0) is SECCION's 8-stage connection tracker ranging from Level 1 (Undefined) to Level 8 (Soulmate). As mutual affinity grows through real interaction, new privileges unlock: voice memos, video calls, face reveals, private gallery access, and creator subscriptions. It eliminates situationship ambiguity and makes every relationship progression transparent and meaningful."
  },
  {
    question: "How do I become a Founding Creator on SECCION?",
    answer: "Apply through the SECCION Creator Portal at seccion.ai/become-creator. The Founding Creator cohort is strictly limited to the first 500 approved creators globally. Approved creators receive a 90% lifetime net revenue guarantee plus 1 year of free AI Copilot operations assistance. Approval is reviewed by the SECCION team and typically confirmed within 48–72 hours."
  },
  {
    question: "What payment methods does SECCION support for creator payouts?",
    answer: "SECCION supports multiple payout rails: SEPA Instant bank transfers across the EU, US Domestic ACH and wire transfers, Latin American localized banking gateways (Colombia, Mexico, Argentina), and direct cryptocurrency settlements via NOWPayments (USDT TRC20/Polygon, USDC, BTC, ETH) for instant, unfreezable liquidity with zero FX spread penalties."
  }
];

const breadcrumbs = [
  { name: "Home", url: "https://seccion.ai" },
  { name: "FAQ", url: "https://seccion.ai/faq" },
];

export default function FAQPage() {
  return (
    <>
      <FAQSchema faqs={faqs} />
      <BreadcrumbSchema items={breadcrumbs} />

      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">

          {/* Hero */}
          <div className="mb-14 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono font-bold uppercase tracking-widest mb-5">
              Platform Guide
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-[#b9cac9] max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about SECCION — the AI-powered creator platform with{" "}
              <span className="text-primary font-semibold">90% payouts</span>,{" "}
              <span className="text-[#ffabf3] font-semibold">24/7 AI Copilot DMs</span>, and{" "}
              <span className="text-[#39FF14] font-semibold">DRM anti-piracy protection</span>.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer open:border-primary/30 open:bg-primary/[0.03]"
              >
                <summary className="flex items-start justify-between gap-4 list-none">
                  <h2 className="text-sm sm:text-base font-bold text-white group-open:text-primary transition-colors pr-4">
                    {faq.question}
                  </h2>
                  <span className="text-white/40 group-open:text-primary text-lg font-light shrink-0 mt-0.5 transition-colors select-none">
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:block">−</span>
                  </span>
                </summary>
                <p className="mt-4 text-sm text-[#b9cac9] leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-[#ffabf3]/10 border border-primary/20 text-center">
            <h3 className="text-xl font-black text-white mb-2">Still have questions?</h3>
            <p className="text-sm text-[#b9cac9] mb-6">
              Our team is available via email, WhatsApp, and Telegram to support creators worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/become-creator"
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#00fbfb] to-[#ffabf3] text-black font-mono text-xs font-black uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,251,251,0.4)] transition"
              >
                Become a Founding Creator
              </a>
              <a
                href="/hit-us-up"
                className="px-8 py-3.5 rounded-2xl bg-white/5 border border-white/15 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition"
              >
                Contact Us
              </a>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}

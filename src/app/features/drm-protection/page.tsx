import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import Script from "next/script";

export const metadata: Metadata = {
  title: "DRM Content Vault — Anti-Piracy Protection for Creators",
  description: "SECCION's DRM Content Vault uses cryptographic watermarking and an autonomous DMCA web sweeper to protect your photos and videos from piracy, leaks, and unauthorized distribution — automatically, 24/7.",
  keywords: [
    "DRM content protection for creators",
    "creator content anti-piracy 2026",
    "OnlyFans content leak protection",
    "automated DMCA takedown creators",
    "content watermarking creators",
    "face blur privacy creator",
    "creator content vault",
    "stop fan leak creator content",
    "DRM video protection creator platform",
    "SECCION DRM vault",
    "content creator piracy protection"
  ],
  alternates: {
    canonical: "https://seccion.ai/features/drm-protection",
  },
  openGraph: {
    title: "DRM Content Vault — Stop Piracy & Leaks Automatically | SECCION",
    description: "SECCION's DRM Content Vault watermarks every piece of media and auto-fires DMCA takedowns 24/7. Your content stays yours — protected without manual effort.",
    url: "https://seccion.ai/features/drm-protection",
    siteName: "SECCION",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DRM Content Vault — Auto-DMCA & Anti-Piracy for Creators | SECCION",
    description: "Stop leaks before they spread. SECCION's DRM vault watermarks your content and auto-fires DMCA takedowns 24/7 — zero manual effort.",
    site: "@steveseccion",
    creator: "@steveseccion",
  }
};

const breadcrumbs = [
  { name: "Home", url: "https://seccion.ai" },
  { name: "Features", url: "https://seccion.ai/features/drm-protection" },
  { name: "DRM Content Vault", url: "https://seccion.ai/features/drm-protection" },
];

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How SECCION's DRM Content Vault Protects Creator Content",
  "description": "SECCION automatically watermarks, monitors, and removes stolen creator content from the internet using DRM encryption, Zero-Knowledge face blur, and autonomous DMCA web sweeping.",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Upload to the DRM Vault",
      "text": "Every photo or video uploaded to SECCION is automatically encrypted with an invisible cryptographic watermark tied to your creator identity before any fan receives access."
    },
    {
      "@type": "HowToStep",
      "name": "AI Web Sweeper monitors 24/7",
      "text": "SECCION's autonomous AI web sweeper continuously scans web indexes, social platforms, piracy sites, and forums for unauthorized copies of your content — using the embedded watermark fingerprint."
    },
    {
      "@type": "HowToStep",
      "name": "Automatic DMCA takedowns filed",
      "text": "When a leak or unauthorized copy is detected, SECCION automatically files a DMCA takedown notice and DSA (Digital Services Act) removal request — no manual filing fees, no legal expertise required."
    }
  ]
};

const drmFaqs = [
  {
    question: "What is SECCION's DRM Content Vault?",
    answer: "SECCION's DRM Content Vault is a built-in anti-piracy system that cryptographically watermarks every piece of media you upload, monitors the web 24/7 for unauthorized copies, and automatically fires DMCA takedown notices when a leak is detected — all without manual effort."
  },
  {
    question: "How does the Zero-Knowledge Face Blur work?",
    answer: "SECCION's ZKP Face Blur technology applies privacy-preserving encryption to your facial features in public feed previews. Your face is only revealed to fans who have reached a verified Level 4+ Chemistry connection — preventing unauthorized screenshot identification while your public presence remains visible."
  },
  {
    question: "Does SECCION file DMCA takedowns automatically?",
    answer: "Yes. When the AI web sweeper detects a watermark match on a piracy site, forum, or social platform, it automatically generates and submits a DMCA notice. Creators receive a notification log of every takedown action filed on their behalf."
  }
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": drmFaqs.map((f) => ({
    "@type": "Question",
    "name": f.question,
    "acceptedAnswer": { "@type": "Answer", "text": f.answer }
  }))
};

export default function DRMProtectionPage() {
  return (
    <>
      <Script
        id="howto-drm-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Script
        id="faq-drm-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">

          {/* Hero */}
          <div className="mb-16 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#39FF14]/30 bg-[#39FF14]/5 text-[#39FF14] text-xs font-mono font-bold uppercase tracking-widest mb-5">
              Feature — Content Security
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-5 leading-tight">
              DRM Content Vault<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] to-[#00fbfb]">
                Your Content Stays Yours
              </span>
            </h1>
            <p className="text-lg text-[#b9cac9] max-w-2xl mx-auto leading-relaxed mb-8">
              Every photo and video you upload is{" "}
              <strong className="text-white">cryptographically watermarked</strong>.
              Our autonomous AI web sweeper monitors the internet 24/7 and{" "}
              <strong className="text-[#39FF14]">auto-files DMCA takedowns</strong>{" "}
              the moment your content appears without authorization.
            </p>
            <a
              href="/become-creator"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#39FF14] to-[#00fbfb] text-black font-mono text-sm font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition"
            >
              Protect Your Content Now
            </a>
          </div>

          {/* The Leak Problem */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 text-center">
              The Creator Content Leak Crisis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { stat: "73%", label: "of adult creators report unauthorized content distribution within 6 months of launch", color: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/5" },
                { stat: "$0", label: "compensation received from piracy platforms for stolen creator content", color: "text-orange-400", border: "border-orange-500/20", bg: "bg-orange-500/5" },
                { stat: "Weeks", label: "average manual DMCA process — by which time content has spread irreversibly", color: "text-yellow-400", border: "border-yellow-500/20", bg: "bg-yellow-500/5" },
              ].map((item, i) => (
                <div key={i} className={`p-6 rounded-3xl border ${item.border} ${item.bg} text-center`}>
                  <div className={`text-3xl font-black ${item.color} mb-2`}>{item.stat}</div>
                  <p className="text-sm text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How DRM Vault Works */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 text-center">
              How the DRM Content Vault Works
            </h2>
            <p className="text-center text-[#b9cac9] text-sm mb-8 max-w-xl mx-auto">
              Three automated layers of content protection — no manual action required from you.
            </p>
            <div className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Cryptographic watermarking on upload",
                  body: "Every photo and video receives an invisible digital watermark bound to your creator identity and the authorized recipient fan ID. Even if a screengrab or rip occurs, the watermark survives and identifies the source of the leak.",
                  color: "text-[#39FF14]",
                  border: "border-[#39FF14]/20",
                },
                {
                  step: "02",
                  title: "Autonomous AI web sweeper",
                  body: "SECCION's AI continuously crawls web indexes, Reddit, Telegram channels, piracy forums, and file-hosting platforms. When the watermark fingerprint is matched anywhere online, the system immediately triggers a response.",
                  color: "text-[#00fbfb]",
                  border: "border-[#00fbfb]/20",
                },
                {
                  step: "03",
                  title: "Automatic DMCA & DSA takedown filing",
                  body: "Within hours of detection, SECCION auto-generates and submits a DMCA (US) and DSA (EU) takedown notice to the hosting platform. No legal expertise, no filing fees, no manual work — you receive a notification log of every action taken.",
                  color: "text-[#ffabf3]",
                  border: "border-[#ffabf3]/20",
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

          {/* Zero-Knowledge Face Blur */}
          <section className="mb-16 p-8 rounded-3xl bg-gradient-to-br from-[#39FF14]/10 via-transparent to-[#00fbfb]/10 border border-[#39FF14]/20">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-3">
              Zero-Knowledge Face Blur — Privacy Without Losing Discovery
            </h2>
            <p className="text-sm text-[#b9cac9] leading-relaxed mb-4">
              SECCION&apos;s ZKP (Zero-Knowledge Proof) Face Blur applies privacy-preserving encryption to your facial
              features in public feed previews. Your profile appears in discovery without exposing your identity to
              anonymous scrollers or screenshot bots.
            </p>
            <ul className="space-y-2 text-sm text-[#b9cac9]">
              {[
                "Face revealed only to fans who reach verified Level 4+ Chemistry — mutual trust proven before identity exposure",
                "Blur is applied client-side using on-device cryptography — SECCION servers never store unencrypted face data",
                "Prevents unauthorized screenshot identification and facial recognition scraping",
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#39FF14] mt-0.5 shrink-0">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* DRM FAQ */}
          <section className="mb-16">
            <h2 className="text-xl font-black text-white mb-6">DRM Protection — Common Questions</h2>
            <div className="space-y-4">
              {drmFaqs.map((faq, i) => (
                <details
                  key={i}
                  className="group p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer open:border-[#39FF14]/30"
                >
                  <summary className="flex items-start justify-between gap-4 list-none">
                    <h3 className="text-sm font-bold text-white group-open:text-[#39FF14] transition-colors pr-4">
                      {faq.question}
                    </h3>
                    <span className="text-white/40 group-open:text-[#39FF14] text-lg font-light shrink-0 transition-colors select-none">
                      <span className="group-open:hidden">+</span>
                      <span className="hidden group-open:block">−</span>
                    </span>
                  </summary>
                  <p className="mt-4 text-sm text-[#b9cac9] leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-black text-white mb-3">
              Your content deserves military-grade protection.
            </h2>
            <p className="text-sm text-[#b9cac9] mb-6">
              Activate the DRM Vault and AI web sweeper from Day 1 as a Founding Creator.
            </p>
            <a
              href="/become-creator"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#39FF14] to-[#00fbfb] text-black font-mono text-sm font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition"
            >
              Become a Founding Creator →
            </a>
          </div>

        </div>
      </main>
    </>
  );
}

"use client";

import React from "react";
import {
  Activity,
  BadgePercent,
  Bot,
  CreditCard,
  Eye,
  Globe,
  Landmark,
  Lock,
  MessageCircle,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { LegalIconKey, LegalSection } from "@/lib/legal-documents";

function SectionIcon({ iconKey, colorClass }: { iconKey: LegalIconKey; colorClass: string }) {
  const cls = `w-5 h-5 shrink-0 ${colorClass}`;
  switch (iconKey) {
    case "shieldAlert":
      return <ShieldAlert className={cls} />;
    case "creditCard":
      return <CreditCard className={cls} />;
    case "scale":
      return <Scale className={cls} />;
    case "messageCircle":
      return <MessageCircle className={cls} />;
    case "userCheck":
      return <UserCheck className={cls} />;
    case "shieldCheck":
      return <ShieldCheck className={cls} />;
    case "landmark":
      return <Landmark className={cls} />;
    case "eye":
      return <Eye className={cls} />;
    case "shield":
      return <Shield className={cls} />;
    case "activity":
      return <Activity className={cls} />;
    case "lock":
      return <Lock className={cls} />;
    case "users":
      return <Users className={cls} />;
    case "badgePercent":
      return <BadgePercent className={cls} />;
    case "globe":
      return <Globe className={cls} />;
    case "bot":
      return <Bot className={cls} />;
  }
}

const ACCENT_STYLES: Record<
  LegalSection["accent"],
  { iconText: string; borderLeft: string }
> = {
  cyan: {
    iconText: "text-[#00fbfb]",
    borderLeft: "border-[#00fbfb]",
  },
  pink: {
    iconText: "text-[#ffabf3]",
    borderLeft: "border-[#ffabf3]",
  },
  emerald: {
    iconText: "text-emerald-400",
    borderLeft: "border-emerald-400",
  },
};

export function LegalDoubleBezelCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2.5rem] p-1 bg-white/[0.04] border border-white/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-visible ${className}`}
    >
      <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] pointer-events-none" />
      <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0F0F1A]/95 p-8 border border-white/5 relative z-10">
        {children}
      </div>
    </div>
  );
}

export function LegalSectionsList({ sections }: { sections: LegalSection[] }) {
  return (
    <LegalDoubleBezelCard>
      <div className="space-y-10 text-left text-xs font-medium leading-relaxed text-[#b9cac9] font-sans">
        {sections.map((section, idx) => {
          const style = ACCENT_STYLES[section.accent];
          return (
            <div
              key={section.id}
              className={idx === 0 ? "space-y-4" : "space-y-4 border-t border-white/5 pt-8"}
            >
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <SectionIcon iconKey={section.iconKey} colorClass={style.iconText} />
                <h3>{section.title}</h3>
              </div>

              {section.tldr && (
                <div className={`p-4 bg-white/[0.02] border-l-2 ${style.borderLeft} rounded-r-xl space-y-1`}>
                  <span className={`text-[9px] font-mono font-bold ${style.iconText} uppercase tracking-wider block`}>
                    {section.tldrTitle}
                  </span>
                  <p className="text-[10.5px] italic text-[#b9cac9]">{section.tldr}</p>
                </div>
              )}

              <div className="space-y-2.5">
                {section.legalLabel && (
                  <span className="text-[9px] font-mono text-white/35 uppercase font-bold block">
                    {section.legalLabel}
                  </span>
                )}

                {section.introParagraphs?.map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="list-disc pl-4 space-y-1.5">
                    {section.bullets.map((bullet, bIdx) => (
                      <li key={bIdx}>
                        <strong className="text-white/95">{bullet.label}:</strong>{" "}
                        {bullet.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </LegalDoubleBezelCard>
  );
}

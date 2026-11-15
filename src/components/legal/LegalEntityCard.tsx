"use client";

import React from "react";
import { Landmark, MapPin, Shield } from "lucide-react";
import { LEGAL_ENTITY, LegalLocale, normalizeLegalLocale } from "@/lib/legal-documents";

interface LegalEntityCardProps {
  title: string;
  contactLabel: string;
  contactEmail: string;
  locale?: string;
  variant?: "landmark" | "shield";
  className?: string;
}

const REGISTRY_LABEL: Record<LegalLocale, string> = {
  en: "Registered Office",
  es: "Domicilio Social",
  fr: "Siège Social",
};

export function LegalEntityCard({
  title,
  contactLabel,
  contactEmail,
  locale,
  variant = "landmark",
  className = "",
}: LegalEntityCardProps) {
  const activeLocale = normalizeLegalLocale(locale);
  const address = LEGAL_ENTITY.addressByLocale[activeLocale];

  return (
    <div
      className={`p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-left text-[11px] text-[#b9cac9] font-mono space-y-1.5 ${className}`}
    >
      <div className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
        {variant === "shield" ? (
          <Shield className="w-4 h-4 text-[#00fbfb] shrink-0" />
        ) : (
          <Landmark className="w-4 h-4 text-[#00fbfb] shrink-0" />
        )}
        <span>{title}</span>
      </div>
      <div className="text-white text-xs font-semibold">{LEGAL_ENTITY.name}</div>
      <div className="text-[10px] text-white/75 leading-relaxed">
        NIF / CIF: <span className="text-[#00fbfb]">{LEGAL_ENTITY.nif}</span> •{" "}
        {LEGAL_ENTITY.registry}
      </div>
      <div className="text-[10px] text-white/75 leading-relaxed flex items-start gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-[#00fbfb]/80 shrink-0 mt-0.5" />
        <span>
          <span className="text-white/50">{REGISTRY_LABEL[activeLocale]}:</span> {address}
        </span>
      </div>
      <div className="text-[10px] text-white/60 pt-0.5">
        {contactLabel}:{" "}
        <a href={`mailto:${contactEmail}`} className="text-[#00fbfb] underline">
          {contactEmail}
        </a>
      </div>
    </div>
  );
}

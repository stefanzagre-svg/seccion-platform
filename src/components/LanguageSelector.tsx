"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation, LOCALES, SupportedLocale } from "@/context/LanguageContext";
import { Globe, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LanguageSelector() {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentMeta = LOCALES[locale] || LOCALES["es"];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-primary/40 rounded-full text-xs font-bold text-white transition-all shadow-sm group cursor-pointer"
        aria-label="Select Language"
      >
        <span className="text-sm">{currentMeta.flag}</span>
        <span className="uppercase text-[11px] font-black tracking-wider text-white/80 group-hover:text-white">
          {currentMeta.code}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/40 group-hover:text-primary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/15 shadow-2xl py-2 z-50 overflow-hidden"
          >
            <div className="px-3 py-1.5 border-b border-white/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
              <Globe className="w-3 h-3 text-primary" />
              <span>Language / Idioma</span>
            </div>

            <div className="py-1 max-h-60 overflow-y-auto">
              {(Object.keys(LOCALES) as SupportedLocale[]).map((code) => {
                const meta = LOCALES[code];
                const isSelected = locale === code;

                return (
                  <button
                    key={code}
                    onClick={() => {
                      setLocale(code);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-primary/15 text-primary font-bold"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{meta.flag}</span>
                      <div className="flex flex-col">
                        <span className="font-bold">{meta.nativeName}</span>
                        <span className="text-[9px] text-white/40 uppercase">{meta.name}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

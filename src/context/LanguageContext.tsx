"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

export type SupportedLocale = "es" | "en";

export interface LocaleMeta {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr" | "rtl";
}

export const LOCALES: Record<SupportedLocale, LocaleMeta> = {
  es: { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", dir: "ltr" },
  en: { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", dir: "ltr" },
};

const DICTIONARIES: Record<SupportedLocale, any> = {
  en,
  es,
};

interface LanguageContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (path: string, fallback?: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: (path: string, fallback?: string) => fallback || path,
  isRTL: false,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode; initialLocale?: SupportedLocale }> = ({ 
  children, 
  initialLocale = "en" 
}) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(initialLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check localStorage on mount as client fallback if cookie is not set
    try {
      const saved = localStorage.getItem("seccion_user_locale") as SupportedLocale;
      if (saved && LOCALES[saved] && saved !== locale) {
        setLocaleState(saved);
        document.documentElement.setAttribute("lang", saved);
        document.documentElement.setAttribute("dir", LOCALES[saved]?.dir || "ltr");
      } else {
        document.documentElement.setAttribute("lang", locale);
        document.documentElement.setAttribute("dir", LOCALES[locale]?.dir || "ltr");
      }
    } catch (e) {}
  }, []);

  const setLocale = (newLocale: SupportedLocale) => {
    if (!LOCALES[newLocale]) return;
    setLocaleState(newLocale);
    
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("seccion_user_locale", newLocale);
        document.cookie = `seccion_user_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
        document.documentElement.setAttribute("lang", newLocale);
        document.documentElement.setAttribute("dir", LOCALES[newLocale]?.dir || "ltr");
      } catch (e) {}
    }
  };

  // Dot notation translation resolver e.g. t("nav.home")
  const t = (path: string, fallback?: string): string => {
    const keys = path.split(".");
    let current: any = DICTIONARIES[locale] || DICTIONARIES["en"];
    
    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        // Fallback to English if key missing in chosen locale
        let fallbackCurrent: any = DICTIONARIES["en"];
        for (const fbKey of keys) {
          if (fallbackCurrent && typeof fallbackCurrent === "object" && fbKey in fallbackCurrent) {
            fallbackCurrent = fallbackCurrent[fbKey];
          } else {
            return fallback || path;
          }
        }
        return typeof fallbackCurrent === "string" ? fallbackCurrent : (fallback || path);
      }
    }

    return typeof current === "string" ? current : (fallback || path);
  };

  const isRTL = LOCALES[locale]?.dir === "rtl";

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);

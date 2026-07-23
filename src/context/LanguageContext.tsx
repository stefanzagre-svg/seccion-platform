"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";
import pt from "@/locales/pt.json";
import uk from "@/locales/uk.json";
import ro from "@/locales/ro.json";
import ar from "@/locales/ar.json";

export type SupportedLocale = "es" | "en" | "fr" | "pt" | "uk" | "ro" | "ar";

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
  fr: { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", dir: "ltr" },
  pt: { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹", dir: "ltr" },
  uk: { code: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦", dir: "ltr" },
  ro: { code: "ro", name: "Romanian", nativeName: "Română", flag: "🇷🇴", dir: "ltr" },
  ar: { code: "ar", name: "Moroccan Arabic", nativeName: "الدارجة المغربية", flag: "🇲🇦", dir: "rtl" },
};

const DICTIONARIES: Record<SupportedLocale, any> = {
  en,
  es,
  fr,
  pt,
  uk,
  ro,
  ar,
};

interface LanguageContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (path: string, fallback?: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "es",
  setLocale: () => {},
  t: (path: string, fallback?: string) => fallback || path,
  isRTL: false,
});

function getSavedLocale(): SupportedLocale {
  if (typeof window === "undefined") return "es";
  
  // 1. Read from localStorage
  try {
    const saved = localStorage.getItem("seccion_user_locale") as SupportedLocale;
    if (saved && LOCALES[saved]) return saved;
  } catch (e) {}

  // 2. Read from document.cookie
  try {
    const match = document.cookie.match(/(?:^|; )seccion_user_locale=([^;]*)/);
    if (match && match[1] && LOCALES[match[1] as SupportedLocale]) {
      return match[1] as SupportedLocale;
    }
  } catch (e) {}

  // 3. Fallback to browser language or default to Spanish
  const navLang = (navigator.language || "").toLowerCase();
  if (navLang.startsWith("es")) return "es";
  if (navLang.startsWith("pt")) return "pt";
  if (navLang.startsWith("uk")) return "uk";
  if (navLang.startsWith("ro")) return "ro";
  if (navLang.startsWith("ar")) return "ar";
  if (navLang.startsWith("fr")) return "fr";
  return "es";
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const activeLocale = getSavedLocale();
    setLocaleState(activeLocale);
    setMounted(true);

    document.documentElement.setAttribute("lang", activeLocale);
    document.documentElement.setAttribute("dir", LOCALES[activeLocale]?.dir || "ltr");
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
    let current: any = DICTIONARIES[locale] || DICTIONARIES["es"];
    
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

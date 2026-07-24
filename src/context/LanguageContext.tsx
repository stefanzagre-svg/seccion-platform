"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';

type Locale = 'en' | 'es' | 'fr';

const dictionaries: Record<Locale, any> = { en, es, fr };

interface LanguageContextType {
  locale: Locale;
  changeLanguage: (lang: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  // Load language preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('seccion_locale') as Locale;
      if (savedLocale && (savedLocale === 'en' || savedLocale === 'es' || savedLocale === 'fr')) {
        setLocale(savedLocale);
      } else {
        // Fallback to browser language
        const browserLang = navigator.language.split('-')[0] as Locale;
        if (browserLang === 'es' || browserLang === 'fr') {
          setLocale(browserLang);
        }
      }
    }
  }, []);

  const changeLanguage = (lang: Locale) => {
    setLocale(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('seccion_locale', lang);
    }
  };

  // Helper to retrieve nested object values by string key (e.g. 'landing.hero.title')
  const t = (key: string): string => {
    const keys = key.split('.');
    
    // 1. Try to resolve in the active locale dictionary
    let activeResult: any = dictionaries[locale];
    for (const k of keys) {
      if (activeResult && typeof activeResult === 'object') {
        activeResult = activeResult[k];
      } else {
        activeResult = undefined;
        break;
      }
    }

    if (typeof activeResult === 'string') {
      return activeResult;
    }

    // 2. Fallback to English dictionary
    let fallbackResult: any = dictionaries['en'];
    for (const k of keys) {
      if (fallbackResult && typeof fallbackResult === 'object') {
        fallbackResult = fallbackResult[k];
      } else {
        fallbackResult = undefined;
        break;
      }
    }

    if (typeof fallbackResult === 'string') {
      return fallbackResult;
    }

    // Return the raw key if not found in any dictionary
    return key;
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

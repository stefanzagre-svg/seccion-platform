import Link from "next/link";
import { getLocalizedPath, SEO_LOCALES, type SeoLocale } from "@/lib/localized-seo";

interface LocaleSwitchPillsProps {
  basePath: string;
  currentLocale: SeoLocale;
  className?: string;
}

const LABELS: Record<SeoLocale, string> = {
  en: "EN",
  es: "ES",
  fr: "FR",
};

/**
 * Crawlable SSR language switcher linking canonical EN, ES, and FR routes cleanly.
 */
export default function LocaleSwitchPills({
  basePath,
  currentLocale,
  className = "",
}: LocaleSwitchPillsProps) {
  return (
    <nav
      aria-label="Language versions"
      className={`inline-flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/10 p-1 ${className}`}
    >
      {SEO_LOCALES.map((loc) => {
        const active = loc === currentLocale;
        return (
          <Link
            key={loc}
            href={getLocalizedPath(basePath, loc)}
            hrefLang={loc}
            aria-current={active ? "page" : undefined}
            className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider transition ${
              active
                ? "bg-[#00fbfb] text-black"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            {LABELS[loc]}
          </Link>
        );
      })}
    </nav>
  );
}

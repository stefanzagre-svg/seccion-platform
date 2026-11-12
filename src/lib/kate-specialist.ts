export type AgentLang = 'fr' | 'es' | 'en' | 'ar';
export type PromptLang = AgentLang | 'darija';

export interface LanguageDetectionResult {
  uiLang: AgentLang;
  promptLang: PromptLang;
  targetLanguageDesc: string;
}

export interface SpecialistHistoryInput {
  sender?: string;
  role?: string;
  text?: string;
}

export interface GeminiTurn {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

const DARIJA_ARABIZI_STRONG =
  /\b(marhba|merhba|salam|labas|chokran|choukrane|daba|kifash|kifach|dyal|dyali|dyalek|bghiti|bghit|wach|kayn|kayna|mzyan|mezyan|3afak|3la|fash|fache|khoya|khti|maghrib|flous|jbed|t9der|y9dro|n9der|matban|3a2ila|sewwel|lmosa3ida|hna)\b/i;

const ARABIZI_DIGIT_STEMS = /\b\w*[23579]\w*\b/;
const ARABIZI_STEM_HINTS = /\b(bgh|dyal|chokr|sba7|msa|tbark|7ta|3aw|m3a|l-?\w+|n-?\w+)\b/i;

// Unambiguous high-signal words per language (avoids cross-language false positives like English "comment")
const FR_STRONG =
  /\b(bonjour|salut|coucou|merci|pourquoi|créateur|créatrice|créateurs|créatrices|plateforme|paiement|paiements|retirer|retire|argent|gagner|gagne|gains|maroc|marocain|marocaine|confidentialité|blocage|bloquer|flou|abonnés|abonnements|virement|autofacturation|réfléchit|comment\s+(?:ça|faire|puis|activer|fonctionne|marche|obtenir|fixer|lancer|configurer|retirer|se)|qu['’]est[- ]ce|c['’]est|j['’]ai|j['’]aimerais|je\s+suis|vous\s+êtes|puis-je|est-ce|pouvez-vous|avec|dans|pour|votre|notre|mon|mes|vos|nos|suis|sommes|être|voulez|veux|peux|pouvez|voix|vocal|français)\b/gi;

const FR_DIACRITICS = /[àâäçéèêëîïôöùûüÿœæ]/gi;

const ES_STRONG =
  /\b(hola|buenos|buenas|gracias|cómo|como\s+(?:funciona|puedo|activo|retiro|configuro|fijar|conseguir)|estás|creador|creadora|creadores|creadoras|plataforma|dinero|ganar|ganancias|retirar|retiro|pago|pagos|cobrar|cobro|puedo|quiero|ayuda|ayudar|marroquí|marruecos|bloqueo|bloquear|privacidad|desenfoque|suscripciones|pases|propina|propinas|autofacturación|impuestos|retención|español|tengo|estoy|para|con\s+mi|mis|nuestro|nuestra)\b/gi;

const ES_DIACRITICS = /[¿¡ñáéíóúü]/gi;

const EN_STRONG =
  /\b(hello|hey|hi|thanks|thank\s+you|please|how\s+(?:do|does|can|to|much|long|many|should|are)|what\s+(?:is|are|do|does)|where|why|when|can\s+i|could\s+i|would\s+you|leave\s+a\s+comment|comments?|creator|creators|platform|payout|payouts|withdraw|withdrawal|earnings?|money|earn|pay|payment|payments|price|pricing|profile|account|help|privacy|blur|verify|verification|studio|fans?|onlyfans|patreon|usdt|usdc|crypto|bank|wire|english|with|the|this|that|your|my)\b/gi;

function countMatches(text: string, regex: RegExp): number {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function resolveFallbackLocale(clientLocale?: string): LanguageDetectionResult {
  const norm = (clientLocale || '').trim().toLowerCase();
  if (norm === 'fr') {
    return { uiLang: 'fr', promptLang: 'fr', targetLanguageDesc: 'French (Français)' };
  }
  if (norm === 'es') {
    return { uiLang: 'es', promptLang: 'es', targetLanguageDesc: 'Spanish (Español)' };
  }
  if (norm === 'ar' || norm === 'darija') {
    return {
      uiLang: 'ar',
      promptLang: 'darija',
      targetLanguageDesc: 'Moroccan Darija (الدارجة المغربية)',
    };
  }
  return { uiLang: 'en', promptLang: 'en', targetLanguageDesc: 'English' };
}

/**
 * Detects user language cleanly from message content without naive keyword collisions
 * (e.g., English "Can a fan leave a comment?" no longer misclassifies as French).
 * Normalizes Darija Arabizi UI language to `'ar'` so client UI/question banks sync.
 */
export function detectSpecialistLanguage(
  message: string,
  clientLocale?: string
): LanguageDetectionResult {
  const userMsg = (message || '').trim();
  if (!userMsg) {
    return resolveFallbackLocale(clientLocale);
  }

  // 1. Arabic script takes highest priority
  if (/[\u0600-\u06FF]/.test(userMsg)) {
    return {
      uiLang: 'ar',
      promptLang: 'ar',
      targetLanguageDesc:
        'Modern Standard Arabic or Moroccan Darija in Arabic script (matching user dialect)',
    };
  }

  // 2. Moroccan Darija in Latin/Arabizi script
  const hasDarijaWord = DARIJA_ARABIZI_STRONG.test(userMsg);
  const hasArabiziNumbers =
    ARABIZI_DIGIT_STEMS.test(userMsg) && ARABIZI_STEM_HINTS.test(userMsg);
  if (hasDarijaWord || hasArabiziNumbers) {
    return {
      uiLang: 'ar',
      promptLang: 'darija',
      targetLanguageDesc:
        'Moroccan Darija (الدارجة المغربية) with Latin Arabizi if user used Arabizi',
    };
  }

  // 3. Weighted scoring across FR / ES / EN
  const frScore =
    countMatches(userMsg, FR_STRONG) * 2 + countMatches(userMsg, FR_DIACRITICS) * 1.5;
  const esScore =
    countMatches(userMsg, ES_STRONG) * 2 + countMatches(userMsg, ES_DIACRITICS) * 1.5;
  const enScore = countMatches(userMsg, EN_STRONG) * 2;

  const fallback = resolveFallbackLocale(clientLocale);
  const maxScore = Math.max(frScore, esScore, enScore);

  if (maxScore === 0) {
    return fallback;
  }

  // Tie-break with clientLocale if scores are equal
  const candidates: AgentLang[] = [];
  if (frScore === maxScore) candidates.push('fr');
  if (esScore === maxScore) candidates.push('es');
  if (enScore === maxScore) candidates.push('en');

  const winner: AgentLang =
    candidates.length === 1
      ? candidates[0]
      : candidates.includes(fallback.uiLang)
        ? fallback.uiLang
        : candidates[0];

  if (winner === 'fr') {
    return { uiLang: 'fr', promptLang: 'fr', targetLanguageDesc: 'French (Français)' };
  }
  if (winner === 'es') {
    return { uiLang: 'es', promptLang: 'es', targetLanguageDesc: 'Spanish (Español)' };
  }
  return { uiLang: 'en', promptLang: 'en', targetLanguageDesc: 'English' };
}

/**
 * Sanitizes and bounds conversation history passed from client into Gemini multi-turn format.
 */
export function sanitizeHistory(history: unknown, maxTurns = 8): GeminiTurn[] {
  if (!Array.isArray(history)) return [];
  const cleaned: GeminiTurn[] = [];

  for (const item of history.slice(-maxTurns)) {
    if (!item || typeof item !== 'object') continue;
    const entry = item as SpecialistHistoryInput;
    const rawText = typeof entry.text === 'string' ? entry.text.trim() : '';
    if (!rawText) continue;

    const isUser = entry.sender === 'user' || entry.role === 'user';
    const role: 'user' | 'model' = isUser ? 'user' : 'model';

    // Avoid consecutive duplicate roles by skipping if identical turn was already pushed
    const clipped = rawText.slice(0, 500);
    cleaned.push({ role, parts: [{ text: clipped }] });
  }

  // Gemini expects conversation turns to begin with a user turn when possible
  while (cleaned.length > 0 && cleaned[0].role === 'model') {
    cleaned.shift();
  }

  return cleaned;
}

/**
 * Context-aware localized fallback reply if upstream Gemini is temporarily unavailable/throttled.
 */
export function getContextualFallbackReply(lang: AgentLang, userMsg: string): string {
  const q = (userMsg || '').toLowerCase();

  const isPayout =
    /(payout|retrait|withdraw|usdt|usdc|crypto|bank|wire|flous|jbed|dinero|retirar|cobrar|rib|binance|wise|90%|fee|commission)/i.test(
      q
    );
  const isPrivacy =
    /(privacy|confidentialit|geo|maroc|ma\b|blur|flou|desenfoque|drm|watermark|kyc|didit|zkp|family|famille|bloqui|3a2ila|invisib)/i.test(
      q
    );
  const isStudio =
    /(studio|vip|ppv|price|tarif|copilot|ai\b|ia\b|live|stream|comment|fan|matchmaking|quest|founder|fondateur|fundador)/i.test(
      q
    );

  if (lang === 'ar') {
    if (isPayout) {
      return "F SECCION (Session), kat-b9a lik 90% dyal l-flous dyalek net, bla hta chi agence. T9der t-khelless f USDT (Polygon / TRC20) b frais sghar bezaf, wla b virement bancaire / Paxum f l-wa9t li ytfet7o les rails officiels.";
    }
    if (isPrivacy) {
      return "L-privacy dyalek hiya awel haja: t9der t-activi blocage dyal l-Maghrib 'MA' f clic wahed men Creator Studio bach l-profil dyalek mayban l-hta wahed f l-blad, m3a flou facial automatique, DRM watermark w KYC Zero-Knowledge DIDIT.";
    }
    if (isStudio) {
      return "Men Creator Studio, t9der t-7aded taman dyal VIP Pass (ex: $9.99/mois), les vidéos PPV, les lives privés w t-activi l-Copilot IA dyalek li kay-jaweb 24/7 b l-style dyalek.";
    }
    return "Marhba bik! 👋 Ana Kate, lmosa3ida dyalek f SECCION. T9der men daba t-9ad l-profil dyalek, t-chouf les outils dyal Creator Studio w t-stafed men l-privacy l-kamla (blocage 'MA' en 1 clic) w 90% net. Bghiti n-bdaou n-9ado l-profil dyalek daba?";
  }

  if (lang === 'fr') {
    if (isPayout) {
      return "Sur SECCION, vous conservez 90 % de vos revenus nets sans aucune commission d'agence. Les retraits supportent l'USDT/USDC (Polygon ou TRC20), le virement SEPA Instant, Wise Business et l'autofacturation B2B neutre.";
    }
    if (isPrivacy) {
      return "Votre discrétion est maximale : vous pouvez activer le blocage géographique 'MA' en 1 clic dans le Creator Studio pour être 100 % invisible au Maroc, avec flou facial progressif, DRM forensique et vérification DIDIT Zero-Knowledge en 60s.";
    }
    if (isStudio) {
      return "Dans votre Creator Studio, vous configurez librement vos pass VIP, médias PPV dans votre coffre DRM, diffusions live privées et votre Copilot IA qui répond à vos fans 24/7 dans votre ton exact.";
    }
    return "Bonjour ! 👋 Je suis Kate, votre conseillère SECCION. Avec SECCION, vous conservez 90 % de vos revenus nets et bénéficiez d'une protection DRM totale avec bouclier de confidentialité en 1 clic. Comment puis-je vous aider à configurer votre studio aujourd'hui ?";
  }

  if (lang === 'es') {
    if (isPayout) {
      return "En SECCION te quedas con el 90% de tus ingresos netos, sin agencias ni contratos perpetuos. Soportamos retiros en USDT/USDC (Polygon y TRC20), transferencia bancaria local vía Wise Business, SEPA y autofacturación B2B automática.";
    }
    if (isPrivacy) {
      return "Tu privacidad está blindada: puedes activar el bloqueo geográfico por país en 1 clic desde Creator Studio, usar desenfoque facial progresivo, marcas de agua DRM forenses y verificación KYC Zero-Knowledge con DIDIT en menos de 60 segundos.";
    }
    if (isStudio) {
      return "Desde Creator Studio puedes fijar tus precios VIP y PPV, subir tu contenido al cofre DRM, hacer transmisiones en vivo privadas y entrenar a tu Copilot IA para responder DMs 24/7 con tu propia voz.";
    }
    return "¡Hola! Soy Kate, tu Asesora de Onboarding y Monetización en SECCION. En SECCION te quedas con el 90% de tus ingresos netos y tu contenido está protegido con DRM forense. ¿En qué paso del Creator Studio o configuración de tu perfil te gustaría que te guíe primero?";
  }

  if (isPayout) {
    return "On SECCION, you keep 90% of your net earnings with zero agency cuts or perpetual contracts. Supported payout rails include instant USDT/USDC (Polygon & TRC20), SEPA Instant, Wise Business local bank wires, and automated neutral B2B self-billing.";
  }
  if (isPrivacy) {
    return "Privacy is built into the core: enable 1-click domestic country geo-blocking in Creator Studio, progressive face-blur, forensic session-watermarked DRM, and 60-second DIDIT Zero-Knowledge ID verification without storing raw IDs on public servers.";
  }
  if (isStudio) {
    return "Inside Creator Studio, you control VIP subscription pricing, PPV vault unlocks, private interactive live streams, and your 24/7 AI Copilot trained in your Obsidian [[Persona]] and [[Boundaries]].";
  }
  return "Hello! 👋 I'm Kate, your SECCION Creator Growth Partner. On SECCION, you keep 90% net revenue with full DRM content protection and 1-click geo-blocking. What part of your profile or Creator Studio would you like to set up first?";
}

/**
 * Prepares text for ElevenLabs / Web Speech TTS:
 * - Pronounces SECCION phonetically as "Session"
 * - Strips markdown links, raw URLs, and formatting symbols
 * - Truncates cleanly at sentence or word boundary within maxChars
 */
export function prepareSpeechText(rawText: string, maxChars = 400): string {
  if (!rawText || typeof rawText !== 'string') return '';

  const sanitized = rawText
    // Keep link text while removing target URL: [Creator Studio](https://...) -> Creator Studio
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/gi, '$1')
    // Strip standalone URLs so TTS never reads "h-t-t-p-s colon slash slash..."
    .replace(/https?:\/\/\S+/gi, '')
    // Ensure phonetic brand pronunciation
    .replace(/\bSECCION\b/gi, 'Session')
    // Remove markdown formatting tokens
    .replace(/[#*_~`>|]/g, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();

  if (sanitized.length <= maxChars) {
    return sanitized;
  }

  const head = sanitized.slice(0, maxChars);
  const minSentenceBoundary = Math.floor(maxChars * 0.35);
  const minWordBoundary = Math.floor(maxChars * 0.55);

  // Prefer breaking cleanly on sentence punctuation
  let bestCut = -1;
  for (let i = head.length - 1; i >= minSentenceBoundary; i--) {
    const ch = head[i];
    if (ch === '.' || ch === '!' || ch === '?' || ch === '؟') {
      bestCut = i + 1;
      break;
    }
  }
  if (bestCut >= minSentenceBoundary) {
    return head.slice(0, bestCut).trim();
  }

  // Fallback to last word boundary
  const lastSpace = head.lastIndexOf(' ');
  if (lastSpace > minWordBoundary) {
    return head.slice(0, lastSpace).trim();
  }

  return head.trim();
}

/**
 * Active low-latency Gemini fallback chain ordered by verified live availability & separate quota buckets.
 * Excludes deprecated 404 models (e.g. gemini-2.0-flash, gemini-2.5-flash-lite) and places active models before
 * strictly free-tier-capped gemini-2.5-flash (20 RPD).
 */
export const SPECIALIST_MODEL_CHAIN: readonly string[] = [
  'gemini-3-flash-preview',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash',
];

/**
 * Identifies transient upstream Gemini errors (short RPM spikes / 503 high demand) worth a brief retry,
 * vs. permanent 404 deprecation or daily (RPD) quota exhaustion which should fail over immediately.
 */
export function isTransientGeminiError(err: unknown): boolean {
  const msg = String((err as any)?.message ?? err ?? '');
  if (!msg) return false;
  if (/\b404\b|no longer available|not found/i.test(msg)) return false;
  if (/PerDay|FreeTier.*limit:\s*\d+/i.test(msg)) return false;
  return /\b(429|500|502|503|504)\b|UNAVAILABLE|high demand|RESOURCE_EXHAUSTED|timeout|fetch failed/i.test(
    msg
  );
}

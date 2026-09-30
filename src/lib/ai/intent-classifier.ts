/**
 * Threat Intent Classifier & Guardrail Engine
 * 
 * Inspects incoming member queries against both global policy threats
 * (offline meetups, direct off-platform payments, financial advice)
 * and creator-configured restrictions (prohibiting media, NSFW text, etc.)
 */

export type ProhibitedIntentType =
  | 'IN_PERSON_MEETUP'
  | 'OFF_PLATFORM_TRANSACTION'
  | 'FINANCIAL_CRYPTO_ADVICE'
  | 'EXPLICIT_PII_HARVEST'
  | 'NSFW_RESTRICTED'
  | 'MEDIA_REQUEST_BLOCKED';

export interface IntentRule {
  intent: ProhibitedIntentType;
  pattern: RegExp;
  reason: string;
  deflectionResponse: string;
}

export interface CreatorRestrictionSettings {
  allow_photos?: boolean;
  allow_videos?: boolean;
  allow_voice_notes?: boolean;
  block_in_person_meetups?: boolean;
  block_off_platform_financials?: boolean;
  block_financial_crypto_advice?: boolean;
  block_nsfw_text?: boolean;
}

export interface IntentClassificationResult {
  isSafe: boolean;
  flaggedIntent?: ProhibitedIntentType;
  reason?: string;
  deflectionMessage?: string;
}

const GLOBAL_THREAT_RULES: IntentRule[] = [
  {
    intent: 'IN_PERSON_MEETUP',
    pattern: /\b(meet up|in person|hotel room|hotel lobby|where do you live|come to my room|what address|grab a drink tonight|hang out in private)\b/i,
    reason: 'Safety policy prohibits arranging in-person meetings via the digital copilot.',
    deflectionResponse: 'i love connecting with you here on seccion, but i never arrange in-person or offline meetups! 💕',
  },
  {
    intent: 'OFF_PLATFORM_TRANSACTION',
    pattern: /\b(cashapp|venmo|send via zelle|zelle me|paypal family|western union|send direct to my wallet|pay outside)\b/i,
    reason: 'Off-platform financial solicitation violates escrow and safety compliance.',
    deflectionResponse: 'all my exclusive content, tips, and unlocks are handled safely and directly through seccion! ✨',
  },
  {
    intent: 'FINANCIAL_CRYPTO_ADVICE',
    pattern: /\b(buy this token|crypto advice|financial advice|guaranteed return|invest in this|pump and dump|forex signal)\b/i,
    reason: 'Financial and investment advice is strictly prohibited.',
    deflectionResponse: 'i keep all my chats fun and creative — definitely not here to give financial or investment tips!',
  },
  {
    intent: 'EXPLICIT_PII_HARVEST',
    pattern: /\b(what is your real full name|what's your real name|send your passport|send your personal phone|what street do you live on)\b/i,
    reason: 'Attempted harvesting of creator personal identity documents or home coordinates.',
    deflectionResponse: 'i keep my private documents and real-life coordinates completely confidential! thanks for understanding 💕',
  }
];

export function classifyMessageIntent(
  message: string,
  creatorRestrictions?: CreatorRestrictionSettings
): IntentClassificationResult {
  if (!message || typeof message !== 'string') {
    return { isSafe: true };
  }

  // 1. Check Global Threat Rules
  for (const rule of GLOBAL_THREAT_RULES) {
    if (rule.intent === 'IN_PERSON_MEETUP' && creatorRestrictions?.block_in_person_meetups === false) {
      continue;
    }
    if (rule.intent === 'OFF_PLATFORM_TRANSACTION' && creatorRestrictions?.block_off_platform_financials === false) {
      continue;
    }
    if (rule.intent === 'FINANCIAL_CRYPTO_ADVICE' && creatorRestrictions?.block_financial_crypto_advice === false) {
      continue;
    }

    if (rule.pattern.test(message)) {
      return {
        isSafe: false,
        flaggedIntent: rule.intent,
        reason: rule.reason,
        deflectionMessage: rule.deflectionResponse,
      };
    }
  }

  // 2. Check Creator-Specific NSFW Text Restrictions
  if (creatorRestrictions?.block_nsfw_text) {
    const nsfwPattern = /\b(fuck|sex|porn|nude|naked|masturbat|horny|cum|cock|pussy|tits)\b/i;
    if (nsfwPattern.test(message)) {
      return {
        isSafe: false,
        flaggedIntent: 'NSFW_RESTRICTED',
        reason: 'Creator has disabled explicit/NSFW conversation themes.',
        deflectionMessage: 'let\'s keep our conversation sweet and positive — that kind of talk isn\'t my vibe! ✨',
      };
    }
  }

  // 3. Check Media Solicitation Restrictions
  const requestsPhoto = /\b(send a pic|send photo|send selfie|send a selfie|show me your picture|got a pic|selfie)\b/i.test(message);
  const requestsVideo = /\b(send a video|send clip|show me a video|send vid|video)\b/i.test(message);

  if (requestsPhoto && creatorRestrictions?.allow_photos === false) {
    return {
      isSafe: false,
      flaggedIntent: 'MEDIA_REQUEST_BLOCKED',
      reason: 'Photo dispatch is currently disabled by creator settings for this tier.',
      deflectionMessage: 'i\'m not sending photos right now, but check out my public feed album for my latest updates! 📸',
    };
  }

  if (requestsVideo && creatorRestrictions?.allow_videos === false) {
    return {
      isSafe: false,
      flaggedIntent: 'MEDIA_REQUEST_BLOCKED',
      reason: 'Video dispatch is currently disabled by creator settings for this tier.',
      deflectionMessage: 'video replies are locked right now, but stay tuned for my next stream! 🎬',
    };
  }

  return { isSafe: true };
}

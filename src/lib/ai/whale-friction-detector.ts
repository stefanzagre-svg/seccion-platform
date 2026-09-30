/**
 * Whale & Member Sentiment Friction Detector
 * 
 * Inspects incoming message tone and lifetime fan value.
 * If severe hostility, chargeback threats, or VIP "whale" status is detected,
 * the automated copilot pauses itself and immediately surfaces an escalation alert.
 */

export interface SentimentAnalysisResult {
  sentimentScore: number; // -1.0 (very negative) to 1.0 (very positive)
  requiresHumanEscalation: boolean;
  escalationReason?: string;
  isWhale: boolean;
}

const HOSTILE_KEYWORDS = [
  'chargeback', 'refund now', 'scam', 'fraud', 'sue you', 'lawyer',
  'steal my money', 'report you', 'police', 'waste of money', 'liar'
];

export function analyzeMemberFriction(
  messageText: string,
  lifetimeSpendCents: number = 0
): SentimentAnalysisResult {
  const normalized = messageText.toLowerCase();
  const WHALE_THRESHOLD_CENTS = 25000; // $250.00+ lifetime spend qualifies as a VIP whale

  const isWhale = lifetimeSpendCents >= WHALE_THRESHOLD_CENTS;

  // 1. Detect Hostility / Legal / Payment Disputes
  const matchedHostileWord = HOSTILE_KEYWORDS.find(word => normalized.includes(word));
  if (matchedHostileWord) {
    return {
      sentimentScore: -0.9,
      requiresHumanEscalation: true,
      escalationReason: `Friction alert: Member used dispute/hostile term "${matchedHostileWord}". AI paused for manual resolution.`,
      isWhale,
    };
  }

  // 2. Whale High-Touch Protection
  // If a VIP whale asks a complex question or mentions spending, human intervention is favored
  const whaleDirectAsk = isWhale && /\b(speak to you|real you|custom order|private call|question about payment)\b/i.test(normalized);
  if (whaleDirectAsk) {
    return {
      sentimentScore: 0.1,
      requiresHumanEscalation: true,
      escalationReason: 'Whale high-touch event: VIP supporter requested direct creator attention.',
      isWhale: true,
    };
  }

  // 3. Simple Sentiment Estimator
  const positiveWords = ['love', 'amazing', 'gorgeous', 'beautiful', 'great', 'thank', 'excited', 'awesome', 'best'];
  const negativeWords = ['disappointed', 'boring', 'slow', 'bad', 'hate', 'annoying', 'rude', 'overpriced'];

  let score = 0.0;
  positiveWords.forEach(w => { if (normalized.includes(w)) score += 0.2; });
  negativeWords.forEach(w => { if (normalized.includes(w)) score -= 0.3; });

  score = Math.max(-1.0, Math.min(1.0, score));

  return {
    sentimentScore: score,
    requiresHumanEscalation: false,
    isWhale,
  };
}

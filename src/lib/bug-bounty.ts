// ─── SECCION Bug Bounty & Glitch Reporter System ─────────────────────────────
// Core utilities, category definitions, reward calculations, and telemetry types.
// ─────────────────────────────────────────────────────────────────────────────

export type BugCategory = 
  | 'visual_display' 
  | 'payment_credits' 
  | 'video_stream' 
  | 'chat_messages' 
  | 'login_signup' 
  | 'other';

export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';
export type BugStatus = 'pending' | 'under_review' | 'verified' | 'rejected' | 'resolved';
export type RewardType = 'xp_vip' | 'radar_boost' | 'ai_credits' | 'custom';

export interface BugCategoryOption {
  id: BugCategory;
  emoji: string;
  labelEn: string;
  labelEs: string;
  descEn: string;
  descEs: string;
}

export const BUG_CATEGORIES: BugCategoryOption[] = [
  {
    id: 'visual_display',
    emoji: '🖼️',
    labelEn: 'Visual or Button Issue',
    labelEs: 'Problema Visual o de Botón',
    descEn: 'A button does not click, text is overlapping, or visual glitch',
    descEs: 'Un botón no responde, texto superpuesto o problema visual'
  },
  {
    id: 'payment_credits',
    emoji: '💳',
    labelEn: 'Payment, Credits or Subscription',
    labelEs: 'Pago, Créditos o Suscripción',
    descEn: 'Trouble purchasing credits, subscribing, or checkout delay',
    descEs: 'Problema comprando créditos, suscribiéndose o pago con retraso'
  },
  {
    id: 'video_stream',
    emoji: '🎥',
    labelEn: 'Video or Live Stream Problem',
    labelEs: 'Video o Transmisión en Vivo',
    descEn: 'Video does not play, camera fails, or stream disconnects',
    descEs: 'El video no reproduce, falla la cámara o se corta el stream'
  },
  {
    id: 'chat_messages',
    emoji: '💬',
    labelEn: 'Chat or AI Wingman Problem',
    labelEs: 'Chat o Asistente IA Wingman',
    descEn: 'Messages failing to send, audio translator stuck, or AI delay',
    descEs: 'Mensajes que no envían, traductor pausado o demora de la IA'
  },
  {
    id: 'login_signup',
    emoji: '🔑',
    labelEn: 'Login or Sign-Up Trouble',
    labelEs: 'Inicio de Sesión o Registro',
    descEn: 'Passcode issue, email verification, or profile setup error',
    descEs: 'Problema con código, verificación de correo o error de setup'
  },
  {
    id: 'other',
    emoji: '💡',
    labelEn: 'Something Else / Suggestion',
    labelEs: 'Otro Problema o Sugerencia',
    descEn: 'Any other unexpected glitch or improvement idea',
    descEs: 'Cualquier otro fallo inesperado o idea de mejora'
  }
];

export interface RewardPackage {
  rewardType: RewardType;
  rewardAmount: number;
  descriptionEn: string;
  descriptionEs: string;
}

/**
 * Calculates standard reward based on reporter role and bug severity.
 */
export function calculateBugReward(role: 'member' | 'creator' | 'guest', severity: BugSeverity = 'medium'): RewardPackage {
  if (role === 'creator') {
    const boostHours = severity === 'critical' ? 72 : severity === 'high' ? 48 : 24;
    const aiCredits = severity === 'critical' ? 100 : severity === 'high' ? 50 : 25;
    return {
      rewardType: 'radar_boost',
      rewardAmount: boostHours,
      descriptionEn: `${boostHours}h Radar Discovery Boost Pass + ${aiCredits} AI Assistant Credits`,
      descriptionEs: `Pase de Boost Radar de ${boostHours}h + ${aiCredits} Créditos de Asistente IA`
    };
  }

  // Member Reward (Default)
  const xp = severity === 'critical' ? 500 : severity === 'high' ? 350 : 250;
  return {
    rewardType: 'xp_vip',
    rewardAmount: xp,
    descriptionEn: `+${xp} Harmonic XP (Chemistry Meter Boost) + 7-Day VIP Badge`,
    descriptionEs: `+${xp} XP Armónica (Impulso Medidor de Química) + Insignia VIP de 7 Días`
  };
}

/**
 * Basic in-memory rate limiter tracker (5 submissions / hour)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkBugReportRateLimit(identifier: string, limit = 5, windowMs = 3600000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

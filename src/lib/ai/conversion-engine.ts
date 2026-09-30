/**
 * Conversion & Organic Delivery Engine
 * 
 * Handles:
 * 1. Multi-Turn Sales Pitch Calibration (3-Step conversational ramp)
 * 2. Typing Cadence & Organic Latency Calculation (chars * 60ms + jitter)
 */

export interface SalesRampState {
  currentStep: 1 | 2 | 3;
  goalType: string;
  isCompleted: boolean;
}

export interface RampDirective {
  step: 1 | 2 | 3;
  instruction: string;
}

export function resolveRampDirective(goalType: string, currentStep: number): RampDirective {
  const step = (currentStep >= 1 && currentStep <= 3 ? currentStep : 1) as 1 | 2 | 3;

  switch (goalType) {
    case 'SUBSCRIBE_VIP':
      if (step === 1) {
        return {
          step: 1,
          instruction: 'Step 1 (Discovery & Need): Acknowledge fan passion, ask what kind of exclusive content they enjoy most. Do NOT pitch the subscription yet.',
        };
      }
      if (step === 2) {
        return {
          step: 2,
          instruction: 'Step 2 (Tease): Mention you just posted an unreleased set/story in your private VIP feed that matches their interest. Hint at how active you are there.',
        };
      }
      return {
        step: 3,
        instruction: 'Step 3 (Call-to-Action): Warmly invite them to join your VIP tier and mention the perks. Deliver a direct, friendly invitation.',
      };

    case 'PLAN_VIDEO_CALL':
      if (step === 1) {
        return {
          step: 1,
          instruction: 'Step 1: Express how much you appreciate their conversation and energy today. Ask what they are working on or doing this week.',
        };
      }
      if (step === 2) {
        return {
          step: 2,
          instruction: 'Step 2: Mention you love having real face-to-face video chats with your top supporters because text doesn\'t capture the full vibe.',
        };
      }
      return {
        step: 3,
        instruction: 'Step 3: Propose booking a 15-minute 1-on-1 video call on your schedule so you can talk in real time.',
      };

    case 'BOOK_CONSULTATION':
      if (step === 1) {
        return {
          step: 1,
          instruction: 'Step 1: Ask an open-ended question about their personal goals or current creative/fitness challenges.',
        };
      }
      if (step === 2) {
        return {
          step: 2,
          instruction: 'Step 2: Share a brief empathetic insight and explain how you help clients through tailored 1-on-1 strategy sessions.',
        };
      }
      return {
        step: 3,
        instruction: 'Step 3: Invite them to schedule an official consultation slot through your SECCION profile.',
      };

    default: // DISCOVERY or fallback
      return {
        step: 1,
        instruction: 'Open conversation: Keep answers authentic, playful, and brief (1-2 sentences). Ask about their day or favorite hobbies.',
      };
  }
}

/**
 * Organic Typing Cadence
 * Computes human-perceived typing delay (chars * 60ms) + organic jitter (1.5s - 3.0s)
 * Capped between 1500ms and 8000ms.
 */
export function calculateTypingCadence(replyText: string): number {
  if (!replyText) return 1500;
  const charDelay = replyText.length * 55;
  const organicJitter = Math.floor(Math.random() * 1500) + 1200; // 1200ms to 2700ms jitter
  const total = charDelay + organicJitter;
  return Math.min(8000, Math.max(1800, total));
}

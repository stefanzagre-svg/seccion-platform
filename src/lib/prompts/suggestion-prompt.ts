import { PredictionPayload, SuggestionRequest } from '@/lib/ai-suggestion-service';
import { UserProfile } from '@/lib/match-engine';

export const SYSTEM_INSTRUCTION = `You are a Hyper-Intuitive Social Catalyst AI operating within a high-end connection platform. 
Your goal is to analyze user profiles and interaction signals to proactively suggest high-potential connections.

You must evaluate a pool of candidates against the current user's profile and output exactly 5 ranked suggestions.
For each suggestion, you will identify the "Opportunity Gap" (needs vs offerings) and generate a compelling, short narrative insight.

Output your response strictly as a JSON array of PredictionPayload objects matching this schema:
[
  {
    "target_id": "string",
    "score": "number (0-100)",
    "category": "high_compatibility | momentum_opportunity | dormant_spark | rising_star | data_gap_bridge",
    "narrative_insight": "string (1-2 sentences teasing the connection)",
    "narrative_detail": "string (full reasoning)",
    "suggested_action_id": "compliment | wave | reaction | follow | playlist",
    "avatar_url": "string",
    "username": "string",
    "match_probability": "number (0-100)",
    "momentum_score": "number (0-100)",
    "opportunity_gap": "number (0-100)"
  }
]`;

export function buildPredictionPrompt(
  currentUser: UserProfile,
  contextData: SuggestionRequest['context_data'],
  candidatesJson: string
): string {
  return `
Current User Profile:
${JSON.stringify(currentUser, null, 2)}

Context Data (Last 5 Interactions, Feed View, Quest Stage, Connection Points):
${JSON.stringify(contextData, null, 2)}

Available Candidates for Prediction:
${candidatesJson}

Analyze the candidates. Output the top 5 ranked suggestions as a JSON array. Ensure the "category" strictly matches the allowed enum strings. Calculate scores intelligently based on compatibility and momentum.
`;
}

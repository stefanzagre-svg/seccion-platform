import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

interface AuditRisk {
  clause: string;
  finding: string;
  severity: 'high' | 'medium' | 'low';
  lawReference?: string;
  recommendation: string;
}

export async function POST(req: NextRequest) {
  try {
    const { contractText } = await req.json();

    if (!contractText || contractText.trim().length === 0) {
      return NextResponse.json({ error: 'Missing required field: contractText' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const sandboxMode = !geminiKey;
    let auditReport: { risks: AuditRisk[]; summary: string } = { risks: [], summary: '' };
    let engine: 'gemini' | 'heuristic' = sandboxMode ? 'heuristic' : 'gemini';

    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        
        const systemInstruction = `
You are the SECCION Legal Vetting Copilot.
You analyze incoming brand sponsorship and management contracts for digital creators.
Your task is to review the contract and flag terms violating:
1. NY Labor Law Art. 36 (Fashion Workers Act) - requires commission caps (20%), no automatic renewals, and specific written consent for "digital replicas" / likeness cloning.
2. FTC Guidelines - requires clear sponsored disclosures (#ad / #sponsored).
3. Sunset Clauses - tail commissions must have a clear cut-off date (ideally 3-12 months post-contract, cap at 24 months). Flag missing sunset clauses.
4. General IP and Ownership - flag indefinite assignments of rights or likeness.

Return ONLY a valid JSON object matching this schema:
{
  "risks": [
    {
      "clause": "The exact wording of the problematic term from the contract",
      "finding": "Why it is problematic (e.g. commission exceeds 20%, automatic likeness renewal, etc.)",
      "severity": "high" | "medium" | "low",
      "lawReference": "Law referenced (e.g. NY Labor Law Art 36, FTC Guidelines, Tail Commission limits)",
      "recommendation": "Wording to replace it with or action to take"
    }
  ],
  "summary": "Concise 2-sentence summary of the contract's risk posture."
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contractText,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });

        const text = response.text;
        if (text) {
          auditReport = JSON.parse(text);
        } else {
          throw new Error('Gemini returned empty text for contract audit.');
        }
      } catch (geminiError) {
        console.warn('[Legal Audit] Gemini unavailable, falling back to heuristic scanner:', geminiError);
        auditReport = runLocalHeuristicAudit(contractText);
        engine = 'heuristic';
      }
    } else {
      console.log('[Legal Audit] No GEMINI_API_KEY — using heuristic scanner (sandbox mode).');
      auditReport = runLocalHeuristicAudit(contractText);
    }

    return NextResponse.json({
      ...auditReport,
      engine,
      ...(sandboxMode && { _sandboxMode: true }),
    });

  } catch (err: any) {
    console.error('Legal Vetting API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}

function runLocalHeuristicAudit(text: string): { risks: AuditRisk[]; summary: string } {
  const risks: AuditRisk[] = [];
  const normalized = text.toLowerCase();

  // 1. Commission check
  const commissionMatch = text.match(/(\d+)\s*%\s*commission/i) || text.match(/commission\s*(?:of|is)?\s*(\d+)\s*%/i);
  if (commissionMatch) {
    const rate = parseInt(commissionMatch[1], 10);
    if (rate > 20) {
      risks.push({
        clause: commissionMatch[0],
        finding: `The commission rate of ${rate}% exceeds the standard 20% limit established in state management regulations (e.g. NY Fashion Workers Act).`,
        severity: 'high',
        lawReference: 'NY Labor Law Art. 36 (Fashion Workers Act)',
        recommendation: `Request to reduce the commission rate to a maximum of 20% of net earnings.`
      });
    }
  }

  // 2. Digital Replica / Likeness cloning check
  if (normalized.includes('digital replica') || normalized.includes('likeness') || normalized.includes('avatar') || normalized.includes('ai replication') || normalized.includes('reproduce voice')) {
    risks.push({
      clause: `likeness / digital replication clauses in contract`,
      finding: `Indefinite right to utilize digital replicas or voice replication detected in standard clauses without separate written consent.`,
      severity: 'high',
      lawReference: 'NY Labor Law Art. 36 & FTC Likeness rules',
      recommendation: `Add a separate, specific written consent rider that limits the duration, geographic scope, and specific uses of any AI-generated replica.`
    });
  }

  // 3. Sunset clause check
  if (!normalized.includes('sunset') && !normalized.includes('post-termination') && !normalized.includes('termination tail')) {
    risks.push({
      clause: `Entire Contract (Missing Term)`,
      finding: `No post-termination tail commission cut-off (Sunset clause) detected. You may owe commissions indefinitely.`,
      severity: 'high',
      lawReference: 'Standard Talent Contract Guidelines',
      recommendation: `Insert a firm 3-6 month sunset clause capping all commissions on pre-existing deals, stepping down to 0% after.`
    });
  }

  // 4. Exclusivity check
  if (normalized.includes('sole and exclusive') || normalized.includes('exclusivity')) {
    risks.push({
      clause: `exclusivity restrictions`,
      finding: `Broad exclusivity prevents you from negotiating independent brand deals or sponsorships.`,
      severity: 'medium',
      recommendation: `Narrow the scope of exclusivity to direct competitors only during the campaign term.`
    });
  }

  const summary = risks.length > 0 
    ? `Heuristic scan flagged ${risks.length} key compliance risks, primarily concerning commissions, likeness rights, and post-termination commissions.`
    : `Heuristic scan completed successfully. No critical sunset or digital replica compliance risks detected in contract text.`;

  return { risks, summary };
}

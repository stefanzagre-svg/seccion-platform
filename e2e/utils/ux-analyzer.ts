import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface UXFrictionEvent {
  type: 'RAGE_CLICK' | 'LAYOUT_SHIFT' | 'DEAD_CLICK' | 'SLOW_INTERACTION' | 'UNHANDLED_EXCEPTION';
  timestamp: number;
  selector?: string;
  coordinates?: { x: number; y: number };
  score?: number;
  durationMs?: number;
  message: string;
}

export interface CognitiveLoadReport {
  timestamp: number;
  url: string;
  metrics: {
    domNodeCount: number;
    maxDomDepth: number;
    clutterIndex: number;
    hicksLawScore: {
      totalChoices: number;
      estimatedDecisionTimeSeconds: number;
      status: 'low' | 'moderate' | 'high';
    };
    formComplexity: {
      inputCount: number;
      ungroupedInputCount: number;
      missingLabelsCount: number;
      complexityStatus: 'low' | 'moderate' | 'high';
    };
  };
}

export interface UnifiedUXAuditReport {
  url: string;
  timestamp: string;
  frictionEvents: UXFrictionEvent[];
  cognitiveLoad: CognitiveLoadReport | null;
  summary: {
    totalFrictionPoints: number;
    frictionSeverity: 'low' | 'medium' | 'critical';
    cognitiveComplexity: 'low' | 'moderate' | 'high';
    recommendations: string[];
  };
}

export class UXAnalyzer {
  private page: Page;
  private frictionEvents: UXFrictionEvent[] = [];
  private outputDir: string;

  constructor(page: Page, outputDir?: string) {
    this.page = page;
    this.outputDir = outputDir || path.resolve(process.cwd(), 'reports', 'ux-audit-reports');
  }

  async startMonitoring() {
    this.frictionEvents = [];
    
    await this.page.addInitScript(() => {
      (window as any).__uxFrictionEvents = [];
      const clickHistory: { time: number; x: number; y: number; target: string }[] = [];

      // 1. Rage Click & Dead Click Detection
      document.addEventListener('click', (e: MouseEvent) => {
        const now = performance.now();
        const target = e.target as HTMLElement;
        const selector = target ? (target.tagName.toLowerCase() + (target.className ? '.' + String(target.className).split(' ')[0] : '')) : 'unknown';
        
        clickHistory.push({ time: now, x: e.clientX, y: e.clientY, target: selector });
        
        const recentClicks = clickHistory.filter(c => now - c.time < 1000 && Math.hypot(c.x - e.clientX, c.y - e.clientY) < 30);
        if (recentClicks.length >= 3) {
          (window as any).__uxFrictionEvents.push({
            type: 'RAGE_CLICK',
            timestamp: Date.now(),
            selector,
            coordinates: { x: e.clientX, y: e.clientY },
            message: `User triggered ${recentClicks.length} rapid clicks on element: ${selector}`
          });
        }
      }, true);

      // 2. Unhandled Exception Detection
      window.addEventListener('error', (e) => {
        (window as any).__uxFrictionEvents.push({
          type: 'UNHANDLED_EXCEPTION',
          timestamp: Date.now(),
          message: e.message || 'Unknown window error'
        });
      });
    });
  }

  async collectMetrics(): Promise<UnifiedUXAuditReport> {
    let browserLogs: UXFrictionEvent[] = [];
    try {
      browserLogs = await this.page.evaluate(() => (window as any).__uxFrictionEvents || []);
    } catch {
      // In-flight navigation occurred
    }
    this.frictionEvents.push(...browserLogs);

    let cognitiveLoad: CognitiveLoadReport | null = null;
    try {
      cognitiveLoad = await this.page.evaluate(() => {
        const allElements = Array.from(document.querySelectorAll('*'));
        const interactiveElements = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"]'));
        const forms = Array.from(document.querySelectorAll('form'));
        const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
        
        const totalChoices = interactiveElements.length;
        const estimatedDecisionTimeSeconds = Math.log2(totalChoices + 1);

        let maxDepth = 0;
        allElements.forEach(el => {
          let depth = 0;
          let parent = el.parentElement;
          while (parent) {
            depth++;
            parent = parent.parentElement;
          }
          if (depth > maxDepth) maxDepth = depth;
        });

        return {
          timestamp: Date.now(),
          url: window.location.href,
          metrics: {
            domNodeCount: allElements.length,
            maxDomDepth: maxDepth,
            clutterIndex: (allElements.length - interactiveElements.length) / Math.max(1, interactiveElements.length),
            hicksLawScore: {
              totalChoices,
              estimatedDecisionTimeSeconds: Number(estimatedDecisionTimeSeconds.toFixed(2)),
              status: totalChoices > 25 ? 'high' : totalChoices > 12 ? 'moderate' : 'low' as 'low' | 'moderate' | 'high'
            },
            formComplexity: {
              inputCount: inputs.length,
              ungroupedInputCount: inputs.filter(i => !i.closest('fieldset, form')).length,
              missingLabelsCount: inputs.filter(i => !(i as any).labels || (i as any).labels.length === 0).length,
              complexityStatus: inputs.length > 8 ? 'high' : inputs.length > 4 ? 'moderate' : 'low' as 'low' | 'moderate' | 'high'
            }
          }
        };
      });
    } catch {
      // Gracefully handle context destruction during navigation
      cognitiveLoad = {
        timestamp: Date.now(),
        url: this.page.url(),
        metrics: {
          domNodeCount: 0,
          maxDomDepth: 0,
          clutterIndex: 0,
          hicksLawScore: { totalChoices: 0, estimatedDecisionTimeSeconds: 0, status: 'low' },
          formComplexity: { inputCount: 0, ungroupedInputCount: 0, missingLabelsCount: 0, complexityStatus: 'low' }
        }
      };
    }

    const report: UnifiedUXAuditReport = {
      url: this.page.url(),
      timestamp: new Date().toISOString(),
      frictionEvents: this.frictionEvents,
      cognitiveLoad,
      summary: {
        totalFrictionPoints: this.frictionEvents.length,
        frictionSeverity: this.frictionEvents.some(f => f.type === 'UNHANDLED_EXCEPTION' || f.type === 'RAGE_CLICK') ? 'critical' : this.frictionEvents.length > 0 ? 'medium' : 'low',
        cognitiveComplexity: cognitiveLoad.metrics.hicksLawScore.status,
        recommendations: []
      }
    };

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const safeUrl = this.page.url().replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    fs.writeFileSync(path.join(this.outputDir, `ux_report_${safeUrl}_${Date.now()}.json`), JSON.stringify(report, null, 2));

    return report;
  }
}

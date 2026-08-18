import { Page, CDPSession } from '@playwright/test';

export interface MemoryMetrics {
  timestamp: number;
  jsHeapUsedSize: number;
  jsHeapTotalSize: number;
  domNodeCount: number;
}

export interface LeakAuditReport {
  isLeakSuspected: boolean;
  growthRatePercentage: number;
  startMetrics: MemoryMetrics;
  endMetrics: MemoryMetrics;
  history: MemoryMetrics[];
}

export class MemoryLeakTracker {
  private page: Page;
  private cdpSession: CDPSession | null = null;
  private metricsHistory: MemoryMetrics[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  async start(): Promise<void> {
    try {
      const context = this.page.context();
      if (context.browser()?.browserType().name() === 'chromium') {
        this.cdpSession = await context.newCDPSession(this.page);
        await this.cdpSession.send('Performance.enable');
      }
    } catch {
      // Non-chromium or CDP not supported in this runtime
    }
    await this.captureSnapshot();
  }

  async captureSnapshot(): Promise<MemoryMetrics> {
    let jsHeapUsedSize = 0;
    let jsHeapTotalSize = 0;

    if (this.cdpSession) {
      try {
        const response = await this.cdpSession.send('Performance.getMetrics');
        const metrics = response.metrics;
        const jsHeapUsed = metrics.find(m => m.name === 'JSHeapUsedSize');
        const jsHeapTotal = metrics.find(m => m.name === 'JSHeapTotalSize');
        jsHeapUsedSize = jsHeapUsed ? jsHeapUsed.value : 0;
        jsHeapTotalSize = jsHeapTotal ? jsHeapTotal.value : 0;
      } catch {
        // Fallback
      }
    }

    const domNodeCount = await this.page.evaluate(() => document.querySelectorAll('*').length);

    const snapshot: MemoryMetrics = {
      timestamp: Date.now(),
      jsHeapUsedSize,
      jsHeapTotalSize,
      domNodeCount
    };

    this.metricsHistory.push(snapshot);
    return snapshot;
  }

  async finish(): Promise<LeakAuditReport> {
    const startMetrics = this.metricsHistory[0] || { timestamp: Date.now(), jsHeapUsedSize: 0, jsHeapTotalSize: 0, domNodeCount: 0 };
    const endMetrics = await this.captureSnapshot();

    const memoryGrowth = startMetrics.jsHeapUsedSize > 0 
      ? ((endMetrics.jsHeapUsedSize - startMetrics.jsHeapUsedSize) / startMetrics.jsHeapUsedSize) * 100 
      : 0;

    return {
      isLeakSuspected: memoryGrowth > 30 && (endMetrics.jsHeapUsedSize - startMetrics.jsHeapUsedSize) > 25 * 1024 * 1024,
      growthRatePercentage: Number(memoryGrowth.toFixed(2)),
      startMetrics,
      endMetrics,
      history: this.metricsHistory
    };
  }
}

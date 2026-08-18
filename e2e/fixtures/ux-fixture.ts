import { test as base } from '@playwright/test';
import { UXAnalyzer } from '../utils/ux-analyzer';
import { MemoryLeakTracker } from '../utils/memory-leak-tracker';

export type UXTestFixtures = {
  uxAnalyzer: UXAnalyzer;
  memoryTracker: MemoryLeakTracker;
};

export const test = base.extend<UXTestFixtures>({
  uxAnalyzer: async ({ page }, use) => {
    const analyzer = new UXAnalyzer(page);
    await analyzer.startMonitoring();
    await use(analyzer);
    await analyzer.collectMetrics();
  },
  memoryTracker: async ({ page }, use) => {
    const tracker = new MemoryLeakTracker(page);
    await tracker.start();
    await use(tracker);
    await tracker.finish();
  }
});

export { expect } from '@playwright/test';

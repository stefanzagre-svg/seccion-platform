import * as fs from 'fs';
import * as path from 'path';

export class DashboardCompiler {
  private reportsDir: string;
  private outputFile: string;

  constructor(reportsDir = './reports/ux-audit-reports', outputFile = './reports/ux-report-dashboard.html') {
    this.reportsDir = reportsDir;
    this.outputFile = outputFile;
  }

  public compile(): string {
    if (!fs.existsSync(this.reportsDir)) {
      return 'No reports directory found.';
    }

    const files = fs.readdirSync(this.reportsDir).filter(f => f.endsWith('.json'));
    const reports = files.map(f => JSON.parse(fs.readFileSync(path.join(this.reportsDir, f), 'utf-8')));

    const totalAudits = reports.length;
    const totalFrictionPoints = reports.reduce((acc, r) => acc + (r.summary?.totalFrictionPoints || 0), 0);
    const criticalIssues = reports.filter(r => r.summary?.frictionSeverity === 'critical').length;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SECCION Platform — E2E UX & Reliability Certification Dashboard</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0c; color: #f0f0f5; padding: 2rem; margin: 0; }
    h1 { font-size: 1.8rem; margin-bottom: 0.5rem; color: #fff; }
    .subtitle { color: #888899; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .card { background: #141419; border: 1px solid #23232f; border-radius: 12px; padding: 1.5rem; }
    .metric { font-size: 2.2rem; font-weight: 700; color: #3b82f6; margin-top: 0.5rem; }
    .metric.crit { color: #ef4444; }
    .metric.good { color: #10b981; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { text-align: left; padding: 0.8rem; border-bottom: 1px solid #23232f; font-size: 0.9rem; }
    th { color: #888899; }
    .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .badge.low { background: rgba(16,185,129,0.2); color: #10b981; }
    .badge.critical { background: rgba(239,68,68,0.2); color: #ef4444; }
  </style>
</head>
<body>
  <h1>🚀 SECCION Platform Prelaunch Certification Dashboard</h1>
  <div class="subtitle">Generated automatically on ${new Date().toLocaleString()} across real browser E2E flows</div>
  
  <div class="grid">
    <div class="card">
      <div>Total Verified Routes / Pages</div>
      <div class="metric good">${totalAudits}</div>
    </div>
    <div class="card">
      <div>Total UX Friction Points</div>
      <div class="metric ${totalFrictionPoints > 0 ? 'crit' : 'good'}">${totalFrictionPoints}</div>
    </div>
    <div class="card">
      <div>Critical Blockers / Exceptions</div>
      <div class="metric ${criticalIssues > 0 ? 'crit' : 'good'}">${criticalIssues}</div>
    </div>
  </div>

  <div class="card">
    <h2>Detailed Route Telemetry & Cognitive Complexity</h2>
    <table>
      <thead>
        <tr>
          <th>URL / Route</th>
          <th>Timestamp</th>
          <th>Decision Time (Hick's Law)</th>
          <th>DOM Nodes</th>
          <th>Severity</th>
        </tr>
      </thead>
      <tbody>
        ${reports.map(r => `
          <tr>
            <td><code>${r.url || 'N/A'}</code></td>
            <td>${new Date(r.timestamp).toLocaleTimeString()}</td>
            <td>${r.cognitiveLoad?.metrics?.hicksLawScore?.estimatedDecisionTimeSeconds || 0}s</td>
            <td>${r.cognitiveLoad?.metrics?.domNodeCount || 0}</td>
            <td><span class="badge ${r.summary?.frictionSeverity || 'low'}">${r.summary?.frictionSeverity || 'PASS'}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;

    const outDir = path.dirname(this.outputFile);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(this.outputFile, html);
    return `Dashboard compiled successfully to ${this.outputFile}`;
  }
}

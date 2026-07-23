import fs from 'fs';
import path from 'path';

const files = [
  'src/app/privacy/page.tsx',
  'src/app/rules/page.tsx',
  'src/app/creator-hub/page.tsx',
  'src/app/hit-us-up/page.tsx',
  'src/app/now-streaming/page.tsx'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    console.log(`=== ${f} ===`);
    // Find lines containing footer or copyright
    lines.forEach((l, idx) => {
      if (l.includes('footer') || l.includes('COPYRIGHT') || l.includes('RIGHTS RESERVED') || l.includes('t("footer') || l.includes('t("nav')) {
        console.log(`  Line ${idx+1}: ${l.trim()}`);
      }
    });
  } else {
    console.log(`${f} not found`);
  }
}

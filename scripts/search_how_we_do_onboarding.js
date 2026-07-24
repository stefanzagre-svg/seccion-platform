import fs from 'fs';

const content = fs.readFileSync('src/app/how-we-do/page.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('/onboarding') || l.includes('onboarding') || l.includes('router.push')) {
    console.log(`Line ${idx+1}: ${l.trim()}`);
  }
});

import fs from 'fs';

const content = fs.readFileSync('src/app/vibe-radar/page.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('SpecializationFilter') || l.includes('spec') || l.includes('filter')) {
    console.log(`Line ${idx+1}: ${l.trim()}`);
  }
});

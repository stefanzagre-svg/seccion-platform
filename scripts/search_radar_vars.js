import fs from 'fs';

const content = fs.readFileSync('src/app/vibe-radar/page.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('useState') || l.includes('selectedSpecialization') || l.includes('includeAdultContent')) {
    console.log(`Line ${idx+1}: ${l.trim()}`);
  }
});

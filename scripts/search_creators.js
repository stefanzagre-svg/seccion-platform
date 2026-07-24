import fs from 'fs';

const content = fs.readFileSync('src/app/vibe-radar/page.recovered_full.tsx', 'utf8');
const lines = content.split('\n');

lines.forEach((l, idx) => {
  if (l.includes('const ') && (l.includes('creator') || l.includes('Creator') || l.includes('profile') || l.includes('Profile'))) {
    console.log(`Line ${idx+1}: ${l}`);
  }
});

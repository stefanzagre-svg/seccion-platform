import fs from 'fs';

const content = fs.readFileSync('src/app/vibe-radar/page.tsx', 'utf8');
const lines = content.split('\n');

lines.forEach((l, idx) => {
  if (l.includes('faqs =') || l.includes('faqs:')) {
    console.log(`Line ${idx+1}:`);
    const start = Math.max(0, idx - 2);
    const end = Math.min(lines.length, idx + 35);
    for (let j = start; j < end; j++) {
      console.log(`  ${j+1}: ${lines[j]}`);
    }
  }
});

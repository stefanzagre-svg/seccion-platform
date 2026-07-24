import fs from 'fs';

const content = fs.readFileSync('src/app/vibe-radar/page.recovered_full.tsx', 'utf8');
const lines = content.split('\n');

const keyword = 'Creator Specializations & Expertise Showcase';
lines.forEach((l, idx) => {
  if (l.includes(keyword) || l.includes('SpecializationFilter')) {
    console.log(`Line ${idx+1}: ${l}`);
    // Print 30 lines after
    for (let j = idx; j < idx + 40; j++) {
      if (lines[j] !== undefined) {
        console.log(`  ${j+1}: ${lines[j]}`);
      }
    }
  }
});

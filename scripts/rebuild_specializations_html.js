import fs from 'fs';

const content = fs.readFileSync('src/app/vibe-radar/page.recovered_full.tsx', 'utf8');
const lines = content.split('\n');

// Clean up lines that are just empty spaces or very short to see the structure of lines 320-700
let cleanLines = [];
for (let i = 320; i < 700; i++) {
  if (lines[i] !== undefined && lines[i].trim().length > 0) {
    cleanLines.push(`${i+1}: ${lines[i]}`);
  }
}

fs.writeFileSync('src/app/vibe-radar/clean_recovered_segment.txt', cleanLines.join('\n'), 'utf8');
console.log(`Wrote ${cleanLines.length} cleaned lines to src/app/vibe-radar/clean_recovered_segment.txt`);

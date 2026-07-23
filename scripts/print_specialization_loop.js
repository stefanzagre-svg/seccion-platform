import fs from 'fs';

const content = fs.readFileSync('src/app/vibe-radar/page.recovered_full.tsx', 'utf8');
const lines = content.split('\n');

console.log("Lines 336 to 450 of page.recovered_full.tsx:");
for (let i = 336; i <= 450; i++) {
  if (lines[i] !== undefined) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}

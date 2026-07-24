import fs from 'fs';

const content = fs.readFileSync('src/app/vibe-radar/page.recovered_full.tsx', 'utf8');
const lines = content.split('\n');

console.log("Lines 790 to 950 of page.recovered_full.tsx:");
for (let i = 790; i <= 950; i++) {
  if (lines[i] !== undefined) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}

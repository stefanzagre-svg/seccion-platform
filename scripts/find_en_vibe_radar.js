import fs from 'fs';

const content = fs.readFileSync('scripts/build_complete_i18n_dictionaries.js', 'utf8');
const lines = content.split('\n');

lines.forEach((l, idx) => {
  if (l.includes('vibeRadar:') || (l.includes('faqTitle:') && idx > 150)) {
    console.log(`Line ${idx+1}:`);
    const start = Math.max(0, idx - 5);
    const end = Math.min(lines.length, idx + 15);
    for (let j = start; j < end; j++) {
      console.log(`  ${j+1}: ${lines[j]}`);
    }
    console.log("\n------------------\n");
  }
});

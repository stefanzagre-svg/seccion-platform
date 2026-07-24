import fs from 'fs';

const content = fs.readFileSync('scripts/build_complete_i18n_dictionaries.js', 'utf8');
const lines = content.split('\n');

lines.forEach((l, idx) => {
  if (l.includes('agent') || l.includes('thinking') || l.includes('welcome') || l.includes('Steve')) {
    console.log(`Line ${idx+1}: ${l.trim()}`);
  }
});

import fs from 'fs';

const content = fs.readFileSync('src/components/PlatformFeed.tsx', 'utf8');
const lines = content.split('\n');

const terms = ['stream', 'safety', 'match', 'announcement', 'pending'];
lines.forEach((line, i) => {
  const lower = line.toLowerCase();
  if (terms.some(t => lower.includes(t))) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
});

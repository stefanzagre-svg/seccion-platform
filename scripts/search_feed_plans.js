import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/components/PlatformFeed.tsx');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

const query = 'allowed';
console.log(`Searching for "${query}" in ${filePath}...`);
lines.forEach((line, idx) => {
  if (line.includes(query) || line.includes('move') || line.includes('tag')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});

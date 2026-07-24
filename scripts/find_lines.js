import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/app/studio/page.tsx');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

const query = 'allowed_move_tags_array';
console.log(`Searching for "${query}" in ${filePath}...`);
lines.forEach((line, idx) => {
  if (line.includes(query)) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});

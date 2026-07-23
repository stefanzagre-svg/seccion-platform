import fs from 'fs';

const content = fs.readFileSync('src/components/PlatformFeed.tsx', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(1065, 1095).map((l, i) => `${1066 + i}: ${l}`).join('\n'));

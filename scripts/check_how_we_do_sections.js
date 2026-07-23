import fs from 'fs';

const file = fs.readFileSync('src/app/how-we-do/page.tsx', 'utf8');
const matches = file.match(/\{\/\*[\s\S]*?\*\/\}/g) || [];
console.log("Sections/Comments in how-we-do/page.tsx:");
matches.forEach(m => console.log(" -", m));

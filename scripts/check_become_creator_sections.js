import fs from 'fs';

const file = fs.readFileSync('src/app/become-creator/page.tsx', 'utf8');
const matches = file.match(/\{\/\*[\s\S]*?\*\/\}/g) || [];
console.log("Sections/Comments in become-creator/page.tsx:");
matches.forEach(m => console.log(" -", m));

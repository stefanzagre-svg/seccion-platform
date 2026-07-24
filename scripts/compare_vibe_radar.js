import fs from 'fs';

const orig = fs.readFileSync('src/app/vibe-radar/page.original.tsx', 'utf8');
const curr = fs.readFileSync('src/app/vibe-radar/page.tsx', 'utf8');

console.log("Original headings/comments:");
const origMatches = orig.match(/\{\/\*[\s\S]*?\*\/\}/g) || [];
origMatches.forEach(m => console.log(" -", m));

console.log("\nCurrent headings/comments:");
const currMatches = curr.match(/\{\/\*[\s\S]*?\*\/\}/g) || [];
currMatches.forEach(m => console.log(" -", m));

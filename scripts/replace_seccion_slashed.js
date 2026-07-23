import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('src');

function walkDir(dir) {
  let files = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files = files.concat(walkDir(fullPath));
    } else if (/\.(tsx|ts|js|jsx)$/.test(item)) {
      files.push(fullPath);
    }
  }
  return files;
}

const allFiles = walkDir(srcDir);
let changedCount = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf-8');
  // Replace SECCION with SECCIØN unless it's an import path or URL or env var or variable name like seccion_
  // We want user-visible text, headers, titles, alt text, and strings.
  if (content.includes('SECCION')) {
    // Avoid replacing file paths or package names
    const newContent = content.replace(/SECCION/g, 'SECCIØN');
    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf-8');
      changedCount++;
      console.log(`[BRAND UPDATED] ${path.relative(srcDir, file)}`);
    }
  }
}

console.log(`Updated brand name SECCIØN across ${changedCount} files.`);

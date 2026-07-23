import fs from 'fs';
import path from 'path';

const searchPaths = [
  '.',
  'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5'
];

function searchFile(filePath, term) {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size > 5000000) return; // skip very large files
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(term)) {
      console.log(`FOUND in file: ${filePath}`);
      // Find line number and snippet
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (l.includes(term)) {
          console.log(`  Line ${idx+1}: ${l.trim().substring(0, 150)}`);
        }
      });
    }
  } catch (e) {}
}

function traverse(dir, term) {
  try {
    const list = fs.readdirSync(dir);
    for (const item of list) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (item !== 'node_modules' && item !== '.git' && item !== '.next') {
          traverse(fullPath, term);
        }
      } else {
        searchFile(fullPath, term);
      }
    }
  } catch (e) {}
}

console.log("Searching for 'Creators by Specialization'...");
for (const p of searchPaths) {
  traverse(p, 'Creators by Specialization');
}

console.log("\nSearching for 'SpecializationFilter'...");
for (const p of searchPaths) {
  traverse(p, 'SpecializationFilter');
}

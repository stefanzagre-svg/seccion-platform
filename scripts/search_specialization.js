import fs from 'fs';
import path from 'path';

function searchInDir(dir, term) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(searchInDir(fullPath, term));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes(term)) {
          results.push(fullPath);
        }
      } catch (e) {}
    }
  }
  return results;
}

console.log("Files mentioning 'SpecializationFilter':", searchInDir('src', 'SpecializationFilter'));
console.log("Files mentioning 'specialization':", searchInDir('src', 'specialization'));

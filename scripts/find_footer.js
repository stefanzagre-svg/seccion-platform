import fs from 'fs';
import path from 'path';

function findKeywordInDir(dir, keyword) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(findKeywordInDir(fullPath, keyword));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
          results.push(fullPath);
        }
      } catch (e) {}
    }
  }
  return results;
}

console.log("Files mentioning 'footer':", findKeywordInDir('src', 'footer'));

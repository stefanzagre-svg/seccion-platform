import fs from 'fs';
import path from 'path';

function search(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.git' && item !== '.next') {
        results = results.concat(search(fullPath));
      }
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('unsplash.com/photo') && (content.includes('creator') || content.includes('Creator'))) {
          results.push(fullPath);
        }
      } catch (e) {}
    }
  }
  return results;
}

console.log("Files with creators and unsplash photos:", search('src'));

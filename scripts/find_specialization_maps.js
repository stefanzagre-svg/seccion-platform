import fs from 'fs';
import path from 'path';

function findFileInDir(dir, keyword) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(findFileInDir(fullPath, keyword));
    } else if (item.endsWith('.map')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes(keyword)) {
          results.push(fullPath);
        }
      } catch (e) {}
    }
  }
  return results;
}

const maps = findFileInDir('.next', 'SpecializationFilter');
console.log(`Found ${maps.length} maps mentioning SpecializationFilter`);
maps.forEach(m => console.log(" -", m));

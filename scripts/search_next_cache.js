import fs from 'fs';
import path from 'path';

function search(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(search(fullPath));
      } else if (file.toLowerCase().includes('platformfeed')) {
        results.push(fullPath);
      }
    }
  } catch (e) {}
  return results;
}

console.log('Searching .next folder...', search('.next'));

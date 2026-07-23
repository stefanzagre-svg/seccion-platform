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
        if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
          results = results.concat(search(fullPath));
        }
      } else if (file.includes('PlatformFeed')) {
        results.push(fullPath);
      }
    }
  } catch (e) {}
  return results;
}

console.log('Searching workspace...', search('.'));
console.log('Searching AppData...', search('C:/Users/USER/.gemini'));

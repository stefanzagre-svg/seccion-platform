import fs from 'fs';
import path from 'path';

function searchDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        searchDirectory(fullPath);
      }
    } else {
      if (file.includes('how-we-do') || file.includes('how_we_do') || (file.includes('page') && file.includes('bak'))) {
        console.log(`Potential backup file: ${fullPath}`);
      }
    }
  }
}

searchDirectory('.');

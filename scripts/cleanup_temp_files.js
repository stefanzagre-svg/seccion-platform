import fs from 'fs';
import path from 'path';

function cleanupDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const fullPath = path.join(dir, f);
    const isDir = fs.statSync(fullPath).isDirectory();
    if (!isDir) {
      if (
        f.startsWith('page.recovered') || 
        f.startsWith('page.original') ||
        f.endsWith('.txt') || 
        f.endsWith('.json')
      ) {
        console.log(`Deleting ${fullPath}`);
        fs.unlinkSync(fullPath);
      }
    }
  });
}

cleanupDir('src/app/how-we-do');
cleanupDir('src/app/vibe-radar');
console.log('Cleanup completed successfully!');

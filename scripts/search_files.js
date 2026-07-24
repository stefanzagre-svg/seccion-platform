import fs from 'fs';
import path from 'path';

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        searchDir(fullPath);
      }
    } else {
      if (file.endsWith('.sql') || file.endsWith('.ts') || file.endsWith('.json') || file.endsWith('.js')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes('suggestion_moves') || content.includes('introduce_yourself')) {
          console.log(`Found match in: ${fullPath}`);
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (line.includes('suggestion_moves') || line.includes('introduce_yourself') || line.includes('friendly')) {
              console.log(`  L${idx + 1}: ${line.trim()}`);
            }
          });
        }
      }
    }
  }
}

searchDir('.');

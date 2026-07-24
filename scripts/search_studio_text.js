import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walk(filepath, callback);
    } else if (stats.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.json'))) {
      callback(filepath);
    }
  });
}

walk('src', (filepath) => {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('STUDIO') || line.includes('Studio') || line.includes('studio')) {
      // Ignore built-in next routing folder names and CSS classes unless text looks like title
      if (line.includes('font-') || line.includes('className') || line.includes('import') || line.includes('href') || line.includes('path') || line.includes('t(')) {
        // Still display if it's text within html elements
        if (line.includes('>') && line.includes('<') && (line.includes('STUDIO') || line.includes('Studio'))) {
          console.log(`${filepath}:${idx+1}: ${line.trim()}`);
        }
      } else {
        console.log(`${filepath}:${idx+1}: ${line.trim()}`);
      }
    }
  });
});

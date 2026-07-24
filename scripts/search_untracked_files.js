import fs from 'fs';
import path from 'path';

const dirs = ['src/app/vibe-radar', 'src/app/how-we-do'];

for (const dir of dirs) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const fullPath = path.join(dir, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('SpecializationFilter')) {
        console.log(`Found SpecializationFilter in ${fullPath} (length: ${content.split('\n').length})`);
      }
      if (content.includes('Creators by Specialization')) {
        console.log(`Found 'Creators by Specialization' in ${fullPath}`);
      }
    }
  }
}

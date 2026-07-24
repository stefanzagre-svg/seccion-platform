import fs from 'fs';
import path from 'path';

const dir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\tasks';
if (fs.existsSync(dir)) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.log')) {
      const fullPath = path.join(dir, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('VibeRadarPage') || content.includes('Creators by Specialization') || content.includes('SpecializationFilter')) {
        console.log(`FOUND in log file: ${file} (Size: ${content.length})`);
      }
    }
  }
} else {
  console.log('Dir not found');
}

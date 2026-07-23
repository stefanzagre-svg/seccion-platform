import fs from 'fs';
import path from 'path';

const searchDirs = [
  'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\tasks',
  'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs'
];

for (const dir of searchDirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('export default function VibeRadarPage')) {
        console.log(`FOUND in ${file} (Size: ${content.length})`);
      }
    } catch (e) {}
  }
}

import fs from 'fs';
import path from 'path';

const logsDir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\tasks';

if (fs.existsSync(logsDir)) {
  const files = fs.readdirSync(logsDir);
  for (const file of files) {
    if (file.endsWith('.log')) {
      const fullPath = path.join(logsDir, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('SpecializationFilter') && content.includes('export default function VibeRadarPage')) {
        console.log(`FOUND in log file: ${file}`);
        // Let's parse the file and extract the code block
        const regex = /("CodeContent":\s*|CodeContent:\s*)`([\s\S]*?)`/g;
        let match;
        let idx = 1;
        while ((match = regex.exec(content)) !== null) {
          const code = match[2];
          if (code.includes('SpecializationFilter') && code.includes('export default function VibeRadarPage')) {
            const outPath = `src/app/vibe-radar/page.recovered_${file}_${idx}.tsx`;
            fs.writeFileSync(outPath, code, 'utf8');
            console.log(`  Extracted code block to ${outPath} (${code.split('\n').length} lines)`);
            idx++;
          }
        }
      }
    }
  }
}

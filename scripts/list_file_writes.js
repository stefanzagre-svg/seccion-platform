import fs from 'fs';
import path from 'path';

const transcriptPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript_full.jsonl';

if (fs.existsSync(transcriptPath)) {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  
  console.log('Scanning transcript steps...');
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      const step = obj.step_index;
      const type = obj.type;
      
      // Look for write_to_file or replace_file_content tool calls
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.name === 'write_to_file' || tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
            const args = tc.args || {};
            const targetFile = args.TargetFile || args.targetFile || '';
            if (targetFile.includes('vibe-radar') || targetFile.includes('become-creator') || targetFile.includes('how-we-do') || targetFile.includes('LanguageContext') || targetFile.includes('Navbar') || targetFile.includes('PublicNavbar')) {
              console.log(`Step ${step} (${obj.source}): Tool ${tc.name} on ${targetFile}`);
              count++;
            }
          }
        }
      }
    } catch (e) {}
  }
  console.log(`Total matching writes: ${count}`);
} else {
  console.log('Transcript file not found at:', transcriptPath);
}

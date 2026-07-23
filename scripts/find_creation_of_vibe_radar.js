import fs from 'fs';

const transcriptPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript_full.jsonl';

if (fs.existsSync(transcriptPath)) {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes('write_to_file') && l.includes('vibe-radar')) {
      try {
        const obj = JSON.parse(l);
        console.log(`Step ${obj.step_index}:`);
        console.log(JSON.stringify(obj.tool_calls, null, 2));
      } catch (e) {
        console.log(`Error parsing line ${i+1}: ${e.message}`);
      }
    }
  }
}

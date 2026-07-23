import fs from 'fs';

const transcriptPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript_full.jsonl';

if (fs.existsSync(transcriptPath)) {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  
  // Find step 1511 or similar
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.step_index >= 1500 && obj.step_index <= 1650) {
        if (line.includes('vibe-radar')) {
          console.log(`Step ${obj.step_index}: Type: ${obj.type}`);
          console.log(line.substring(0, 1000));
          console.log("\n--------------------------------\n");
        }
      }
    } catch (e) {}
  }
}

import fs from 'fs';

const transcriptPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript.jsonl';

if (fs.existsSync(transcriptPath)) {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj.step_index === 1595) {
        console.log('Step 1595 found! Type:', obj.type);
        fs.writeFileSync('scripts/original_vibe_radar_step1595.json', JSON.stringify(obj, null, 2), 'utf8');
        console.log('Wrote obj to scripts/original_vibe_radar_step1595.json');
      }
    } catch (e) {}
  }
} else {
  console.log('Transcript file not found');
}

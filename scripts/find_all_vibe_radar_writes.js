import fs from 'fs';

const transcriptPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript.jsonl';

if (fs.existsSync(transcriptPath)) {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes('vibe-radar/page.tsx') || l.includes('vibe-radar\\\\page.tsx')) {
      try {
        const obj = JSON.parse(l);
        console.log(`Line ${i+1}: Step ${obj.step_index}, Type: ${obj.type}, Source: ${obj.source}`);
      } catch (e) {
        console.log(`Line ${i+1} JSON error: ${e.message}`);
      }
    }
  }
} else {
  console.log("No transcript found");
}

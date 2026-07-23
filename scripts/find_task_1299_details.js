import fs from 'fs';

const transcriptPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript_full.jsonl';

if (fs.existsSync(transcriptPath)) {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes('task-1299')) {
      console.log(`Line ${i+1}:`);
      console.log(l.substring(0, 1000));
      console.log("\n--------------------------------\n");
    }
  }
} else {
  console.log("No transcript found");
}

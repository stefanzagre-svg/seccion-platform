import fs from 'fs';

const transcriptPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript_full.jsonl';

if (fs.existsSync(transcriptPath)) {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  
  // Line 50 is index 49 (or 50, let's search for step_index 1508)
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.step_index === 1508) {
        console.log(`FOUND Step 1508 of type ${obj.type}`);
        // Let's write the content field to a file
        fs.writeFileSync('src/app/vibe-radar/step_1508_content.txt', obj.content || '', 'utf8');
        console.log(`Wrote step 1508 content to src/app/vibe-radar/step_1508_content.txt`);
      }
      if (obj.step_index === 1512) {
        console.log(`FOUND Step 1512 of type ${obj.type}`);
        fs.writeFileSync('src/app/vibe-radar/step_1512_content.txt', obj.content || '', 'utf8');
        console.log(`Wrote step 1512 content to src/app/vibe-radar/step_1512_content.txt`);
      }
    } catch (e) {}
  }
} else {
  console.log("No transcript found");
}

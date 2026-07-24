import fs from 'fs';

const transcriptPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript_full.jsonl';

if (fs.existsSync(transcriptPath)) {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  const targetIndices = [1561, 1566, 1592, 1596, 1600];
  
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (targetIndices.includes(obj.step_index)) {
        console.log(`Step ${obj.step_index}:`);
        console.log(JSON.stringify(obj.tool_calls, null, 2));
        fs.writeFileSync(`src/app/vibe-radar/step_${obj.step_index}.json`, JSON.stringify(obj, null, 2), 'utf8');
      }
    } catch (e) {}
  }
} else {
  console.log("No transcript found");
}

import fs from 'fs';

const filePath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript.jsonl';

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj.step_index === 2602 || obj.step_index === 2606) {
        console.log(`Step ${obj.step_index} found!`);
        if (obj.tool_calls) {
          console.log('Tool calls:', JSON.stringify(obj.tool_calls, null, 2));
        }
      }
    } catch (e) {}
  }
} else {
  console.log('File not found');
}

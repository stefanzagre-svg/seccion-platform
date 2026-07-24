import fs from 'fs';

const filePath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript.jsonl';

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj.step_index === 1990) {
        console.log('Step 1990 found!');
        console.log('Keys:', Object.keys(obj));
        if (obj.tool_calls) {
          console.log('Tool calls:', JSON.stringify(obj.tool_calls, null, 2));
        } else {
          console.log('No tool_calls. Content preview:', obj.content ? obj.content.substring(0, 500) : 'none');
        }
        fs.writeFileSync('scripts/step_1990_details.json', JSON.stringify(obj, null, 2), 'utf8');
      }
    } catch (e) {}
  }
} else {
  console.log('File not found');
}

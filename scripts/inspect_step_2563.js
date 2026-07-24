import fs from 'fs';

const filePath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript.jsonl';

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj.step_index === 2563) {
        console.log('Step 2563 found!');
        console.log('Keys:', Object.keys(obj));
        console.log('Type:', obj.type);
        if (obj.content) {
          console.log('Content length:', obj.content.length);
          fs.writeFileSync('scripts/step_2563_content.txt', obj.content, 'utf8');
          console.log('Wrote content to scripts/step_2563_content.txt');
        }
      }
    } catch (e) {}
  }
} else {
  console.log('File not found');
}

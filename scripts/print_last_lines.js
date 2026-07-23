import fs from 'fs';

const content = fs.readFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/bd0f42be-ab86-4cf4-b53e-b97bdc4f4b50/.system_generated/logs/transcript_full.jsonl', 'utf8');
const lines = content.trim().split('\n');
console.log('Total lines:', lines.length);
for (let i = Math.max(0, lines.length - 15); i < lines.length; i++) {
  try {
    const obj = JSON.parse(lines[i]);
    console.log(`Line ${i+1}: Step ${obj.step_index}, type=${obj.type}, source=${obj.source}`);
  } catch (e) {
    console.log(`Line ${i+1}: Cannot parse JSON: ${e.message}`);
  }
}

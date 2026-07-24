import fs from 'fs';
import readline from 'readline';

async function run() {
  const fileStream = fs.createReadStream('C:/Users/USER/.gemini/antigravity-ide/brain/bd0f42be-ab86-4cf4-b53e-b97bdc4f4b50/.system_generated/logs/transcript_full.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  for await (const line of rl) {
    count++;
    try {
      const obj = JSON.parse(line);
      const step = obj.step_index;
      if (step >= 960 && step <= 980) {
        console.log(`Line ${count}: Step ${step}, type=${obj.type}, source=${obj.source}`);
        if (obj.type === 'TOOL_RESPONSE' && obj.content && obj.content.length > 5000) {
          console.log(`---> FOUND HUGE TOOL_RESPONSE: ${obj.content.length} characters`);
          fs.writeFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/bd0f42be-ab86-4cf4-b53e-b97bdc4f4b50/scratch/huge_content.txt', obj.content);
        }
      }
    } catch (e) {}
  }
}

run();

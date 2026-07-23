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
    if (!line.includes('PlatformFeed.tsx')) continue;
    try {
      const obj = JSON.parse(line);
      console.log(`Line ${count}: step_index=${obj.step_index}, type=${obj.type}, source=${obj.source}`);
    } catch (e) {}
  }
}

run();

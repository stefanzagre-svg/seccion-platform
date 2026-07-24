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
    if (count >= 980 && count <= 1010) {
      try {
        const obj = JSON.parse(line);
        console.log(`Line ${count}: step_index=${obj.step_index}, source=${obj.source}, type=${obj.type}, content_len=${obj.content?.length || 0}`);
        if (obj.content && obj.content.length < 200) {
          console.log(`  content: ${obj.content}`);
        } else if (obj.content) {
          console.log(`  content (start): ${obj.content.slice(0, 100)}`);
        }
      } catch (e) {
        console.log(`Line ${count}: Cannot parse JSON: ${e.message}`);
      }
    }
  }
}

run();

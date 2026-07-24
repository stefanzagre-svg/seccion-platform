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
    if (count === 1053) {
      const obj = JSON.parse(line);
      console.log('step_index:', obj.step_index);
      console.log('type:', obj.type);
      console.log('content length:', obj.content.length);
      console.log('content starts with:', obj.content.slice(0, 500));
      // Save it to a file so we can read it
      fs.writeFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/bd0f42be-ab86-4cf4-b53e-b97bdc4f4b50/scratch/recovered_1060.txt', obj.content);
    }
  }
}

run();

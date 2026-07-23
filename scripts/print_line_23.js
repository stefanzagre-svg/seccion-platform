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
    if (count === 23) {
      const obj = JSON.parse(line);
      console.log('step_index:', obj.step_index);
      console.log('type:', obj.type);
      console.log('source:', obj.source);
      console.log('content length:', obj.content?.length || 0);
      console.log('content (start):', obj.content?.slice(0, 500));
      if (obj.content) {
        fs.writeFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/bd0f42be-ab86-4cf4-b53e-b97bdc4f4b50/scratch/line_23_content.txt', obj.content);
      }
    }
  }
}

run();

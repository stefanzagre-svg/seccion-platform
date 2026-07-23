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
    // Let's look for Step 1005 or similar
    if (line.includes('"step_index":1005') || line.includes('"step_index":977') || line.includes('"step_index":975')) {
      try {
        const obj = JSON.parse(line);
        if (obj.type === 'TOOL_RESPONSE' && obj.content && obj.content.includes('PlatformFeed.tsx')) {
          console.log(`FOUND Step ${obj.step_index} size = ${obj.content.length}`);
          fs.writeFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/bd0f42be-ab86-4cf4-b53e-b97bdc4f4b50/scratch/recovered_feed.tsx', obj.content);
          console.log('Saved to recovered_feed.tsx!');
        }
      } catch (e) {}
    }
  }
}

run();

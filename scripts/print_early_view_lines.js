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
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.name === 'view_file') {
            const args = tc.args || JSON.parse(tc.arguments || '{}');
            if (args.AbsolutePath && args.AbsolutePath.includes('PlatformFeed.tsx')) {
              console.log(`Line ${count}: Step ${obj.step_index}, StartLine=${args.StartLine}, EndLine=${args.EndLine}`);
            }
          }
        }
      }
    } catch (e) {}
  }
}

run();

import fs from 'fs';
import readline from 'readline';

async function run() {
  const fileStream = fs.createReadStream('C:/Users/USER/.gemini/antigravity-ide/brain/bd0f42be-ab86-4cf4-b53e-b97bdc4f4b50/.system_generated/logs/transcript_full.jsonl');
  const outStream = fs.createWriteStream('C:/Users/USER/.gemini/antigravity-ide/brain/bd0f42be-ab86-4cf4-b53e-b97bdc4f4b50/scratch/recovered_diffs.txt');

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
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content' || tc.name === 'write_to_file') {
            const args = tc.args || JSON.parse(tc.arguments || '{}');
            if (args.TargetFile && args.TargetFile.includes('PlatformFeed.tsx')) {
              outStream.write(`===STEP_START:${obj.step_index || count}===\n`);
              outStream.write(JSON.stringify({ name: tc.name, args }) + '\n');
              outStream.write(`===STEP_END:${obj.step_index || count}===\n`);
            }
          }
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
  outStream.end();
  console.log('Done!');
}

run();

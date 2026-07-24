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
      if (obj.type === 'RUN_COMMAND') {
        const cmdStr = obj.tool_calls?.[0]?.args?.CommandLine || '';
        if (cmdStr.includes('git diff') || (obj.content && obj.content.includes('git diff'))) {
          console.log(`Line ${count}: Step ${obj.step_index}, cmd=${cmdStr}, content_len=${obj.content?.length || 0}`);
          if (obj.content && obj.content.length > 5000) {
            console.log(`---> FOUND LARGE GIT DIFF: ${obj.content.length} characters`);
            fs.writeFileSync(`C:/Users/USER/.gemini/antigravity-ide/brain/bd0f42be-ab86-4cf4-b53e-b97bdc4f4b50/scratch/git_diff_${obj.step_index}.patch`, obj.content);
          }
        }
      }
    } catch (e) {}
  }
}

run();

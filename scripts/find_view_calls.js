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
    if (!line.includes('view_file')) continue;
    try {
      const obj = JSON.parse(line);
      const isView = obj.type === 'PLANNER_RESPONSE' && obj.tool_calls && obj.tool_calls.some(tc => tc.name === 'view_file');
      const isSystemOutput = obj.source === 'SYSTEM' && obj.type === 'TOOL_RESPONSE' && obj.content && obj.content.includes('PlatformFeed.tsx');
      
      if (isView) {
        console.log(`Line ${count} (Step ${obj.step_index}): View tool call`);
      }
      if (isSystemOutput) {
        console.log(`Line ${count}: View tool output size = ${obj.content.length}`);
      }
    } catch (e) {}
  }
}

run();

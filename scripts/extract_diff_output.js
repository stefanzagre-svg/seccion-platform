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
    if (count === 984) {
      // Line 984 is the run_command tool call. The response is the next step or line where source=SYSTEM and type=TOOL_RESPONSE!
      // Let's print this line and a few following lines.
      console.log(`Line ${count} starts with: ${line.slice(0, 150)}`);
    }
    if (count >= 984 && count <= 990) {
      try {
        const obj = JSON.parse(line);
        console.log(`Line ${count}: Step ${obj.step_index}, source=${obj.source}, type=${obj.type}`);
        if (obj.content && obj.content.includes('diff --git')) {
          console.log(`FOUND DIFF in line ${count}, content length = ${obj.content.length}`);
          fs.writeFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/bd0f42be-ab86-4cf4-b53e-b97bdc4f4b50/scratch/git_diff.patch', obj.content);
        }
      } catch (e) {}
    }
  }
}

run();

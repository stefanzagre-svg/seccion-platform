import fs from 'fs';

function run() {
  // Reset PlatformFeed to git clean version first
  fs.writeFileSync('src/components/PlatformFeed.tsx', fs.readFileSync('src/components/PlatformFeed.tsx', 'utf8'));

  let fileContent = fs.readFileSync('src/components/PlatformFeed.tsx', 'utf8').replace(/\r\n/g, '\n');
  console.log(`Original file length: ${fileContent.split('\n').length} lines`);

  const diffsText = fs.readFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/bd0f42be-ab86-4cf4-b53e-b97bdc4f4b50/scratch/recovered_diffs.txt', 'utf8');
  
  const stepArgs = [];
  const startRegex = /===STEP_START:(\d+)===\n([\s\S]*?)\n===STEP_END:\1===\n/g;
  let match;
  while ((match = startRegex.exec(diffsText)) !== null) {
    const stepNum = parseInt(match[1]);
    const jsonStr = match[2].trim();
    try {
      const parsed = JSON.parse(jsonStr);
      stepArgs.push({ stepNum, name: parsed.name, args: parsed.args });
    } catch (e) {
      console.error(`Failed to parse JSON for step ${stepNum}:`, e.message);
    }
  }

  // Sort by step number
  stepArgs.sort((a, b) => a.stepNum - b.stepNum);

  // We only want steps up to 828, which is the correct pre-edit state
  const targetSteps = stepArgs.filter(s => s.stepNum <= 828);
  console.log(`Applying ${targetSteps.length} steps up to Step 828...`);

  for (const step of targetSteps) {
    console.log(`Applying Step ${step.stepNum} (${step.name})...`);
    let chunks = [];
    if (step.name === 'multi_replace_file_content') {
      chunks = step.args.ReplacementChunks;
    } else if (step.name === 'replace_file_content') {
      chunks = [{
        TargetContent: step.args.TargetContent,
        ReplacementContent: step.args.ReplacementContent
      }];
    }

    for (const chunk of chunks) {
      const target = chunk.TargetContent.replace(/\r\n/g, '\n');
      const replacement = chunk.ReplacementContent.replace(/\r\n/g, '\n');
      
      const idx = fileContent.indexOf(target);
      if (idx === -1) {
        console.warn(`[WARNING] Target content not found for Step ${step.stepNum}!`);
        console.warn(`Target starts with: ${JSON.stringify(target.slice(0, 100))}`);
        continue;
      }

      // Replace first occurrence
      fileContent = fileContent.slice(0, idx) + replacement + fileContent.slice(idx + target.length);
      console.log(`  -> Replaced chunk successfully!`);
    }
  }

  // Save back as CRLF
  fs.writeFileSync('src/components/PlatformFeed.tsx', fileContent.replace(/\n/g, '\r\n'));
  console.log(`Reconstructed file length: ${fileContent.split('\n').length} lines`);
}

run();

import fs from 'fs';

const content = fs.readFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/bd0f42be-ab86-4cf4-b53e-b97bdc4f4b50/scratch/recovered_diffs.txt', 'utf8');
const lines = content.split('\n');

for (const line of lines) {
  if (line.startsWith('===STEP_START:')) {
    console.log(line);
  }
}

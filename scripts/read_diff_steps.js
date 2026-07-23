import fs from 'fs';

const content = fs.readFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/bd0f42be-ab86-4cf4-b53e-b97bdc4f4b50/scratch/recovered_diffs.txt', 'utf8');
const steps = content.split('Step ');

for (const step of steps) {
  if (step.startsWith('747:') || step.startsWith('800:') || step.startsWith('804:') || step.startsWith('828:')) {
    console.log('=== STEP ===');
    console.log(step.slice(0, 800)); // Print first 800 chars of each
    console.log('...');
  }
}

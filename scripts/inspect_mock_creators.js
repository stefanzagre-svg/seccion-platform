import fs from 'fs';

const content = fs.readFileSync('src/app/vibe-radar/page.tsx', 'utf8');
const lines = content.split('\n');
let print = false;
lines.forEach((l, idx) => {
  if (l.includes('mockCreators')) {
    print = true;
  }
  if (print) {
    console.log(`Line ${idx+1}: ${l}`);
  }
  if (print && l.trim() === '];') {
    print = false;
  }
});

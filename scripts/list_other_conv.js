import fs from 'fs';
import path from 'path';

const otherDir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\398b2d87-fbd4-4d3c-8374-f91c547511a5';

if (fs.existsSync(otherDir)) {
  console.log('Other conversation directory exists!');
  const list = fs.readdirSync(otherDir);
  console.log('Contents:', list);
} else {
  console.log('Other conversation directory does not exist');
}

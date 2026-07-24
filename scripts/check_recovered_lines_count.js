import fs from 'fs';

const logPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\tasks\\task-1299.log';

if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  
  let lineNumbers = new Set();
  const linePattern = /src\\app\\vibe-radar\\page\.tsx:(\d+):/;
  for (const line of lines) {
    const match = line.match(linePattern);
    if (match) {
      lineNumbers.add(parseInt(match[1]));
    }
  }
  
  console.log(`Total unique lines recovered: ${lineNumbers.size}`);
  const sorted = Array.from(lineNumbers).sort((a,b)=>a-b);
  console.log("Missing lines segments (gaps):");
  let last = 0;
  let gaps = [];
  for (const num of sorted) {
    if (num - last > 1) {
      gaps.push([last + 1, num - 1]);
    }
    last = num;
  }
  console.log(gaps);
}

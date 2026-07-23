import fs from 'fs';

const logPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\tasks\\task-1299.log';

if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  
  let count = 0;
  for (const line of lines) {
    if (line.includes('vibe-radar') && line.includes('page.tsx')) {
      console.log("Raw line:", line);
      count++;
      if (count > 5) break;
    }
  }
}

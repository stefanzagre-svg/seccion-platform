import fs from 'fs';

const logPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\tasks\\task-1299.log';

if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  
  // Let's print out lines from 7800 to 7900
  for (let i = 7800; i < 7900; i++) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}

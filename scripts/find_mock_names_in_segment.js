import fs from 'fs';

const logPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\tasks\\task-1299.log';

if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  
  // Search for lines around vibe-radar image or h3 or name
  lines.forEach((l, idx) => {
    if (l.includes('vibe-radar') && (l.includes('img') || l.includes('h3') || l.includes('avatar') || l.includes('src="https://images.unsplash.com/'))) {
      console.log(`Line ${idx+1}: ${l}`);
    }
  });
}

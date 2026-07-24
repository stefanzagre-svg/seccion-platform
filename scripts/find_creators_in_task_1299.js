import fs from 'fs';

const logPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\tasks\\task-1299.log';

if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((l, idx) => {
    if (l.includes('vibe-radar') && (l.includes('CREATOR_SPECIALIZATIONS') || l.includes('creators') || l.includes('SpecializationFilter'))) {
      console.log(`Line ${idx+1}:`);
      // print 10 lines before, 30 lines after
      const start = Math.max(0, idx - 10);
      const end = Math.min(lines.length, idx + 30);
      for (let j = start; j < end; j++) {
        console.log(`  ${j+1}: ${lines[j]}`);
      }
      console.log("\n----------------------------\n");
    }
  });
} else {
  console.log("task-1299.log not found");
}

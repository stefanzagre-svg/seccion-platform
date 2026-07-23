import fs from 'fs';

const logPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\tasks\\task-1299.log';

if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  let matched = false;
  lines.forEach((l, idx) => {
    if (l.includes('SpecializationFilter') || l.includes('Creators by Specialization')) {
      console.log(`Log Line ${idx+1}:`);
      // Print context: 10 lines before, 10 lines after
      const start = Math.max(0, idx - 15);
      const end = Math.min(lines.length, idx + 25);
      for (let j = start; j < end; j++) {
        console.log(`  ${j+1}: ${lines[j]}`);
      }
      console.log("\n-----------------------------------\n");
    }
  });
} else {
  console.log("task-1299.log not found");
}

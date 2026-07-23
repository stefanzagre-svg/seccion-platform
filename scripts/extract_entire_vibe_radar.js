import fs from 'fs';

const logPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\tasks\\task-1299.log';

if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  
  // Let's find all lines matching 'src\app\vibe-radar\page.tsx:' and assemble them
  let recoveredLines = [];
  let maxLineNum = 0;
  
  const linePattern = /src\\app\\vibe-radar\\page\.tsx:(\d+):(.*)/;
  
  for (const line of lines) {
    const match = line.match(linePattern);
    if (match) {
      const lineNum = parseInt(match[1]);
      const lineContent = match[2];
      recoveredLines[lineNum] = lineContent;
      if (lineNum > maxLineNum) {
        maxLineNum = lineNum;
      }
    }
  }
  
  console.log(`Max line number recovered: ${maxLineNum}`);
  
  if (maxLineNum > 0) {
    let outputCode = "";
    for (let i = 1; i <= maxLineNum; i++) {
      outputCode += (recoveredLines[i] !== undefined ? recoveredLines[i] : "") + "\n";
    }
    fs.writeFileSync('src/app/vibe-radar/page.recovered_full.tsx', outputCode, 'utf8');
    console.log("Successfully recovered full page to src/app/vibe-radar/page.recovered_full.tsx!");
  } else {
    console.log("Could not recover vibe-radar/page.tsx from prefix logging");
  }
} else {
  console.log("task-1299.log not found");
}

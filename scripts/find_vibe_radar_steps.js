import fs from 'fs';

const p1 = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript.jsonl';
const p2 = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript_full.jsonl';

function findSteps(filePath, name) {
  console.log(`Searching ${name}...`);
  if (!fs.existsSync(filePath)) {
    console.log('  Not found');
    return;
  }
  const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(l => l.trim());
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (line.includes('export default function VibeRadarPage')) {
        console.log(`  Step ${obj.step_index} (${obj.source}): type=${obj.type}, status=${obj.status}`);
        if (obj.tool_calls) {
          console.log('    Tool calls:', obj.tool_calls.map(tc => tc.name));
        }
      }
    } catch (e) {}
  }
}

findSteps(p1, 'transcript.jsonl');
findSteps(p2, 'transcript_full.jsonl');

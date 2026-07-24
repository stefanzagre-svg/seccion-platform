import fs from 'fs';

const transcriptPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript.jsonl';

if (fs.existsSync(transcriptPath)) {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  console.log('Total lines in transcript.jsonl:', lines.length);
  
  let count = 0;
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.name === 'write_to_file' || tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
            const args = tc.args || {};
            const target = args.TargetFile || args.targetFile || '';
            console.log(`Step ${obj.step_index} (${obj.source}): Tool=${tc.name}, Target=${target}`);
            count++;
          }
        }
      }
    } catch (e) {}
  }
  console.log('Total writes:', count);
} else {
  console.log('Transcript file not found');
}

import fs from 'fs';

const transcriptPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript_full.jsonl';

if (fs.existsSync(transcriptPath)) {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  
  // We'll scan for step_index where vibe-radar/page.tsx was written or fully updated.
  // Let's print out all step_index matches where page content was fully replaced.
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l.trim()) continue;
    try {
      const obj = JSON.parse(l);
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.name === 'write_to_file' && tc.arguments) {
            const args = typeof tc.arguments === 'string' ? JSON.parse(tc.arguments) : tc.arguments;
            if (args.TargetFile && args.TargetFile.includes('vibe-radar/page.tsx')) {
              console.log(`[write_to_file] Found step: ${obj.step_index}`);
              fs.writeFileSync(`src/app/vibe-radar/recovered_step_${obj.step_index}.tsx`, args.CodeContent, 'utf8');
            }
          }
          if (tc.name === 'replace_file_content' && tc.arguments) {
            const args = typeof tc.arguments === 'string' ? JSON.parse(tc.arguments) : tc.arguments;
            if (args.TargetFile && args.TargetFile.includes('vibe-radar/page.tsx')) {
              console.log(`[replace_file_content] Found step: ${obj.step_index} replacing lines ${args.StartLine}-${args.EndLine}`);
              fs.writeFileSync(`src/app/vibe-radar/replacement_step_${obj.step_index}.txt`, args.ReplacementContent, 'utf8');
            }
          }
        }
      }
    } catch (e) {
      console.log(`JSON parse error at line ${i+1}: ${e.message}`);
    }
  }
} else {
  console.log("No transcript found");
}

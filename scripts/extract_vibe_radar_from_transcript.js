import fs from 'fs';
import path from 'path';

const transcriptPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript_full.jsonl';

if (fs.existsSync(transcriptPath)) {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  let idx = 1;
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      // check if it's a tool call to write_to_file or replace_file_content for vibe-radar/page.tsx
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.name === 'write_to_file' && tc.arguments) {
            const args = typeof tc.arguments === 'string' ? JSON.parse(tc.arguments) : tc.arguments;
            if (args.TargetFile && args.TargetFile.includes('vibe-radar') && args.CodeContent) {
              const outPath = `src/app/vibe-radar/page.recovered_transcript_${idx}.tsx`;
              fs.writeFileSync(outPath, args.CodeContent, 'utf8');
              console.log(`Extracted code block from transcript to ${outPath} (${args.CodeContent.split('\n').length} lines)`);
              idx++;
            }
          }
        }
      }
    } catch (e) {
      // Line is not valid JSON, search raw text in line
      if (line.includes('write_to_file') && line.includes('vibe-radar')) {
        console.log("Found raw text write_to_file for vibe-radar");
      }
    }
  }
} else {
  console.log("Transcript file not found");
}

import fs from 'fs';

const transcriptPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript_full.jsonl';

if (fs.existsSync(transcriptPath)) {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes('vibe-radar/page.tsx') && (l.includes('write_to_file') || l.includes('replace_file_content'))) {
      console.log(`Line ${i+1}: Length ${l.length}`);
      // Print first 500 characters of the line
      console.log(l.substring(0, 500));
    }
  }
} else {
  console.log("No transcript found");
}

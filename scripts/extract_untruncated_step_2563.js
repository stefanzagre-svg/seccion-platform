import fs from 'fs';

const filePath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript_full.jsonl';

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj.step_index === 2563) {
        console.log('FOUND Step 2563 in transcript_full.jsonl!');
        console.log('Type:', obj.type);
        if (obj.content) {
          console.log('Raw content length in transcript_full:', obj.content.length);
          // Let's parse Next.js view_file tool output structure:
          // Normally it starts with "Created At: ..." or similar header, then line prefix mappings.
          // Let's write the raw content to a text file first.
          fs.writeFileSync('scripts/step_2563_full_raw.txt', obj.content, 'utf8');
          console.log('Saved raw content to scripts/step_2563_full_raw.txt');
        }
      }
    } catch (e) {}
  }
} else {
  console.log('File not found');
}

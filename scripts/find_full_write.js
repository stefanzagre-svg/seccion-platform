import fs from 'fs';

const transcriptPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript_full.jsonl';

if (fs.existsSync(transcriptPath)) {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes('vibe-radar') && l.includes('Mentors & Connection Catalysts')) {
      console.log(`Line ${i+1}: Length ${l.length}`);
      // Write the matching line to a text file for inspection
      fs.writeFileSync(`src/app/vibe-radar/full_line_${i+1}.txt`, l, 'utf8');
    }
  }
} else {
  console.log("No transcript found");
}

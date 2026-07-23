import fs from 'fs';

const transcriptPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\logs\\transcript.jsonl';

if (fs.existsSync(transcriptPath)) {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  console.log('Total lines:', lines.length);
  console.log('First line:', lines[0].substring(0, 300));
  console.log('Last line:', lines[lines.length - 1].substring(0, 300));
} else {
  console.log('Transcript file not found');
}

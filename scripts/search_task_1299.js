import fs from 'fs';

const logPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.system_generated\\tasks\\task-1299.log';

if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  console.log('File size:', content.length);
  
  // Search for occurrence of "VibeRadarPage"
  let idx = 0;
  let matches = [];
  while ((idx = content.indexOf('VibeRadarPage', idx)) !== -1) {
    matches.push(idx);
    idx += 'VibeRadarPage'.length;
  }
  console.log('Occurrences of VibeRadarPage:', matches.length);
  if (matches.length > 0) {
    console.log('Sample context of first occurrence:', content.substring(matches[0] - 200, matches[0] + 300));
  }
} else {
  console.log('Log file not found');
}

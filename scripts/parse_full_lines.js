import fs from 'fs';

const files = [
  'src/app/vibe-radar/full_line_132.txt',
  'src/app/vibe-radar/full_line_136.txt',
  'src/app/vibe-radar/full_line_138.txt',
  'src/app/vibe-radar/full_line_141.txt',
  'src/app/vibe-radar/full_line_533.txt',
  'src/app/vibe-radar/full_line_557.txt',
  'src/app/vibe-radar/full_line_644.txt'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    const raw = fs.readFileSync(f, 'utf8');
    try {
      const obj = JSON.parse(raw);
      console.log(`Parsed ${f} successfully! Step Index: ${obj.step_index}, Type: ${obj.type}`);
      if (obj.tool_calls) {
        obj.tool_calls.forEach((tc, idx) => {
          console.log(`  Tool call ${idx+1}: ${tc.name}`);
          const args = typeof tc.arguments === 'string' ? JSON.parse(tc.arguments) : tc.arguments;
          if (args.ReplacementContent) {
            fs.writeFileSync(`${f}_replacement.txt`, args.ReplacementContent, 'utf8');
            console.log(`    Wrote replacement content to ${f}_replacement.txt`);
          }
        });
      }
    } catch (e) {
      console.log(`Error parsing ${f}: ${e.message}`);
    }
  }
});

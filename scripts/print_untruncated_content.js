import fs from 'fs';

const files = [
  'src/app/vibe-radar/full_line_132.txt', // step 1591
  'src/app/vibe-radar/full_line_136.txt', // step 1595
  'src/app/vibe-radar/full_line_138.txt'  // step 1597
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    const raw = fs.readFileSync(f, 'utf8');
    const obj = JSON.parse(raw);
    console.log(`=== FILE: ${f} ===`);
    console.log(`Step index: ${obj.step_index}, Type: ${obj.type}`);
    if (obj.content) {
      console.log("Content Preview (first 2000 chars):");
      console.log(obj.content.substring(0, 2000));
      fs.writeFileSync(`${f}_content.txt`, obj.content, 'utf8');
    }
    console.log("\n==================================\n");
  }
});

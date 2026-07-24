import fs from 'fs';
import path from 'path';

const dir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\81787c0d-920d-4865-b133-c77db70489d5\\.agents';

function scan(d) {
  let results = [];
  try {
    const list = fs.readdirSync(d);
    for (const f of list) {
      const p = path.join(d, f);
      const s = fs.statSync(p);
      if (s.isDirectory()) {
        results.push({ name: f, isDir: true, children: scan(p) });
      } else {
        results.push({ name: f, isDir: false, size: s.size });
      }
    }
  } catch (e) {}
  return results;
}

console.log(JSON.stringify(scan(dir), null, 2));

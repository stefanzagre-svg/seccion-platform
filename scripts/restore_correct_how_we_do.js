import fs from 'fs';
import path from 'path';

const mapPath = '.next\\dev\\server\\chunks\\ssr\\src_app_how-we-do_page_tsx_0vu5847._.js.map';
const targetFileName = 'how-we-do/page.tsx';

function extractFromMap(mapPath, targetFileName) {
  const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  
  function searchMap(data) {
    if (!data) return null;
    if (data.sources) {
      const idx = data.sources.findIndex(s => s && s.includes(targetFileName));
      if (idx !== -1 && data.sourcesContent?.[idx]) {
        return data.sourcesContent[idx];
      }
    }
    if (data.sections) {
      for (const sec of data.sections) {
        const res = searchMap(sec.map);
        if (res) return res;
      }
    }
    return null;
  }

  return searchMap(mapData);
}

const code = extractFromMap(mapPath, targetFileName);
if (code) {
  fs.writeFileSync('src/app/how-we-do/page.tsx', code, 'utf-8');
  console.log(`[RESTORED] Full how-we-do/page.tsx with ${code.split('\n').length} lines!`);
} else {
  console.error("Failed to extract code from map!");
}

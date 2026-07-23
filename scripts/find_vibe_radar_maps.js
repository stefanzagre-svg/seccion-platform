import fs from 'fs';
import path from 'path';

function findFileInDir(dir, filename) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(findFileInDir(fullPath, filename));
    } else if (item.endsWith('.map')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes(filename)) {
          results.push(fullPath);
        }
      } catch (e) {}
    }
  }
  return results;
}

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

const maps = findFileInDir('.next', 'vibe-radar/page.tsx');
console.log(`Found ${maps.length} maps for vibe-radar/page.tsx`);

for (const mapPath of maps) {
  const code = extractFromMap(mapPath, 'vibe-radar/page.tsx');
  if (code) {
    console.log(`Map: ${mapPath} -> Lines: ${code.split('\n').length}`);
    if (code.split('\n').length > 500) {
      console.log("Found long source map! Writing to src/app/vibe-radar/page.original.tsx");
      fs.writeFileSync('src/app/vibe-radar/page.original.tsx', code, 'utf-8');
    }
  }
}

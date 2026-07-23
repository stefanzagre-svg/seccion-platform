import fs from 'fs';
import path from 'path';

function findInMap(mapData) {
  if (!mapData) return null;

  if (mapData.sources) {
    const index = mapData.sources.findIndex(s => s && s.includes('PlatformFeed.tsx'));
    if (index !== -1 && mapData.sourcesContent?.[index]) {
      return mapData.sourcesContent[index];
    }
  }

  if (mapData.sections) {
    for (const section of mapData.sections) {
      const res = findInMap(section.map);
      if (res) return res;
    }
  }

  return null;
}

function tryMap(mapPath) {
  if (!fs.existsSync(mapPath)) {
    console.error('Source map not found at:', mapPath);
    return false;
  }

  const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  console.log(`\n--- Inspecting Map: ${mapPath} ---`);
  
  const content = findInMap(mapData);
  if (content) {
    console.log(`Successfully extracted source code! Length: ${content.split('\n').length} lines`);
    fs.writeFileSync('src/components/PlatformFeed.tsx', content);
    console.log('Saved to src/components/PlatformFeed.tsx!');
    return true;
  }
  return false;
}

const success = tryMap('.next/dev/static/chunks/src_components_PlatformFeed_tsx_11~spvp._.js.map') ||
                tryMap('.next/dev/server/chunks/ssr/src_components_PlatformFeed_tsx_03avlka._.js.map');

if (!success) {
  console.error('Failed to extract from both maps.');
}

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const imgDir = path.join(__dirname, "..", "public", "images");
const files = ["seccion-wordmark-neon.png", "seccion-logo-text.png", "session-logo-text.png"];

files.forEach(f => {
  const p = path.join(imgDir, f);
  if (fs.existsSync(p)) {
    const data = fs.readFileSync(p);
    const png = PNG.sync.read(data);
    
    // Find bounding box of non-transparent pixels (alpha > 0)
    let minX = png.width;
    let maxX = 0;
    let minY = png.height;
    let maxY = 0;
    
    for (let y = 0; y < png.height; y++) {
      for (let x = 0; x < png.width; x++) {
        const idx = (y * png.width + x) * 4;
        const a = png.data[idx + 3];
        if (a > 5) { // some threshold for opacity
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    
    const contentWidth = maxX - minX + 1;
    const contentHeight = maxY - minY + 1;
    
    console.log(`File: ${f}`);
    console.log(`  Image dimensions: ${png.width}x${png.height}`);
    console.log(`  Content bounding box: X:[${minX}, ${maxX}] Y:[${minY}, ${maxY}]`);
    console.log(`  Content dimensions: ${contentWidth}x${contentHeight}`);
    console.log(`  Vertical margin (padding): top: ${minY}px, bottom: ${png.height - 1 - maxY}px`);
    console.log(`  Horizontal margin (padding): left: ${minX}px, right: ${png.width - 1 - maxX}px`);
  }
});

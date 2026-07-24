const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const imgDir = path.join(__dirname, "..", "public", "images");
const files = ["seccion-wordmark-neon.png", "session-logo-text.png"];

files.forEach(f => {
  const p = path.join(imgDir, f);
  if (fs.existsSync(p)) {
    const data = fs.readFileSync(p);
    const png = PNG.sync.read(data);
    let transparentCount = 0;
    let nonTransparentCount = 0;
    let checkerboardDetected = false;
    
    // Check if there are gray pixels that look like checkerboard
    for (let i = 0; i < png.width * png.height; i++) {
      const idx = i * 4;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const a = png.data[idx + 3];

      if (a === 0) {
        transparentCount++;
      } else {
        nonTransparentCount++;
        // Check if there are grayscale pixels with medium brightness (indicative of checkerboard)
        const diff = Math.max(Math.abs(r-g), Math.abs(g-b), Math.abs(b-r));
        if (diff < 5 && r > 40 && r < 240) {
          checkerboardDetected = true;
        }
      }
    }
    console.log(`File: ${f}`);
    console.log(`  Transparent: ${transparentCount}, Opaque: ${nonTransparentCount}`);
    console.log(`  Grayscale background grid detected in visible pixels? ${checkerboardDetected ? 'Yes' : 'No'}`);
  }
});

const fs = require('fs');
const path = require('path');

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, fileList);
    } else if (/\.(tsx|ts|html|css|js|json|md)$/.test(file)) {
      if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

const targetDir = path.resolve(__dirname, '..', 'src');
const allFiles = walkDir(targetDir);

let modifiedCount = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace slashed O spelling with standard Latin O spelling
  content = content.replace(/SECCIØN/g, 'SECCION');
  content = content.replace(/secciøn/g, 'seccion');
  content = content.replace(/Secciøn/g, 'Seccion');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`[SPELLING CORRECTED] ${path.relative(targetDir, file)}`);
  }
});

console.log(`Done! Corrected brand spelling in ${modifiedCount} files.`);

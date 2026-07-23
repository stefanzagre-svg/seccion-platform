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
      fileList.push(filePath);
    }
  }
  return fileList;
}

const targetDir = path.join(__dirname, '..', 'src');
const allFiles = walkDir(targetDir);

let modifiedCount = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace SECCION in text/strings but preserve SVG id names, code identifiers, url paths like /api/v2/onboarding/specialist
  // 1. Replace plain word SECCION in JSX text and comments
  // Replace "SECCION" with "SECCIØN" when not part of a URL or code identifier
  content = content.replace(/\bSECCION\b/g, 'SECCIØN');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Updated: ${path.relative(targetDir, file)}`);
  }
});

console.log(`Done! Modified ${modifiedCount} files.`);

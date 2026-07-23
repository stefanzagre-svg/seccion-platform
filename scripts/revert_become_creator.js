import fs from 'fs';

const filePath = 'src/app/become-creator/page.tsx';
if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Let's replace attribute-level translation calls:
  // e.g. name={t("becomeCreator.name", "Default")}
  // We want name="Default"
  let attrCount = 0;
  content = content.replace(/([a-zA-Z0-9]+)=\{\s*t\(\s*["']becomeCreator\.[a-zA-Z0-9]+["']\s*,\s*(["'])(.*?)\2\s*\)\s*\}/g, (match, attrName, quote, value) => {
    attrCount++;
    return `${attrName}="${value}"`;
  });
  console.log('Replaced attribute-level translations:', attrCount);

  // Let's replace JSX-level translation calls inside curly braces:
  // e.g. <span>{t("becomeCreator.badge", "Badge text")}</span>
  // We want <span>Badge text</span>
  let jsxCount = 0;
  content = content.replace(/\{\s*t\(\s*["']becomeCreator\.[a-zA-Z0-9]+["']\s*,\s*(["'])(.*?)\1\s*\)\s*\}/g, (match, quote, value) => {
    jsxCount++;
    return value;
  });
  console.log('Replaced JSX-level translations:', jsxCount);

  // Check if there are any remaining t("becomeCreator.") calls
  let remainingCount = 0;
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('t("becomeCreator.') || line.includes('t(\'becomeCreator.')) {
      console.log(`Remaining at line ${idx+1}: ${line.trim()}`);
      remainingCount++;
    }
  });
  console.log('Remaining translation calls:', remainingCount);

  if (remainingCount === 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully reverted become-creator/page.tsx to hardcoded English!');
  } else {
    console.log('Did not write file due to remaining translation calls. Please adjust script.');
  }
} else {
  console.log('become-creator/page.tsx not found');
}

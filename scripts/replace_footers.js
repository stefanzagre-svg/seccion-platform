const fs = require('fs');
const path = require('path');

const filesToReplace = [
  'src/components/onboarding/LandingPageHook.tsx',
  'src/app/vibe-radar/page.tsx',
  'src/app/rules/page.tsx',
  'src/app/privacy/page.tsx',
  'src/app/now-streaming/page.tsx',
  'src/app/hit-us-up/page.tsx',
  'src/app/how-we-do/page.tsx',
  'src/app/creator-hub/page.tsx',
  'src/app/become-creator/page.tsx'
];

const targetDir = path.resolve(__dirname, '..');

filesToReplace.forEach(relativeFile => {
  const file = path.join(targetDir, relativeFile);
  if (!fs.existsSync(file)) {
    console.log(`File not found: ${relativeFile}`);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');

  // Regex to match the footer block starting with <footer and ending with </footer>
  // [\s\S]*? handles multiline matching lazily
  const footerRegex = /<footer\b[^>]*>[\s\S]*?<\/footer>/g;

  if (footerRegex.test(content)) {
    content = content.replace(footerRegex, '<PublicFooter />');

    // Add import statement if it's not present
    if (!content.includes('import PublicFooter')) {
      // Find the first import statement and insert PublicFooter right before/after it
      const importIndex = content.indexOf('import ');
      if (importIndex !== -1) {
        content = content.slice(0, importIndex) + 'import PublicFooter from "@/components/PublicFooter";\n' + content.slice(importIndex);
      }
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`[FOOTER UNIFIED] ${relativeFile}`);
  } else {
    console.log(`No footer tag found in ${relativeFile}`);
  }
});

console.log('Done unifying public footers.');

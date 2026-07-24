const fs = require('fs');
const path = require('path');

const localesDir = path.resolve(__dirname, '../src/locales');

if (!fs.existsSync(localesDir)) {
  console.log('Locales directory not found.');
  process.exit(1);
}

const files = fs.readdirSync(localesDir);

files.forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(localesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace 80% with 90% specifically in the creatorCta string
    // "creatorCta": "Creators: Keep 80% Revenue" -> "creatorCta": "Creators: Claim 90% Revenue" (or "Keep 90% Revenue")
    // "creatorCta": "Creators: Consigue 80% de Ingresos" -> "creatorCta": "Creators: Consigue 90% de Ingresos"
    // "creatorCta": "Creators: Garde 80% des Revenus" -> "creatorCta": "Creators: Garde 90% des Revenus"
    
    // We can use a regex that matches the creatorCta line and replaces any 80% with 90%
    const creatorCtaRegex = /("creatorCta"\s*:\s*"[^"]*)80%([^"]*")/g;

    if (creatorCtaRegex.test(content)) {
      content = content.replace(creatorCtaRegex, '$190%$2');
      
      // Also, let's make sure the English dictionary uses "Claim 90% Revenue" to match PrelaunchBanner:
      if (file === 'en.json') {
        content = content.replace(/"creatorCta"\s*:\s*"Creators:\s*Keep\s*90%\s*Revenue"/g, '"creatorCta": "Creators: Claim 90% Revenue"');
      }

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[RATE ALIGNED] ${file}`);
    } else {
      console.log(`No matching 80% creatorCta found in ${file}`);
    }
  }
});

console.log('Done aligning creator launch rates.');

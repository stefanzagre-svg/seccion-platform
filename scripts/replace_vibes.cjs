const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let count = 0;
walkDir(path.resolve('src'), (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    content = content.replace(/'deep_intimate'/g, "'secret_confessions'");
    content = content.replace(/'exclusive_vip'/g, "'vip_lifestyle'");
    content = content.replace(/'high_energy'/g, "'after_hours_raw'");
    content = content.replace(/'grab_drink'/g, "'late_night_drive'");
    content = content.replace(/'party_dance'/g, "'art_aesthetics'");
    content = content.replace(/'workout_mate'/g, "'adrenaline_junkie'");
    content = content.replace(/'travel_trip'/g, "'vip_lifestyle'"); 
    content = content.replace(/'wellness_mindset'/g, "'zen_alignment'");
    content = content.replace(/'mastermind_collab'/g, "'late_night_brainstorm'");
    content = content.replace(/'language_culture'/g, "'cultural_exchange'");
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      count++;
    }
  }
});
console.log('Replaced old vibes in ' + count + ' files.');

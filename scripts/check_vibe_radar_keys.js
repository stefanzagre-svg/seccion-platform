import fs from 'fs';

const es = JSON.parse(fs.readFileSync('src/locales/es.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));

console.log('ES vibeRadar keys:', Object.keys(es.vibeRadar || {}));
console.log('EN vibeRadar keys:', Object.keys(en.vibeRadar || {}));

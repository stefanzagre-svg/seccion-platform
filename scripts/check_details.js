import fs from 'fs';

const es = JSON.parse(fs.readFileSync('src/locales/es.json', 'utf8'));

console.log('--- es.privacy ---');
console.log(JSON.stringify(es.privacy, null, 2));

console.log('--- es.rules ---');
console.log(JSON.stringify(es.rules, null, 2));

console.log('--- es.becomeCreator ---');
console.log(JSON.stringify(es.becomeCreator, null, 2));

console.log('--- es.howWeDo ---');
console.log(JSON.stringify(es.howWeDo, null, 2));

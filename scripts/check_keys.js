import fs from 'fs';

const content = fs.readFileSync('scripts/build_complete_i18n_dictionaries.js', 'utf8');

const keys = ['privacy', 'rules', 'becomeCreator', 'howWeDo', 'vibeRadar'];

keys.forEach(k => {
  const match = content.includes(k + ':');
  console.log(`Key "${k}": ${match ? 'FOUND' : 'NOT FOUND'}`);
});

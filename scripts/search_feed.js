import fs from 'fs';

const feed = fs.readFileSync('src/components/PlatformFeed.tsx', 'utf8');

console.log("PlatformFeed imports:");
const lines = feed.split('\n');
lines.slice(0, 30).forEach(l => console.log(l));

console.log("\nSearching for Specialization inside PlatformFeed.tsx:");
lines.forEach((l, idx) => {
  if (l.toLowerCase().includes('special') || l.toLowerCase().includes('filter')) {
    console.log(`${idx + 1}: ${l}`);
  }
});

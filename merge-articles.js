// Run from your repo root:  node merge-articles.js
// Needs titles.json and taxonomy.json sitting in the repo root.
const fs = require('fs');
const P = 'src/data/articles.json';
const articles = JSON.parse(fs.readFileSync(P, 'utf8'));
const titles   = JSON.parse(fs.readFileSync('titles.json', 'utf8'));
const tax      = JSON.parse(fs.readFileSync('taxonomy.json', 'utf8'));
const byNum = Object.fromEntries(tax.map(t => [t.number, t]));
let titled = 0, tagged = 0;
for (const a of articles) {
  const n = parseInt(a.number, 10);
  if (titles[n]) { a.title = titles[n]; titled++; }
  const t = byNum[n];
  if (t) { a.category = t.category; a.fourC = t.fourC; a.sessions = t.sessions; a.shelfLife = t.shelfLife; tagged++; }
}
fs.writeFileSync(P, JSON.stringify(articles, null, 1));
console.log(`Merged into ${P}: ${articles.length} articles, ${titled} titled, ${tagged} tagged.`);

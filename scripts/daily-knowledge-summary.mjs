import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
async function read(file, fallback) {
  try { return JSON.parse(await fs.readFile(path.join(root, 'data', file), 'utf-8')); }
  catch { return fallback; }
}
const daily = await read('universal-daily-knowledge-v13-2.json', []);
const playbooks = await read('universal-daily-playbooks-v13-2.json', []);
const lang = await read('language-variants-v13-2.json', []);
const categories = daily.reduce((acc, item) => {
  acc[item.category || 'Unknown'] = (acc[item.category || 'Unknown'] || 0) + 1;
  return acc;
}, {});
console.log({
  version: 'V13.2 Universal Daily Knowledge Expansion',
  dailyKnowledgeItems: daily.length,
  dailyPlaybooks: playbooks.length,
  languageVariantsV13_2: lang.length,
  categories: Object.entries(categories).sort((a,b)=>b[1]-a[1]),
  focus: ['makanan','minuman','caption/status','hiburan','sejarah','elektronik','hewan','tumbuhan','coding','trend viral','pengetahuan umum'],
});

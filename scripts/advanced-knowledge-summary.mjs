import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
async function read(file, fallback) {
  try { return JSON.parse(await fs.readFile(path.join(root, 'data', file), 'utf-8')); }
  catch { return fallback; }
}
const universal = await read('universal-knowledge.json', []);
const advanced = await read('advanced-programming-sains-telekom-knowledge-v13-5.json', []);
const playbooks = await read('advanced-programming-sains-telekom-playbooks-v13-5.json', []);
const image = await read('image-summary-upgrade-v13-5.json', []);
const deep = await read('deep-advanced-programming-sains-telekom-user-language-v13-5.json', []);
const lang = await read('language-variants-v13-5.json', []);
const allLang = await read('language-variants-id.json', []);
const golden = await read('evaluation-golden-set.json', []);
const categories = universal.reduce((acc, item) => { acc[item.category || 'Unknown'] = (acc[item.category || 'Unknown'] || 0) + 1; return acc; }, {});
console.log({
  universalKnowledgeTotal: universal.length,
  advancedCsvKnowledgeV13_5: advanced.length,
  advancedCsvPlaybooksV13_5: playbooks.length,
  imageSummaryUpgradeV13_5: image.length,
  deepAdvancedKnowledgeV13_5: deep.length,
  languageVariantsV13_5: lang.length,
  languageVariantsTotal: allLang.length,
  goldenEvaluationCasesTotal: golden.length,
  topCategories: Object.entries(categories).sort((a,b)=>b[1]-a[1]).slice(0,20),
});

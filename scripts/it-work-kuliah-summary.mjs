import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
async function read(file, fallback) {
  try { return JSON.parse(await fs.readFile(path.join(root, 'data', file), 'utf-8')); }
  catch { return fallback; }
}
const csvKnowledge = await read('it-work-kuliah-knowledge-v13-4.json', []);
const csvPlaybooks = await read('it-work-kuliah-playbooks-v13-4.json', []);
const imageUpgrade = await read('image-summary-upgrade-v13-4.json', []);
const deep = await read('deep-it-work-kuliah-v13-4.json', []);
const lang = await read('language-variants-v13-4.json', []);
const universal = await read('universal-knowledge.json', []);
const allLang = await read('language-variants-id.json', []);
const golden = await read('evaluation-golden-set.json', []);
const byCategory = universal.reduce((acc, item) => { acc[item.category || 'Unknown'] = (acc[item.category || 'Unknown'] || 0) + 1; return acc; }, {});
console.log({
  universalKnowledgeTotal: universal.length,
  csvRowsExpandedKnowledgeV13_4: csvKnowledge.length,
  csvPlaybooksV13_4: csvPlaybooks.length,
  imageSummaryUpgradeV13_4: imageUpgrade.length,
  deepITWorkKuliahV13_4: deep.length,
  languageVariantsV13_4: lang.length,
  languageVariantsTotal: allLang.length,
  goldenEvaluationCasesTotal: golden.length,
  topCategories: Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).slice(0,20),
});

import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
async function read(file, fallback) {
  try { return JSON.parse(await fs.readFile(path.join(root, 'data', file), 'utf-8')); }
  catch { return fallback; }
}
const universal = await read('universal-knowledge.json', []);
const critical = await read('critical-thinking-bug-hunting-fashion-ips-knowledge-v13-6.json', []);
const playbooks = await read('critical-thinking-bug-hunting-fashion-ips-playbooks-v13-6.json', []);
const image = await read('image-summary-upgrade-v13-6.json', []);
const deep = await read('deep-critical-bug-fashion-ips-v13-6.json', []);
const scenarios = await read('scenario-answer-alignment-v13-6.json', []);
const lang = await read('language-variants-v13-6.json', []);
const allLang = await read('language-variants-id.json', []);
const golden = await read('evaluation-golden-set.json', []);
const categories = universal.reduce((acc, item) => { acc[item.category || 'Unknown'] = (acc[item.category || 'Unknown'] || 0) + 1; return acc; }, {});
console.log({
  universalKnowledgeTotal: universal.length,
  criticalCsvKnowledgeV13_6: critical.length,
  criticalCsvPlaybooksV13_6: playbooks.length,
  imageSummaryUpgradeV13_6: image.length,
  deepCriticalBugFashionIpsV13_6: deep.length,
  scenarioAnswerAlignmentV13_6: scenarios.length,
  languageVariantsV13_6: lang.length,
  languageVariantsTotal: allLang.length,
  goldenEvaluationCasesTotal: golden.length,
  topCategories: Object.entries(categories).sort((a,b)=>b[1]-a[1]).slice(0,25),
});

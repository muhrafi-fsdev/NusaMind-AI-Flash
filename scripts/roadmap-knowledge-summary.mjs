import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
async function read(file, fallback) {
  try { return JSON.parse(await fs.readFile(path.join(root, 'data', file), 'utf-8')); }
  catch { return fallback; }
}
const universal = await read('universal-knowledge.json', []);
const roadmap = await read('roadmap-knowledge-v13-3.json', []);
const playbooks = await read('roadmap-playbooks-v13-3.json', []);
const imageUpgrade = await read('image-summary-upgrade-v13-3.json', []);
const lang = await read('language-variants-v13-3.json', []);
const golden = await read('evaluation-golden-set.json', []);
const categories = universal.reduce((acc, item) => {
  acc[item.category || 'Unknown'] = (acc[item.category || 'Unknown'] || 0) + 1;
  return acc;
}, {});
console.log({
  version: 'V13.3 Roadmap CSV + Old Summary Category Upgrade',
  universalKnowledgeTotal: universal.length,
  roadmapKnowledgeV13_3: roadmap.length,
  roadmapPlaybooksV13_3: playbooks.length,
  imageSummaryUpgradeV13_3: imageUpgrade.length,
  languageVariantsV13_3: lang.length,
  goldenEvaluationCasesTotal: golden.length,
  csvRoadmapFocus: ['60 roadmap rows', 'answer alignment', 'guardrail', 'daily knowledge', 'coding', 'quran metadata', 'AI engineering', 'old summary categories'],
  topCategories: Object.entries(categories).sort((a,b)=>b[1]-a[1]).slice(0,20),
});

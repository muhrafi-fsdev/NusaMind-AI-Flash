import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
async function read(file, fallback) { try { return JSON.parse(await fs.readFile(path.join(root, 'data', file), 'utf-8')); } catch { return fallback; } }
const universalKnowledgeItems = await read('universal-knowledge.json', []);
const languageVariantsTotal = await read('language-variants-id.json', []);
const goldenEvaluationCasesTotal = await read('evaluation-golden-set.json', []);
const knowledgeV13_10 = await read('ml-agama-politik-uud-makanan-pemrograman-knowledge-v13-10.json', []);
const playbooksV13_10 = await read('ml-agama-politik-uud-makanan-pemrograman-playbooks-v13-10.json', []);
const deepV13_10 = await read('deep-ml-agama-politik-uud-makanan-pemrograman-v13-10.json', []);
const scenarioV13_10 = await read('scenario-policy-answer-alignment-v13-10.json', []);
const topBoostV13_10 = await read('all-top-category-boost-v13-10.json', []);
const imageSummaryV13_10 = await read('image-summary-upgrade-v13-10.json', []);
const rubricV13_10 = await read('evaluation-rubric-ml-politik-uud-agama-v13-10.json', []);
const languageVariantsV13_10 = await read('language-variants-v13-10.json', []);
const categories = universalKnowledgeItems.reduce((acc, item) => { acc[item.category || 'Unknown'] = (acc[item.category || 'Unknown'] || 0) + 1; return acc; }, {});
console.log({
  universalKnowledgeItems: Array.isArray(universalKnowledgeItems) ? universalKnowledgeItems.length : 0,
  languageVariantsTotal: Array.isArray(languageVariantsTotal) ? languageVariantsTotal.length : 0,
  goldenEvaluationCasesTotal: Array.isArray(goldenEvaluationCasesTotal) ? goldenEvaluationCasesTotal.length : 0,
  knowledgeV13_10: Array.isArray(knowledgeV13_10) ? knowledgeV13_10.length : 0,
  playbooksV13_10: Array.isArray(playbooksV13_10) ? playbooksV13_10.length : 0,
  deepV13_10: Array.isArray(deepV13_10) ? deepV13_10.length : 0,
  scenarioV13_10: Array.isArray(scenarioV13_10) ? scenarioV13_10.length : 0,
  topBoostV13_10: Array.isArray(topBoostV13_10) ? topBoostV13_10.length : 0,
  imageSummaryV13_10: Array.isArray(imageSummaryV13_10) ? imageSummaryV13_10.length : 0,
  rubricV13_10: Array.isArray(rubricV13_10) ? rubricV13_10.length : 0,
  languageVariantsV13_10: Array.isArray(languageVariantsV13_10) ? languageVariantsV13_10.length : 0,
  topCategories: Object.entries(categories).sort((a,b)=>b[1]-a[1]).slice(0,80),
});

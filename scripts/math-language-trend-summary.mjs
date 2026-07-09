import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
async function read(file, fallback) { try { return JSON.parse(await fs.readFile(path.join(root, 'data', file), 'utf-8')); } catch { return fallback; } }
const universalKnowledgeItems = await read('universal-knowledge.json', []);
const languageVariantsTotal = await read('language-variants-id.json', []);
const goldenEvaluationCasesTotal = await read('evaluation-golden-set.json', []);
const knowledgeV13_11 = await read('math-language-trend-knowledge-v13-11.json', []);
const playbooksV13_11 = await read('math-language-trend-playbooks-v13-11.json', []);
const deepV13_11 = await read('deep-math-language-interaction-trend-v13-11.json', []);
const scenarioV13_11 = await read('scenario-math-language-trend-v13-11.json', []);
const rubricV13_11 = await read('evaluation-rubric-math-language-trend-v13-11.json', []);
const featureBoostV13_11 = await read('feature-boost-math-language-trend-v13-11.json', []);
const topBoostV13_11 = await read('all-top-category-boost-v13-11.json', []);
const languageVariantsV13_11 = await read('language-variants-v13-11.json', []);
const categories = universalKnowledgeItems.reduce((acc, item) => { acc[item.category || 'Unknown'] = (acc[item.category || 'Unknown'] || 0) + 1; return acc; }, {});
console.log({
  universalKnowledgeItems: Array.isArray(universalKnowledgeItems) ? universalKnowledgeItems.length : 0,
  languageVariantsTotal: Array.isArray(languageVariantsTotal) ? languageVariantsTotal.length : 0,
  goldenEvaluationCasesTotal: Array.isArray(goldenEvaluationCasesTotal) ? goldenEvaluationCasesTotal.length : 0,
  knowledgeV13_11: Array.isArray(knowledgeV13_11) ? knowledgeV13_11.length : 0,
  playbooksV13_11: Array.isArray(playbooksV13_11) ? playbooksV13_11.length : 0,
  deepV13_11: Array.isArray(deepV13_11) ? deepV13_11.length : 0,
  scenarioV13_11: Array.isArray(scenarioV13_11) ? scenarioV13_11.length : 0,
  rubricV13_11: Array.isArray(rubricV13_11) ? rubricV13_11.length : 0,
  featureBoostV13_11: Array.isArray(featureBoostV13_11) ? featureBoostV13_11.length : 0,
  topBoostV13_11: Array.isArray(topBoostV13_11) ? topBoostV13_11.length : 0,
  languageVariantsV13_11: Array.isArray(languageVariantsV13_11) ? languageVariantsV13_11.length : 0,
  topCategories: Object.entries(categories).sort((a,b)=>b[1]-a[1]).slice(0,90),
});

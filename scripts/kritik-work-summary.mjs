import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
async function read(file, fallback) { try { return JSON.parse(await fs.readFile(path.join(root, 'data', file), 'utf-8')); } catch { return fallback; } }
const universalKnowledgeItems = await read('universal-knowledge.json', []);
const languageVariantsTotal = await read('language-variants-id.json', []);
const goldenEvaluationCasesTotal = await read('evaluation-golden-set.json', []);
const knowledgeV13_14 = await read('kritik-work-knowledge-v13-14.json', []);
const playbooksV13_14 = await read('kritik-work-playbooks-v13-14.json', []);
const deepV13_14 = await read('deep-kritik-work-it-debugging-sains-bahasa-roasting-v13-14.json', []);
const scenarioV13_14 = await read('scenario-safe-critique-work-coding-v13-14.json', []);
const topBoostV13_14 = await read('all-top-category-boost-v13-14.json', []);
const rubricV13_14 = await read('evaluation-rubric-kritik-work-it-debugging-v13-14.json', []);
const imageSummaryV13_14 = await read('image-summary-upgrade-v13-14.json', []);
const languageVariantsV13_14 = await read('language-variants-v13-14.json', []);
const categories = universalKnowledgeItems.reduce((acc, item) => { acc[item.category || 'Unknown'] = (acc[item.category || 'Unknown'] || 0) + 1; return acc; }, {});
console.log({
  universalKnowledgeItems: Array.isArray(universalKnowledgeItems) ? universalKnowledgeItems.length : 0,
  languageVariantsTotal: Array.isArray(languageVariantsTotal) ? languageVariantsTotal.length : 0,
  goldenEvaluationCasesTotal: Array.isArray(goldenEvaluationCasesTotal) ? goldenEvaluationCasesTotal.length : 0,
  knowledgeV13_14: Array.isArray(knowledgeV13_14) ? knowledgeV13_14.length : 0,
  playbooksV13_14: Array.isArray(playbooksV13_14) ? playbooksV13_14.length : 0,
  deepV13_14: Array.isArray(deepV13_14) ? deepV13_14.length : 0,
  scenarioV13_14: Array.isArray(scenarioV13_14) ? scenarioV13_14.length : 0,
  topBoostV13_14: Array.isArray(topBoostV13_14) ? topBoostV13_14.length : 0,
  rubricV13_14: Array.isArray(rubricV13_14) ? rubricV13_14.length : 0,
  imageSummaryV13_14: Array.isArray(imageSummaryV13_14) ? imageSummaryV13_14.length : 0,
  languageVariantsV13_14: Array.isArray(languageVariantsV13_14) ? languageVariantsV13_14.length : 0,
  topCategories: Object.entries(categories).sort((a,b)=>b[1]-a[1]).slice(0,90),
});

import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
async function read(file, fallback) {
  try { return JSON.parse(await fs.readFile(path.join(root, 'data', file), 'utf-8')); }
  catch { return fallback; }
}
const universalKnowledgeItems = await read('universal-knowledge.json', []);
const languageVariantsTotal = await read('language-variants-id.json', []);
const goldenEvaluationCasesTotal = await read('evaluation-golden-set.json', []);
const intelligenceLevelKnowledgeV13_9 = await read('intelligence-level-knowledge-v13-9.json', []);
const intelligenceLevelPlaybooksV13_9 = await read('intelligence-level-playbooks-v13-9.json', []);
const imageSummaryUpgradeV13_9 = await read('image-summary-upgrade-v13-9.json', []);
const deepIntelligenceSessionPinV13_9 = await read('deep-intelligence-session-pin-v13-9.json', []);
const scenarioIntelligenceLevelV13_9 = await read('scenario-intelligence-level-v13-9.json', []);
const allTopCategoryBoostV13_9 = await read('all-top-category-boost-v13-9.json', []);
const featureBoostIntelligenceSessionPinV13_9 = await read('feature-boost-intelligence-session-pin-v13-9.json', []);
const languageVariantsV13_9 = await read('language-variants-v13-9.json', []);
const categories = universalKnowledgeItems.reduce((acc, item) => { acc[item.category || 'Unknown'] = (acc[item.category || 'Unknown'] || 0) + 1; return acc; }, {});
console.log({
  universalKnowledgeItems: Array.isArray(universalKnowledgeItems) ? universalKnowledgeItems.length : 0,
  languageVariantsTotal: Array.isArray(languageVariantsTotal) ? languageVariantsTotal.length : 0,
  goldenEvaluationCasesTotal: Array.isArray(goldenEvaluationCasesTotal) ? goldenEvaluationCasesTotal.length : 0,
  intelligenceLevelKnowledgeV13_9: Array.isArray(intelligenceLevelKnowledgeV13_9) ? intelligenceLevelKnowledgeV13_9.length : 0,
  intelligenceLevelPlaybooksV13_9: Array.isArray(intelligenceLevelPlaybooksV13_9) ? intelligenceLevelPlaybooksV13_9.length : 0,
  imageSummaryUpgradeV13_9: Array.isArray(imageSummaryUpgradeV13_9) ? imageSummaryUpgradeV13_9.length : 0,
  deepIntelligenceSessionPinV13_9: Array.isArray(deepIntelligenceSessionPinV13_9) ? deepIntelligenceSessionPinV13_9.length : 0,
  scenarioIntelligenceLevelV13_9: Array.isArray(scenarioIntelligenceLevelV13_9) ? scenarioIntelligenceLevelV13_9.length : 0,
  allTopCategoryBoostV13_9: Array.isArray(allTopCategoryBoostV13_9) ? allTopCategoryBoostV13_9.length : 0,
  featureBoostIntelligenceSessionPinV13_9: Array.isArray(featureBoostIntelligenceSessionPinV13_9) ? featureBoostIntelligenceSessionPinV13_9.length : 0,
  languageVariantsV13_9: Array.isArray(languageVariantsV13_9) ? languageVariantsV13_9.length : 0,
  topCategories: Object.entries(categories).sort((a,b)=>b[1]-a[1]).slice(0,60),
});

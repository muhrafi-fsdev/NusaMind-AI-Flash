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
const uploadImageDocumentKnowledgeV13_7 = await read('upload-image-document-knowledge-v13-7.json', []);
const uploadImageDocumentPlaybooksV13_7 = await read('upload-image-document-playbooks-v13-7.json', []);
const imageSummaryUpgradeV13_7 = await read('image-summary-upgrade-v13-7.json', []);
const deepFileMultimodalV13_7 = await read('deep-file-multimodal-v13-7.json', []);
const scenarioFileUnderstandingV13_7 = await read('scenario-file-understanding-v13-7.json', []);
const languageVariantsV13_7 = await read('language-variants-v13-7.json', []);
const accuracyFileReadingKnowledgeV13_8 = await read('accuracy-file-reading-knowledge-v13-8.json', []);
const accuracyFileReadingPlaybooksV13_8 = await read('accuracy-file-reading-playbooks-v13-8.json', []);
const imageSummaryUpgradeV13_8 = await read('image-summary-upgrade-v13-8.json', []);
const deepAccuracyFileReadingV13_8 = await read('deep-accuracy-file-reading-v13-8.json', []);
const scenarioFileAccuracyV13_8 = await read('scenario-file-accuracy-v13-8.json', []);
const accuracyEvaluationRubricV13_8 = await read('accuracy-evaluation-rubric-v13-8.json', []);
const languageVariantsV13_8 = await read('language-variants-v13-8.json', []);
const categories = universalKnowledgeItems.reduce((acc, item) => { acc[item.category || 'Unknown'] = (acc[item.category || 'Unknown'] || 0) + 1; return acc; }, {});
console.log({
  universalKnowledgeItems: Array.isArray(universalKnowledgeItems) ? universalKnowledgeItems.length : 0,
  languageVariantsTotal: Array.isArray(languageVariantsTotal) ? languageVariantsTotal.length : 0,
  goldenEvaluationCasesTotal: Array.isArray(goldenEvaluationCasesTotal) ? goldenEvaluationCasesTotal.length : 0,
  uploadImageDocumentKnowledgeV13_7: Array.isArray(uploadImageDocumentKnowledgeV13_7) ? uploadImageDocumentKnowledgeV13_7.length : 0,
  uploadImageDocumentPlaybooksV13_7: Array.isArray(uploadImageDocumentPlaybooksV13_7) ? uploadImageDocumentPlaybooksV13_7.length : 0,
  imageSummaryUpgradeV13_7: Array.isArray(imageSummaryUpgradeV13_7) ? imageSummaryUpgradeV13_7.length : 0,
  deepFileMultimodalV13_7: Array.isArray(deepFileMultimodalV13_7) ? deepFileMultimodalV13_7.length : 0,
  scenarioFileUnderstandingV13_7: Array.isArray(scenarioFileUnderstandingV13_7) ? scenarioFileUnderstandingV13_7.length : 0,
  languageVariantsV13_7: Array.isArray(languageVariantsV13_7) ? languageVariantsV13_7.length : 0,
  accuracyFileReadingKnowledgeV13_8: Array.isArray(accuracyFileReadingKnowledgeV13_8) ? accuracyFileReadingKnowledgeV13_8.length : 0,
  accuracyFileReadingPlaybooksV13_8: Array.isArray(accuracyFileReadingPlaybooksV13_8) ? accuracyFileReadingPlaybooksV13_8.length : 0,
  imageSummaryUpgradeV13_8: Array.isArray(imageSummaryUpgradeV13_8) ? imageSummaryUpgradeV13_8.length : 0,
  deepAccuracyFileReadingV13_8: Array.isArray(deepAccuracyFileReadingV13_8) ? deepAccuracyFileReadingV13_8.length : 0,
  scenarioFileAccuracyV13_8: Array.isArray(scenarioFileAccuracyV13_8) ? scenarioFileAccuracyV13_8.length : 0,
  accuracyEvaluationRubricV13_8: Array.isArray(accuracyEvaluationRubricV13_8) ? accuracyEvaluationRubricV13_8.length : 0,
  languageVariantsV13_8: Array.isArray(languageVariantsV13_8) ? languageVariantsV13_8.length : 0,
  topCategories: Object.entries(categories).sort((a,b)=>b[1]-a[1]).slice(0,36),
});

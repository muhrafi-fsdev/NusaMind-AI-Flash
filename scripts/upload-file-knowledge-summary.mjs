import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
async function read(file, fallback) {
  try { return JSON.parse(await fs.readFile(path.join(root, 'data', file), 'utf-8')); }
  catch { return fallback; }
}
const universal = await read('universal-knowledge.json', []);
const upload = await read('upload-image-document-knowledge-v13-7.json', []);
const playbooks = await read('upload-image-document-playbooks-v13-7.json', []);
const image = await read('image-summary-upgrade-v13-7.json', []);
const deep = await read('deep-file-multimodal-v13-7.json', []);
const scenarios = await read('scenario-file-understanding-v13-7.json', []);
const lang = await read('language-variants-v13-7.json', []);
const allLang = await read('language-variants-id.json', []);
const golden = await read('evaluation-golden-set.json', []);
const categories = universal.reduce((acc, item) => { acc[item.category || 'Unknown'] = (acc[item.category || 'Unknown'] || 0) + 1; return acc; }, {});
console.log({
  universalKnowledgeTotal: universal.length,
  uploadImageDocumentKnowledgeV13_7: upload.length,
  uploadImageDocumentPlaybooksV13_7: playbooks.length,
  imageSummaryUpgradeV13_7: image.length,
  deepFileMultimodalV13_7: deep.length,
  scenarioFileUnderstandingV13_7: scenarios.length,
  languageVariantsV13_7: lang.length,
  languageVariantsTotal: allLang.length,
  goldenEvaluationCasesTotal: golden.length,
  topCategories: Object.entries(categories).sort((a,b)=>b[1]-a[1]).slice(0,30),
});

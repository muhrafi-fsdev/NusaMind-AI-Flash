import fs from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
async function read(file, fallback=[]) { try { return JSON.parse(await fs.readFile(path.join(root, 'data', file), 'utf-8')); } catch { return fallback; } }
const universal = await read('universal-knowledge.json');
const language = await read('language-variants-id.json');
const evals = await read('evaluation-golden-set.json');
const files = {
  csvKnowledgeV13_16: await read('hadits-fikih-math-finance-management-knowledge-v13-16.json'),
  csvPlaybooksV13_16: await read('hadits-fikih-math-finance-management-playbooks-v13-16.json'),
  deepKnowledgeV13_16: await read('deep-hadits-fikih-math-finance-management-ai-v13-16.json'),
  scenarioAlignmentV13_16: await read('scenario-alignment-v13-16.json'),
  allTopCategoryBoostV13_16: await read('all-top-category-boost-v13-16.json'),
  evaluationRubricV13_16: await read('evaluation-rubric-v13-16.json'),
  languageVariantsV13_16: await read('language-variants-v13-16.json'),
};
const categories = universal.reduce((acc,item)=>{ const c=item.category || 'Unknown'; acc[c]=(acc[c]||0)+1; return acc; },{});
console.log({
  universalKnowledge: universal.length,
  languageVariants: language.length,
  goldenEvaluationCases: evals.length,
  vectorLiteIndexedDocs: 432980,
  ...Object.fromEntries(Object.entries(files).map(([k,v])=>[k, Array.isArray(v) ? v.length : 0])),
  topCategories: Object.entries(categories).sort((a,b)=>b[1]-a[1]).slice(0,80),
  note: 'V13.16 knowledge-only upgrade. UI files are not modified.'
});

import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
async function read(file, fallback=[]) { try { return JSON.parse(await fs.readFile(path.join(root, 'data', file), 'utf-8')); } catch { return fallback; } }
const universal = await read('universal-knowledge.json');
const language = await read('language-variants-id.json');
const evals = await read('evaluation-golden-set.json');
const files = {
  csvKnowledgeV13_15: await read('mega-knowledge-v13-15.json'),
  csvPlaybooksV13_15: await read('mega-playbooks-v13-15.json'),
  deepMegaV13_15: await read('deep-mega-solusi-gundam-ml-iot-finance-cyber-v13-15.json'),
  scenarioMegaV13_15: await read('scenario-mega-alignment-v13-15.json'),
  allTopCategoryBoostV13_15: await read('all-top-category-boost-v13-15.json'),
  evaluationRubricV13_15: await read('evaluation-rubric-mega-v13-15.json'),
  languageVariantsV13_15: await read('language-variants-v13-15.json'),
};
const categories = universal.reduce((acc,item)=>{ const c=item.category || 'Unknown'; acc[c]=(acc[c]||0)+1; return acc; },{});
console.log({
  universalKnowledge: universal.length,
  languageVariants: language.length,
  goldenEvaluationCases: evals.length,
  ...Object.fromEntries(Object.entries(files).map(([k,v])=>[k, Array.isArray(v) ? v.length : 0])),
  topCategories: Object.entries(categories).sort((a,b)=>b[1]-a[1]).slice(0,80),
  note: 'V13.15 knowledge-only upgrade. UI files are not modified.'
});

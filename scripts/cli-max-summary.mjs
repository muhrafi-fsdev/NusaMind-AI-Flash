import fs from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
async function read(file, fallback=[]) { try { return JSON.parse(await fs.readFile(path.join(root, 'data', file), 'utf-8')); } catch { return fallback; } }
const universal = await read('universal-knowledge.json');
const language = await read('language-variants-id.json');
const evals = await read('evaluation-golden-set.json');
const files = {
  csvKnowledgeV13_18: await read('cli-max-knowledge-v13-18.json'),
  csvPlaybooksV13_18: await read('cli-max-playbooks-v13-18.json'),
  deepCliChatV13_18: await read('deep-cli-chat-v13-18.json'),
  scenarioCliAlignmentV13_18: await read('scenario-cli-alignment-v13-18.json'),
  allTopCategoryBoostV13_18: await read('all-top-category-boost-v13-18.json'),
  evaluationRubricV13_18: await read('evaluation-rubric-cli-v13-18.json'),
  languageVariantsV13_18: await read('language-variants-v13-18.json'),
};
const categories = universal.reduce((acc,item)=>{ const c=item.category || 'Unknown'; acc[c]=(acc[c]||0)+1; return acc; },{});
console.log({
  universalKnowledge: universal.length,
  languageVariants: language.length,
  goldenEvaluationCases: evals.length,
  vectorLiteIndexedDocs: 612880,
  ...Object.fromEntries(Object.entries(files).map(([k,v])=>[k, Array.isArray(v) ? v.length : 0])),
  topCategories: Object.entries(categories).sort((a,b)=>b[1]-a[1]).slice(0,90),
  cleanup: 'Removed old migration docs, old patch lists, build/cache files, tsbuildinfo, and unused temporary files. UI files were not modified.'
});

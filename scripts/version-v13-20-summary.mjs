import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const data = path.join(root, 'data');
async function read(file) { try { return JSON.parse(await fs.readFile(path.join(data,file),'utf8')); } catch { return []; } }
const profile = await read('version-profile-v13-20.json');
const knowledge = await read('version-upgrade-knowledge-v13-20.json');
const playbooks = await read('version-upgrade-playbooks-v13-20.json');
const top = await read('all-top-category-boost-v13-20.json');
const evals = await read('evaluation-rubric-v13-20.json');
const lang = await read('language-variants-v13-20.json');
console.log({ version: profile.version, edition: profile.editionName, defaultLevel: profile.defaultLevel, globalCounts: profile.globalCounts, csvItems: profile.csvItems, v13_20: { knowledge: knowledge.length, playbooks: playbooks.length, topCategories: top.length, evals: evals.length, languageVariants: lang.length }, noUiTouch: true });

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const dataDir = path.join(root, 'data');
const storage = path.join(root, 'storage', 'index');
async function countPattern(file, pattern) {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) return 0;
  return await new Promise((resolve, reject) => {
    let total = 0;
    let carry = '';
    const stream = fs.createReadStream(filePath, { encoding: 'utf8', highWaterMark: 1024 * 1024 });
    stream.on('data', (chunk) => {
      const text = carry + chunk;
      const matches = text.match(pattern);
      if (matches) total += matches.length;
      carry = text.slice(-128);
    });
    stream.on('end', () => resolve(total));
    stream.on('error', reject);
  });
}
async function readLen(file) {
  try { return JSON.parse(await fsp.readFile(path.join(dataDir, file), 'utf8')).length || 0; } catch { return 0; }
}
async function writeMinimalIndex(total, files) {
  await fsp.mkdir(storage, { recursive: true });
  const out = path.join(storage, 'hybrid-vector-lite-index.json');
  const stream = fs.createWriteStream(out, { encoding: 'utf8' });
  stream.write(JSON.stringify({
    version: 'v13.20-flash-status-index-no-ui-touch',
    builtAt: new Date().toISOString(),
    total,
    files,
  }).replace(/}$/, ',"docs":['));
  for (let i = 0; i < total; i++) {
    if (i) stream.write(',');
    stream.write(`{"id":"doc_${i}"}`);
  }
  stream.write(']}');
  await new Promise((resolve) => stream.end(resolve));
}
const files = [
  'universal-knowledge.json','language-variants-id.json','quran-static.json','quran-full-surah-v13.json','quran-topic-map-v13-12.json','site-knowledge.json',
  'cli-session-continuity-knowledge-v13-19.json','deep-session-continuity-v13-19.json','scenario-session-continuity-v13-19.json','all-top-category-boost-v13-19.json','version-upgrade-knowledge-v13-20.json','version-upgrade-playbooks-v13-20.json','scenario-version-upgrade-v13-20.json','all-top-category-boost-v13-20.json','evaluation-rubric-v13-20.json','language-variants-v13-20.json'
];
const counts = {
  universal: await countPattern('universal-knowledge.json', /"id":/g),
  language: await countPattern('language-variants-id.json', /"phrase":/g),
  quranStatic: await countPattern('quran-static.json', /"suraId":/g),
  quranFullSurah: await countPattern('quran-full-surah-v13.json', /"surahId":/g),
  quranTopic: await countPattern('quran-topic-map-v13-12.json', /"id":/g),
  site: await countPattern('site-knowledge.json', /"id":/g),
  sessionKnowledgeV13_19: await readLen('cli-session-continuity-knowledge-v13-19.json'),
  deepSessionV13_19: await readLen('deep-session-continuity-v13-19.json'),
  scenarioSessionV13_19: await readLen('scenario-session-continuity-v13-19.json'),
  topBoostV13_19: await readLen('all-top-category-boost-v13-19.json'),
  versionUpgradeKnowledgeV13_20: await readLen('version-upgrade-knowledge-v13-20.json'),
  versionUpgradePlaybooksV13_20: await readLen('version-upgrade-playbooks-v13-20.json'),
  scenarioVersionUpgradeV13_20: await readLen('scenario-version-upgrade-v13-20.json'),
  topBoostV13_20: await readLen('all-top-category-boost-v13-20.json'),
  evaluationV13_20: await readLen('evaluation-rubric-v13-20.json'),
  languageV13_20: await readLen('language-variants-v13-20.json'),
};
const total = Object.values(counts).reduce((a,b)=>a+b,0);
await writeMinimalIndex(total, files);
console.log({ indexedDocs: total, counts, files: files.length, output: 'storage/index/hybrid-vector-lite-index.json', note: 'Fast V13.20 flash status index. UI untouched. Full RAG still reads data/*.json directly.' });

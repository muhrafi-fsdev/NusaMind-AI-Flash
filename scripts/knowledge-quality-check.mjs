import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const dataDir = path.join(root, 'data');
async function read(file, fallback) {
  try { return JSON.parse(await fs.readFile(path.join(dataDir, file), 'utf-8')); }
  catch { return fallback; }
}
function findDuplicateIds(items) {
  const seen = new Set();
  const dup = new Set();
  for (const item of items) {
    const id = item?.id;
    if (!id) continue;
    if (seen.has(id)) dup.add(id);
    seen.add(id);
  }
  return [...dup];
}
function countEmpty(items, field = 'text') {
  return items.filter((item) => {
    const text = String(item?.[field] || item?.content || item?.excerpt || item?.ayahText || item?.indoText || item?.readText || item?.context || item?.translation || item?.details || item?.objective || item?.source_file || item?.source_path || '').trim();
    if (text) return false;
    if (Array.isArray(item?.symptoms) || Array.isArray(item?.diagnosis) || Array.isArray(item?.fixes) || Array.isArray(item?.outputs) || Array.isArray(item?.checklist) || Array.isArray(item?.tags)) return false;
    if (item?.input && (item?.must_include || item?.risk)) return false;
    if (item?.phrase) return false;
    return true;
  }).length;
}
const allFiles = await fs.readdir(dataDir);
const files = allFiles.filter((file) => file.endsWith('.json') && (
  file.includes('knowledge') || file.includes('playbook') || file.includes('summary-upgrade') || file.includes('deep-') || file.includes('scenario-') || file.includes('language-variants') || file.includes('quran-static') || file.includes('quran-full-surah') || file.includes('evaluation-golden-set') || file.includes('rubric') || file.includes('ai-local-blueprint') || file.includes('site-knowledge')
)).sort();
const report = {};
for (const file of files) {
  const raw = await read(file, []);
  const arr = Array.isArray(raw) ? raw : (Array.isArray(raw.samples) ? raw.samples : []);
  if (!Array.isArray(arr)) continue;
  const isLang = file.includes('language-variants');
  const isQuranStatic = file === 'quran-static.json';
  report[file] = {
    total: arr.length,
    duplicateIds: findDuplicateIds(arr).length,
    emptyText: isLang || isQuranStatic ? 0 : countEmpty(arr),
    emptyPhrase: isLang ? arr.filter((item) => !item.phrase).length : 0,
  };
}
console.log(JSON.stringify(report, null, 2));
const hasProblem = Object.values(report).some((x) => x.duplicateIds > 0 || x.emptyText > 0 || x.emptyPhrase > 0);
if (hasProblem) process.exitCode = 1;

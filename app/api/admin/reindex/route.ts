import path from 'node:path';
import { DATA_DIR } from '@/lib/config';
import { buildVectorLiteDoc, saveVectorLiteIndex } from '@/lib/vector-lite';
import { safeJson } from '@/lib/util';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function collectDocs() {
  const [quranChunks, fullSurah, universal, workflow, site, ayah] = await Promise.all([
    safeJson<any[]>(path.join(DATA_DIR, 'knowledge-chunks.json'), []),
    safeJson<any[]>(path.join(DATA_DIR, 'quran-full-surah-v13.json'), []),
    safeJson<any[]>(path.join(DATA_DIR, 'universal-knowledge.json'), []),
    safeJson<any[]>(path.join(DATA_DIR, 'ai-local-blueprint.json'), []),
    safeJson<any[]>(path.join(DATA_DIR, 'site-knowledge.json'), []),
    safeJson<any[]>(path.join(DATA_DIR, 'quran-static.json'), []),
  ]);

  const docs = [
    ...quranChunks.map((item, index) => ({ id: String(item.id || `quran_${index}`), title: String(item.title || item.category || 'Quran Knowledge'), category: String(item.category || 'Quran'), text: String(item.text || item.excerpt || ''), source: String(item.source_label || 'knowledge-chunks.json') })),
    ...fullSurah.map((item, index) => ({ id: String(item.id || `full_surah_${index}`), title: `FULL SURAH ${item.name || item.surahId}`, category: 'Full Quran Surah', text: String(item.text || ''), source: String(item.source || 'quran-full-surah-v13.json') })),
    ...universal.map((item, index) => ({ id: String(item.id || `universal_${index}`), title: String(item.title || 'Universal'), category: String(item.category || 'Universal'), text: String(item.text || ''), source: String(item.source || 'universal-knowledge.json') })),
    ...workflow.map((item, index) => ({ id: String(item.id || `workflow_${index}`), title: String(item.title || 'Workflow'), category: 'Workflow', text: [item.objective, ...(item.checklist || []), ...(item.outputs || [])].join('\n'), source: 'ai-local-blueprint.json' })),
    ...site.map((item, index) => ({ id: String(item.id || `site_${index}`), title: String(item.title || 'Site'), category: String(item.category || 'Site'), text: [item.context, item.translation, item.details].filter(Boolean).join('\n'), source: 'site-knowledge.json' })),
    ...ayah.slice(0, 6236).map((item, index) => ({ id: `ayah_${item.suraId || index}_${item.verseID || index}`, title: `QS ${item.suraId || '?'}:${item.verseID || '?'}`, category: 'Ayat Al-Quran', text: [item.ayahText, item.readText, item.indoText].filter(Boolean).join('\n'), source: 'quran-static.json' })),
  ].filter((doc) => doc.text && doc.text.length > 10);

  return docs.map(buildVectorLiteDoc);
}

export async function POST(req: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (adminToken) {
    const token = req.headers.get('x-admin-token');
    if (token !== adminToken) return Response.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const docs = await collectDocs();
  await saveVectorLiteIndex(docs);
  return Response.json({ ok: true, indexedDocs: docs.length, index: 'storage/index/hybrid-vector-lite-index.json' });
}

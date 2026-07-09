import path from 'node:path';
import { DATA_DIR, appConfig } from '@/lib/config';
import { checkOllama } from '@/lib/model';
import { getMonitoringSummary } from '@/lib/monitoring';
import { getFeedbackSummary } from '@/lib/feedback';
import { loadVectorLiteIndex } from '@/lib/vector-lite';
import { safeJson } from '@/lib/util';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function count(file: string) {
  const data = await safeJson<any[]>(path.join(DATA_DIR, file), []);
  return Array.isArray(data) ? data.length : 0;
}

export async function GET() {
  const [manifest, fineTune, versionProfile, ollama, monitoring, feedback, vectorIndex] = await Promise.all([
    safeJson<any>(path.join(DATA_DIR, 'dataset_training_ai_alquran_manifest.json'), {}),
    safeJson<any>(path.join(DATA_DIR, 'fine-tuning-prep-v12.json'), {}),
    safeJson<any>(path.join(DATA_DIR, 'version-profile-v13-20.json'), {}),
    checkOllama(), getMonitoringSummary(), getFeedbackSummary(), loadVectorLiteIndex(),
  ]);
  const datasets = {
    quranTrainingRecords: manifest.total_records || null,
    quranKnowledgeChunks: await count('knowledge-chunks.json'),
    quranFullSurahV13: await count('quran-full-surah-v13.json'),
    universalKnowledgeItems: await count('universal-knowledge.json'),
    languageVariants: await count('language-variants-id.json'),
    goldenEvaluationCases: await count('evaluation-golden-set.json'),
    fineTunePrepSamples: Array.isArray(fineTune.samples) ? fineTune.samples.length : 0,
    manifestVersion: manifest.version || null,
    quranTopicMapV13_12: await count('quran-topic-map-v13-12.json'),
    cliMaxKnowledgeV13_18: await count('cli-max-knowledge-v13-18.json'),
    cliMaxPlaybooksV13_18: await count('cli-max-playbooks-v13-18.json'),
    deepCliChatV13_18: await count('deep-cli-chat-v13-18.json'),
    scenarioCliAlignmentV13_18: await count('scenario-cli-alignment-v13-18.json'),
    allTopCategoryBoostV13_18: await count('all-top-category-boost-v13-18.json'),
    evaluationRubricCliV13_18: await count('evaluation-rubric-cli-v13-18.json'),
    languageVariantsV13_18: await count('language-variants-v13-18.json'),
    sessionContinuityKnowledgeV13_19: await count('cli-session-continuity-knowledge-v13-19.json'),
    sessionContinuityPlaybooksV13_19: await count('cli-session-continuity-playbooks-v13-19.json'),
    deepSessionContinuityV13_19: await count('deep-session-continuity-v13-19.json'),
    scenarioSessionContinuityV13_19: await count('scenario-session-continuity-v13-19.json'),
    allTopCategoryBoostV13_19: await count('all-top-category-boost-v13-19.json'),
    evaluationRubricSessionContinuityV13_19: await count('evaluation-rubric-session-continuity-v13-19.json'),
    languageVariantsSessionContinuityV13_19: await count('language-variants-session-continuity-v13-19.json'),
    versionUpgradeKnowledgeV13_20: await count('version-upgrade-knowledge-v13-20.json'),
    versionUpgradePlaybooksV13_20: await count('version-upgrade-playbooks-v13-20.json'),
    scenarioVersionUpgradeV13_20: await count('scenario-version-upgrade-v13-20.json'),
    allTopCategoryBoostV13_20: await count('all-top-category-boost-v13-20.json'),
    evaluationRubricV13_20: await count('evaluation-rubric-v13-20.json'),
    languageVariantsV13_20: await count('language-variants-v13-20.json'),
  };
  return Response.json({
    ok: true,
    version: 'V13.20 NusaMind Flash Version + CSV Upgrade + Full Top Category Boost + Clean No UI Touch',
    provider: appConfig.provider,
    defaultMode: appConfig.defaultMode,
    ollama, datasets, monitoring, feedback,
    vectorIndex: { indexedDocs: Array.isArray(vectorIndex) ? vectorIndex.length : 0 },
    sessionContinuity: {
      enabled: true,
      features: ['context carryover', 'active topic tracking', 'short-term memory window', 'auto summary', 'pending task tracker', 'last output reference', 'context pins', 'artifact awareness', 'context-aware RAG', 'CLI slash commands', 'private session mode', 'context health check'],
      commands: ['/help','/session','/summary','/last','/tasks','/pin','/artifacts','/health','/private','/rename'],
      endpoints: ['/api/chat', '/api/chat-json', '/api/sessions', '/api/memory'],
    },
    upload: { enabled: true, endpoints: ['/api/upload/analyze', '/api/upload/status', '/api/sessions'], note: 'V13.8+ tetap aktif untuk file evidence. V13.20 menjaga artifact awareness dan last-output reference untuk CLI.' },
    intelligence: { enabled: true, levels: ['instant', 'ordinary', 'medium', 'high', 'thinking'], sessionPersistence: true, pinSession: true, endpoint: '/api/sessions' },
    quranDatabaseGuard: { enabled: true, topicMap: 'quran-topic-map-v13-12.json', optionalMySql: true, env: ['QURAN_DB_ENABLED','QURAN_DB_NAME','QURAN_DB_TABLE'], fallback: 'quran-static.json' },
    cleanup: { noUiTouch: true, removed: ['runtime cache', 'tsbuildinfo', 'old V13.19 migration/audit docs replaced by V13.20 docs'], note: 'UI web tidak diubah.' },
    versionProfile,
    endpoints: ['/api/chat', '/api/chat-json', '/api/status', '/api/memory', '/api/workflow', '/api/evaluate', '/api/evaluate/run', '/api/monitoring', '/api/feedback', '/api/admin/reindex', '/api/knowledge/status', '/api/quran/exact', '/api/upload/analyze', '/api/upload/status', '/api/sessions'],
  });
}

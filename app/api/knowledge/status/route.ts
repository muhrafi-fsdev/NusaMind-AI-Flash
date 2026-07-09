import path from 'node:path';
import { DATA_DIR } from '@/lib/config';
import { safeJson } from '@/lib/util';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function count(file: string) {
  const data = await safeJson<any[]>(path.join(DATA_DIR, file), []);
  return Array.isArray(data) ? data.length : 0;
}

export async function GET() {
  return Response.json({
    ok: true,
    version: 'V13.10 Intelligence Level Session Pin Full Category Knowledge Status',
    counts: {
      universalKnowledgeItems: await count('universal-knowledge.json'),
      quranKnowledgeChunks: await count('knowledge-chunks.json'),
      quranFullSurahV13: await count('quran-full-surah-v13.json'),
      languageVariants: await count('language-variants-id.json'),
      goldenEvaluationCases: await count('evaluation-golden-set.json'),
      uploadImageDocumentKnowledgeV13_7: await count('upload-image-document-knowledge-v13-7.json'),
      accuracyFileReadingKnowledgeV13_8: await count('accuracy-file-reading-knowledge-v13-8.json'),
      accuracyFileReadingPlaybooksV13_8: await count('accuracy-file-reading-playbooks-v13-8.json'),
      imageSummaryUpgradeV13_8: await count('image-summary-upgrade-v13-8.json'),
      deepAccuracyFileReadingV13_8: await count('deep-accuracy-file-reading-v13-8.json'),
      scenarioFileAccuracyV13_8: await count('scenario-file-accuracy-v13-8.json'),
      accuracyEvaluationRubricV13_8: await count('accuracy-evaluation-rubric-v13-8.json'),
      languageVariantsV13_8: await count('language-variants-v13-8.json'),
      intelligenceLevelKnowledgeV13_9: await count('intelligence-level-knowledge-v13-9.json'),
      intelligenceLevelPlaybooksV13_9: await count('intelligence-level-playbooks-v13-9.json'),
      imageSummaryUpgradeV13_9: await count('image-summary-upgrade-v13-9.json'),
      deepIntelligenceSessionPinV13_9: await count('deep-intelligence-session-pin-v13-9.json'),
      scenarioIntelligenceLevelV13_9: await count('scenario-intelligence-level-v13-9.json'),
      allTopCategoryBoostV13_9: await count('all-top-category-boost-v13-9.json'),
      featureBoostIntelligenceSessionPinV13_9: await count('feature-boost-intelligence-session-pin-v13-9.json'),
      languageVariantsV13_9: await count('language-variants-v13-9.json'),
    mlAgamaPolitikUudMakananPemrogramanKnowledgeV13_10: await count('ml-agama-politik-uud-makanan-pemrograman-knowledge-v13-10.json'),
    mlAgamaPolitikUudMakananPemrogramanPlaybooksV13_10: await count('ml-agama-politik-uud-makanan-pemrograman-playbooks-v13-10.json'),
    deepMlAgamaPolitikUudMakananPemrogramanV13_10: await count('deep-ml-agama-politik-uud-makanan-pemrograman-v13-10.json'),
    scenarioPolicyAnswerAlignmentV13_10: await count('scenario-policy-answer-alignment-v13-10.json'),
    allTopCategoryBoostV13_10: await count('all-top-category-boost-v13-10.json'),
    imageSummaryUpgradeV13_10: await count('image-summary-upgrade-v13-10.json'),
    evaluationRubricMlPolitikUudAgamaV13_10: await count('evaluation-rubric-ml-politik-uud-agama-v13-10.json'),
    languageVariantsV13_10: await count('language-variants-v13-10.json'),
    },
    accuracyFeatures: ['qualitySignals', 'confidenceScore', 'evidenceSnippets', 'accuracyPolicy', 'no hallucination file guardrail'],
    intelligenceFeatures: ['Instant', 'Ordinary', 'Medium', 'High', 'Thinking', 'session autosave', 'restore after refresh', 'pin/unpin session', 'per-message level override'],
    files: [
      'data/list_upgrade_akurasi_baca_gambar_dokumen_nusamind_ai.csv',
      'data/accuracy-file-reading-knowledge-v13-8.json',
      'data/accuracy-file-reading-playbooks-v13-8.json',
      'data/image-summary-upgrade-v13-8.json',
      'data/deep-accuracy-file-reading-v13-8.json',
      'data/scenario-file-accuracy-v13-8.json',
      'data/accuracy-evaluation-rubric-v13-8.json',
      'data/language-variants-v13-8.json',
      'lib/file-analyzer.ts',
      'app/api/upload/analyze/route.ts',
      'app/api/upload/status/route.ts',
      'data/list_upgrade_level_kecerdasan_session_pin_nusamind_ai.csv',
      'data/intelligence-level-knowledge-v13-9.json',
      'data/intelligence-level-playbooks-v13-9.json',
      'data/image-summary-upgrade-v13-9.json',
      'data/deep-intelligence-session-pin-v13-9.json',
      'data/scenario-intelligence-level-v13-9.json',
      'data/all-top-category-boost-v13-9.json',
      'data/feature-boost-intelligence-session-pin-v13-9.json',
      'data/language-variants-v13-9.json',
      'lib/intelligence-level.ts',
      'app/api/sessions/route.ts',
    ],
  });
}

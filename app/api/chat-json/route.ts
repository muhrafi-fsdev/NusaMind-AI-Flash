import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { appConfig } from '@/lib/config';
import { detectIntent } from '@/lib/intent-router';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { searchHybridKnowledge, searchQuranKnowledge, searchUniversalKnowledge, searchWorkflowKnowledge } from '@/lib/knowledge';
import { appendMessage, autoExtractMemory, loadMemory, loadSession, normalizeSessionId, upsertMemory } from '@/lib/memory';
import { appendInteractionLog } from '@/lib/monitoring';
import { getModel } from '@/lib/model';
import { buildStructuredPrompt, buildSystemPrompt } from '@/lib/prompts';
import { cleanAnswer } from '@/lib/safety';
import { buildExactQuranAnswer } from '@/lib/quran-exact';
import { getIntelligenceProfile, normalizeIntelligenceLevel } from '@/lib/intelligence-level';
import { buildRetrievalQuery, buildSessionContextBlock, getRecentMessagesForPrompt, handleSessionCommand, updateSessionAfterAssistant, updateSessionAfterUser } from '@/lib/session-continuity';
import type { AssistantMode, IntelligenceProfile, RetrievalHit } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonUtf8(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

const requestSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
  mode: z.enum(['auto', 'quran', 'universal', 'coding', 'companion', 'workflow']).optional().default('auto'),
  intelligenceLevel: z.string().optional().default(appConfig.defaultIntelligenceLevel),
});

function selectSources(mode: AssistantMode, message: string, profile: IntelligenceProfile) {
  if (mode === 'quran') return searchQuranKnowledge(message, Math.max(3, profile.retrievalTopK));
  if (mode === 'workflow') return searchWorkflowKnowledge(message, Math.max(3, profile.retrievalTopK));
  if (mode === 'coding' || mode === 'universal' || mode === 'companion') return searchUniversalKnowledge(message, profile.retrievalTopK);
  return searchHybridKnowledge(message, Math.max(3, profile.retrievalTopK));
}

function publicSources(sources: RetrievalHit[]) {
  return sources.map((source) => ({
    id: source.id,
    title: source.title,
    category: source.category,
    score: source.score,
    source: source.source,
  }));
}

export async function POST(req: Request) {
  const body = requestSchema.parse(await req.json());
  const sessionId = normalizeSessionId(body.sessionId);
  const intelligenceLevel = normalizeIntelligenceLevel(body.intelligenceLevel);
  const intelligenceProfile = getIntelligenceProfile(intelligenceLevel);
  const rate = checkRateLimit(getRateLimitKey(req, sessionId), 60, 60_000);
  if (!rate.ok) {
    return jsonUtf8({ ok: false, error: 'RATE_LIMITED', message: 'Terlalu banyak request. Tunggu sebentar lalu coba lagi.', resetAt: rate.resetAt }, { status: 429 });
  }

  const intent = detectIntent(body.message, body.mode as AssistantMode);
  const startedAt = Date.now();

  const command = await handleSessionCommand(sessionId, body.message);
  if (command.handled) {
    await appendMessage(sessionId, { role: 'user', content: body.message, mode: body.mode, intelligenceLevel, intent, sources: [] });
    await appendMessage(sessionId, { role: 'assistant', content: command.answer, mode: body.mode, intelligenceLevel, intent, sources: [] });
    await updateSessionAfterAssistant(sessionId, command.answer, []);
    await appendInteractionLog({ sessionId, route: '/api/chat-json', mode: 'workflow', messageLength: body.message.length, sources: 0, finishReason: 'session_command', steps: 0, latencyMs: Date.now() - startedAt });
    return jsonUtf8({ ok: true, sessionId, answer: command.answer, mode: 'workflow', intelligenceLevel, confidence: 1, reasons: ['V13.20 session command handled locally'], safety: 'normal', sources: [], usage: null, finishReason: 'session_command', steps: 0 });
  }

  const preSession = await loadSession(sessionId);
  const retrievalQuery = buildRetrievalQuery(body.message, preSession);
  const exactQuran = await buildExactQuranAnswer(body.message);
  const sources = exactQuran?.sources || await selectSources(intent.mode, retrievalQuery, intelligenceProfile);

  await autoExtractMemory(sessionId, body.message);
  await appendMessage(sessionId, { role: 'user', content: body.message, mode: body.mode, intelligenceLevel, intent, sources });
  const continuitySession = await updateSessionAfterUser(sessionId, body.message);
  const memory = await loadMemory(sessionId);

  if (exactQuran) {
    const answer = exactQuran.answer;
    await appendMessage(sessionId, { role: 'assistant', content: answer, mode: body.mode, intelligenceLevel, intent, sources });
    await updateSessionAfterAssistant(sessionId, answer, sources);
    await upsertMemory(sessionId, 'last_exact_quran_answer', `Guard=${exactQuran.guardType}; TopicOrSurah=${exactQuran.surahName}; QS=${exactQuran.surahId}; Source=${exactQuran.dataSource}`, 2);
    await appendInteractionLog({
      sessionId,
      route: '/api/chat-json',
      mode: `quran-${exactQuran.guardType}`,
      messageLength: body.message.length,
      sources: sources.length,
      finishReason: `exact_quran_${exactQuran.guardType}_guard`,
      steps: 0,
      latencyMs: Date.now() - startedAt,
    });
    return jsonUtf8({
      ok: true,
      sessionId,
      answer,
      mode: 'quran',
      intelligenceLevel,
      intelligenceProfile: { name: intelligenceProfile.name, retrievalTopK: intelligenceProfile.retrievalTopK, reasoningDepth: intelligenceProfile.reasoningDepth },
      confidence: 1,
      reasons: [`Exact Quran Database Guard aktif: ${exactQuran.guardType}; sumber=${exactQuran.dataSource}.`],
      safety: 'religious_guarded',
      sources: publicSources(sources),
      usage: null,
      finishReason: `exact_quran_${exactQuran.guardType}_guard`,
      steps: 0,
      sessionContext: { activeTopic: continuitySession.activeTopic, hasLastOutput: Boolean(continuitySession.lastOutput), messageCount: continuitySession.messages.length },
    });
  }

  const session = await loadSession(sessionId);
  const recentMessages = getRecentMessagesForPrompt(session, intelligenceProfile);
  const sessionContextBlock = buildSessionContextBlock(session, memory);

  const result = await generateText({
    model: getModel(intent),
    system: buildSystemPrompt(intent, sources, memory, intelligenceProfile, sessionContextBlock),
    messages: [
      ...recentMessages,
      { role: 'user', content: buildStructuredPrompt(body.message, intelligenceProfile) },
    ],
    tools: appConfig.toolsEnabled ? {
      searchQuranKnowledge: tool({
        description: 'Cari konteks lokal Al-Qur\'an dan tema Islam.',
        inputSchema: z.object({ query: z.string() }),
        execute: async ({ query }: { query: string }) => searchQuranKnowledge(query, 3),
      }),
      searchUniversalKnowledge: tool({
        description: 'Cari konteks universal lokal untuk coding, laptop, jaringan, umum, dan session continuity.',
        inputSchema: z.object({ query: z.string() }),
        execute: async ({ query }: { query: string }) => searchUniversalKnowledge(buildRetrievalQuery(query, session), 3),
      }),
      searchWorkflowKnowledge: tool({
        description: 'Cari blueprint workflow pengembangan AI lokal, CLI, memory, dan session continuity.',
        inputSchema: z.object({ query: z.string() }),
        execute: async ({ query }: { query: string }) => searchWorkflowKnowledge(buildRetrievalQuery(query, session), 3),
      }),
    } : undefined,
    stopWhen: stepCountIs(appConfig.maxSteps),
    temperature: intelligenceProfile.temperature ?? appConfig.temperature,
    maxOutputTokens: Math.min(2200, Math.max(appConfig.maxOutputTokens, intelligenceProfile.maxOutputTokens)),
    providerOptions: appConfig.provider === 'ollama' ? { ollama: { num_ctx: 4096 } } : undefined,
  });

  const answer = cleanAnswer(result.text || '');
  await appendMessage(sessionId, { role: 'assistant', content: answer, mode: body.mode, intelligenceLevel, intent, sources });
  const updatedSession = await updateSessionAfterAssistant(sessionId, answer, sources);
  await upsertMemory(sessionId, 'last_json_interaction', `Mode=${intent.mode}; finish=${result.finishReason}; steps=${result.steps?.length || 0}; activeTopic=${updatedSession.activeTopic || '-'}`, 1);
  await appendInteractionLog({
    sessionId,
    route: '/api/chat-json',
    mode: intent.mode,
    messageLength: body.message.length,
    sources: sources.length,
    finishReason: result.finishReason,
    steps: result.steps?.length || 0,
    latencyMs: Date.now() - startedAt,
  });

  return jsonUtf8({
    ok: true,
    sessionId,
    answer,
    mode: intent.mode,
    intelligenceLevel,
    intelligenceProfile: { name: intelligenceProfile.name, retrievalTopK: intelligenceProfile.retrievalTopK, reasoningDepth: intelligenceProfile.reasoningDepth },
    confidence: intent.confidence,
    reasons: intent.reasons,
    safety: intent.safety,
    sources: publicSources(sources),
    usage: result.usage,
    finishReason: result.finishReason,
    steps: result.steps?.length || 0,
    sessionContext: { activeTopic: updatedSession.activeTopic, messageCount: updatedSession.messages.length, hasLastOutput: Boolean(updatedSession.lastOutput), tasks: (updatedSession.pendingTasks || []).length, artifacts: (updatedSession.artifacts || []).length },
  });
}

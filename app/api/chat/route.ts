import { streamText, tool, stepCountIs } from 'ai';
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
import type { AssistantMode, IntelligenceProfile } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
  mode: z.enum(['auto', 'quran', 'universal', 'coding', 'companion', 'workflow']).optional().default('auto'),
  intelligenceLevel: z.string().optional().default(appConfig.defaultIntelligenceLevel),
});

function textResponse(text: string, headers?: Record<string, string>) {
  const response = new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8', ...(headers || {}) } });
  return response;
}

function selectSources(mode: AssistantMode, message: string, profile: IntelligenceProfile) {
  if (mode === 'quran') return searchQuranKnowledge(message, Math.max(3, profile.retrievalTopK));
  if (mode === 'workflow') return searchWorkflowKnowledge(message, Math.max(3, profile.retrievalTopK));
  if (mode === 'coding' || mode === 'universal' || mode === 'companion') return searchUniversalKnowledge(message, profile.retrievalTopK);
  return searchHybridKnowledge(message, Math.max(3, profile.retrievalTopK));
}

export async function POST(req: Request) {
  const body = requestSchema.parse(await req.json());
  const sessionId = normalizeSessionId(body.sessionId);
  const intelligenceLevel = normalizeIntelligenceLevel(body.intelligenceLevel);
  const intelligenceProfile = getIntelligenceProfile(intelligenceLevel);
  const rate = checkRateLimit(getRateLimitKey(req, sessionId), 60, 60_000);
  if (!rate.ok) {
    return Response.json({ ok: false, error: 'RATE_LIMITED', message: 'Terlalu banyak request. Tunggu sebentar lalu coba lagi.', resetAt: rate.resetAt }, { status: 429 });
  }

  const intent = detectIntent(body.message, body.mode as AssistantMode);
  const startedAt = Date.now();

  const command = await handleSessionCommand(sessionId, body.message);
  if (command.handled) {
    await appendMessage(sessionId, { role: 'user', content: body.message, mode: body.mode, intelligenceLevel, intent, sources: [] });
    await appendMessage(sessionId, { role: 'assistant', content: command.answer, mode: body.mode, intelligenceLevel, intent, sources: [] });
    await updateSessionAfterAssistant(sessionId, command.answer, []);
    await appendInteractionLog({ sessionId, route: '/api/chat', mode: 'workflow', messageLength: body.message.length, sources: 0, finishReason: 'session_command', steps: 0, latencyMs: Date.now() - startedAt });
    return textResponse(command.answer, { 'x-quran-ai-session-id': sessionId, 'x-quran-ai-mode': 'workflow', 'x-nusamind-intelligence-level': intelligenceLevel, 'x-nusamind-session-command': 'true' });
  }

  const preSession = await loadSession(sessionId);
  const retrievalQuery = buildRetrievalQuery(body.message, preSession);
  const exactQuran = await buildExactQuranAnswer(body.message);
  const sources = exactQuran?.sources || await selectSources(intent.mode, retrievalQuery, intelligenceProfile);

  await autoExtractMemory(sessionId, body.message);
  await appendMessage(sessionId, {
    role: 'user',
    content: body.message,
    mode: body.mode,
    intelligenceLevel,
    intent,
    sources,
  });
  await updateSessionAfterUser(sessionId, body.message);
  const memory = await loadMemory(sessionId);

  if (exactQuran) {
    const answer = exactQuran.answer;
    await appendMessage(sessionId, {
      role: 'assistant',
      content: answer,
      mode: body.mode,
      intelligenceLevel,
      intent,
      sources,
    });
    await updateSessionAfterAssistant(sessionId, answer, sources);
    await upsertMemory(sessionId, 'last_exact_quran_answer', `Guard=${exactQuran.guardType}; TopicOrSurah=${exactQuran.surahName}; QS=${exactQuran.surahId}; Source=${exactQuran.dataSource}`, 2);
    await appendInteractionLog({
      sessionId,
      route: '/api/chat',
      mode: `quran-${exactQuran.guardType}`,
      messageLength: body.message.length,
      sources: sources.length,
      finishReason: `exact_quran_${exactQuran.guardType}_guard`,
      steps: 0,
      latencyMs: Date.now() - startedAt,
    });
    return textResponse(answer, { 'x-quran-ai-session-id': sessionId, 'x-quran-ai-mode': 'quran', 'x-quran-ai-confidence': '1', 'x-nusamind-intelligence-level': intelligenceLevel });
  }

  const session = await loadSession(sessionId);
  const recentMessages = getRecentMessagesForPrompt(session, intelligenceProfile);
  const sessionContextBlock = buildSessionContextBlock(session, memory);

  const tools = {
    searchQuranKnowledge: tool({
      description: 'Cari konteks lokal Al-Qur\'an, ayat, doa, dzikir, tafsir ringan, dan pengetahuan Islam dari dataset project.',
      inputSchema: z.object({ query: z.string() }),
      execute: async ({ query }: { query: string }) => searchQuranKnowledge(query, 3),
    }),
    searchUniversalKnowledge: tool({
      description: 'Cari konteks universal lokal untuk coding, debugging, jaringan, laptop, Windows, tugas kuliah, percakapan umum, dan session continuity.',
      inputSchema: z.object({ query: z.string() }),
      execute: async ({ query }: { query: string }) => searchUniversalKnowledge(buildRetrievalQuery(query, session), 3),
    }),
    searchWorkflowKnowledge: tool({
      description: 'Cari blueprint pengembangan AI lokal: workflow, arsitektur, monitoring, deployment, evaluasi, CLI, dan session continuity.',
      inputSchema: z.object({ query: z.string() }),
      execute: async ({ query }: { query: string }) => searchWorkflowKnowledge(buildRetrievalQuery(query, session), 3),
    }),
    rememberUserPreference: tool({
      description: 'Simpan preferensi atau konteks penting user untuk sesi berikutnya kecuali private mode ON.',
      inputSchema: z.object({ key: z.string(), value: z.string(), importance: z.number().min(1).max(5).default(1) }),
      execute: async ({ key, value, importance }: { key: string; value: string; importance: number }) => {
        if (session.privateMode) return { ok: false, reason: 'private_mode_on' };
        await upsertMemory(sessionId, key, value, importance);
        return { ok: true, key, value, importance };
      },
    }),
  };

  const result = streamText({
    model: getModel(intent),
    system: buildSystemPrompt(intent, sources, memory, intelligenceProfile, sessionContextBlock),
    messages: [
      ...recentMessages,
      { role: 'user', content: buildStructuredPrompt(body.message, intelligenceProfile) },
    ],
    tools: appConfig.toolsEnabled ? tools : undefined,
    stopWhen: stepCountIs(appConfig.maxSteps),
    temperature: intelligenceProfile.temperature ?? appConfig.temperature,
    maxOutputTokens: Math.min(2200, Math.max(appConfig.maxOutputTokens, intelligenceProfile.maxOutputTokens)),
    providerOptions: appConfig.provider === 'ollama' ? { ollama: { num_ctx: 4096 } } : undefined,
    onFinish: async ({ text, response, usage, finishReason, steps }: { text?: string; response?: { messages?: unknown[] }; usage?: unknown; finishReason?: string; steps?: unknown[] }) => {
      const answer = cleanAnswer(text || '');
      await appendMessage(sessionId, {
        role: 'assistant',
        content: answer,
        mode: body.mode,
        intelligenceLevel,
        intent,
        sources,
      });
      const updatedSession = await updateSessionAfterAssistant(sessionId, answer, sources);
      await upsertMemory(
        sessionId,
        'last_interaction_summary',
        `Mode=${intent.mode}; finish=${finishReason}; usage=${JSON.stringify(usage || {})}; steps=${steps?.length || 0}; responseMessages=${response?.messages?.length || 0}; activeTopic=${updatedSession.activeTopic || '-'}`,
        1,
      );
      await appendInteractionLog({
        sessionId,
        route: '/api/chat',
        mode: intent.mode,
        messageLength: body.message.length,
        sources: sources.length,
        finishReason,
        steps: steps?.length || 0,
        latencyMs: Date.now() - startedAt,
      });
    },
  });

  const response = result.toTextStreamResponse();
  response.headers.set('x-quran-ai-session-id', sessionId);
  response.headers.set('x-quran-ai-mode', intent.mode);
  response.headers.set('x-quran-ai-confidence', String(intent.confidence));
  response.headers.set('x-nusamind-intelligence-level', intelligenceLevel);
  response.headers.set('x-nusamind-session-continuity', 'v13.20');
  return response;
}

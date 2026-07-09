import fs from 'node:fs/promises';
import path from 'node:path';
import { MEMORY_DIR, SESSION_DIR } from './config';
import type { ChatMessage, IntelligenceLevel, MemoryRecord, SessionState } from './types';
import { createId, nowIso, normalizeText, safeJson } from './util';

async function ensureDirs() {
  await fs.mkdir(SESSION_DIR, { recursive: true });
  await fs.mkdir(MEMORY_DIR, { recursive: true });
}

function safeName(input: string): string {
  return normalizeText(input || createId('session')).replace(/[^a-z0-9._-]/g, '_').slice(0, 96) || createId('session');
}

export function normalizeSessionId(input?: string | null): string {
  if (!input) return createId('session');
  return safeName(input);
}

function sessionPath(sessionId: string): string {
  return path.join(SESSION_DIR, `${safeName(sessionId)}.json`);
}

function memoryPath(sessionId: string): string {
  return path.join(MEMORY_DIR, `${safeName(sessionId)}.json`);
}

export async function loadSession(sessionId: string): Promise<SessionState> {
  await ensureDirs();
  const fallback: SessionState = {
    sessionId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    messages: [],
    defaultIntelligenceLevel: 'medium',
    pinned: false,
  };
  return safeJson<SessionState>(sessionPath(sessionId), fallback);
}

export async function saveSession(session: SessionState): Promise<void> {
  await ensureDirs();
  session.updatedAt = nowIso();
  session.messages = session.messages.slice(-160);
  await fs.writeFile(sessionPath(session.sessionId), JSON.stringify(session, null, 2), 'utf-8');
}

export async function appendMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<SessionState> {
  const session = await loadSession(sessionId);
  session.messages.push({
    id: message.id || createId(message.role),
    createdAt: message.createdAt || nowIso(),
    role: message.role,
    content: message.content,
    mode: message.mode,
    intent: message.intent,
    sources: message.sources,
    intelligenceLevel: message.intelligenceLevel,
  });
  await saveSession(session);
  return session;
}

export async function loadMemory(sessionId: string): Promise<MemoryRecord[]> {
  await ensureDirs();
  return safeJson<MemoryRecord[]>(memoryPath(sessionId), []);
}

export async function saveMemory(sessionId: string, memory: MemoryRecord[]): Promise<void> {
  await ensureDirs();
  const sorted = memory.sort((a, b) => b.importance - a.importance).slice(0, 40);
  await fs.writeFile(memoryPath(sessionId), JSON.stringify(sorted, null, 2), 'utf-8');
}

export async function upsertMemory(sessionId: string, key: string, value: string, importance = 1): Promise<void> {
  const memory = await loadMemory(sessionId);
  const existing = memory.find((item) => item.key === key);
  if (existing) {
    existing.value = value;
    existing.importance = Math.max(existing.importance, importance);
    existing.updatedAt = nowIso();
  } else {
    memory.push({ key, value, importance, updatedAt: nowIso() });
  }
  await saveMemory(sessionId, memory);
}

export async function autoExtractMemory(sessionId: string, userMessage: string): Promise<void> {
  const text = normalizeText(userMessage);
  const hints: Array<[RegExp, string, string, number]> = [
    [/jawab\s+(singkat|pendek|ringkas)/, 'preferred_answer_length', 'User suka jawaban ringkas jika diminta.', 2],
    [/jawab\s+(detail|panjang|lengkap)/, 'preferred_answer_detail', 'User suka jawaban detail jika topiknya kompleks.', 2],
    [/aku\s+(introvert|pemalu)/, 'user_social_style', 'User menyebut dirinya introvert/pemalu.', 3],
    [/saya\s+pakai\s+(laragon|windows|ollama|next\.js|node\.js)/, 'user_dev_stack', `Stack yang disebut user: ${userMessage}`, 3],
    [/laptop\s+saya|monitor\s+saya|windows\s+saya/, 'user_device_context', `Konteks device user: ${userMessage}`, 2],
  ];
  for (const [regex, key, value, importance] of hints) {
    if (regex.test(text)) await upsertMemory(sessionId, key, value, importance);
  }
}

export function formatMemoryForPrompt(memory: MemoryRecord[]): string {
  if (!memory.length) return 'Belum ada memori penting.';
  return memory
    .slice(0, 12)
    .map((item) => `- ${item.key}: ${item.value}`)
    .join('\n');
}


export async function listSessions(): Promise<Array<Pick<SessionState, 'sessionId' | 'createdAt' | 'updatedAt' | 'title' | 'pinned' | 'pinnedAt' | 'pinnedNote' | 'defaultIntelligenceLevel'> & { messageCount: number; preview: string }>> {
  await ensureDirs();
  const files = await fs.readdir(SESSION_DIR).catch(() => []);
  const sessions: Array<Pick<SessionState, 'sessionId' | 'createdAt' | 'updatedAt' | 'title' | 'pinned' | 'pinnedAt' | 'pinnedNote' | 'defaultIntelligenceLevel'> & { messageCount: number; preview: string }> = [];
  for (const file of files.filter((name) => name.endsWith('.json'))) {
    const state = await safeJson<SessionState>(path.join(SESSION_DIR, file), {
      sessionId: file.replace(/\.json$/, ''), createdAt: nowIso(), updatedAt: nowIso(), messages: [], defaultIntelligenceLevel: 'medium', pinned: false,
    });
    const firstUser = state.messages.find((message) => message.role === 'user')?.content || '';
    sessions.push({
      sessionId: state.sessionId,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
      title: state.title || firstUser.slice(0, 52) || state.sessionId,
      pinned: Boolean(state.pinned),
      pinnedAt: state.pinnedAt,
      pinnedNote: state.pinnedNote,
      defaultIntelligenceLevel: state.defaultIntelligenceLevel || 'medium',
      messageCount: state.messages.length,
      preview: firstUser.slice(0, 120),
    });
  }
  return sessions.sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export async function updateSessionMeta(sessionId: string, patch: { title?: string; pinned?: boolean; pinnedNote?: string; defaultIntelligenceLevel?: IntelligenceLevel }): Promise<SessionState> {
  const session = await loadSession(sessionId);
  if (typeof patch.title === 'string') session.title = patch.title.slice(0, 80);
  if (typeof patch.pinned === 'boolean') {
    session.pinned = patch.pinned;
    session.pinnedAt = patch.pinned ? nowIso() : undefined;
  }
  if (typeof patch.pinnedNote === 'string') session.pinnedNote = patch.pinnedNote.slice(0, 240);
  if (patch.defaultIntelligenceLevel) session.defaultIntelligenceLevel = patch.defaultIntelligenceLevel;
  await saveSession(session);
  return session;
}

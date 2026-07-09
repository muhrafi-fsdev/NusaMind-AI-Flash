import fs from 'node:fs/promises';
import path from 'node:path';
import { LOG_DIR, MEMORY_DIR, SESSION_DIR } from './config';
import { nowIso, safeJson } from './util';
import type { MonitoringSummary } from './types';

async function ensureLogDir() {
  await fs.mkdir(LOG_DIR, { recursive: true });
}

function dailyLogPath() {
  return path.join(LOG_DIR, `${nowIso().slice(0, 10)}.json`);
}

export async function appendInteractionLog(payload: Record<string, unknown>): Promise<void> {
  await ensureLogDir();
  const logPath = dailyLogPath();
  const current = await safeJson<any[]>(logPath, []);
  current.push({ at: nowIso(), ...payload });
  await fs.writeFile(logPath, JSON.stringify(current.slice(-500), null, 2), 'utf-8');
}

export async function getMonitoringSummary(): Promise<MonitoringSummary> {
  await ensureLogDir();
  const [sessionFiles, memoryFiles, logFiles] = await Promise.all([
    fs.readdir(SESSION_DIR).catch(() => []),
    fs.readdir(MEMORY_DIR).catch(() => []),
    fs.readdir(LOG_DIR).catch(() => []),
  ]);

  let totalInteractionLogs = 0;
  let latestInteractionAt: string | undefined;

  for (const file of logFiles) {
    const entries = await safeJson<any[]>(path.join(LOG_DIR, file), []);
    totalInteractionLogs += entries.length;
    const last = entries.at(-1);
    if (last?.at && (!latestInteractionAt || last.at > latestInteractionAt)) latestInteractionAt = last.at;
  }

  return {
    totalSessions: sessionFiles.filter((file: string) => file.endsWith('.json')).length,
    totalMemoryFiles: memoryFiles.filter((file: string) => file.endsWith('.json')).length,
    totalInteractionLogs,
    latestSessionId: sessionFiles.filter((file: string) => file.endsWith('.json')).sort().at(-1)?.replace(/\.json$/, ''),
    latestInteractionAt,
  };
}

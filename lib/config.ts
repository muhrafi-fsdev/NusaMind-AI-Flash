import path from 'node:path';

export const ROOT_DIR = process.cwd();
export const DATA_DIR = path.join(ROOT_DIR, 'data');
export const STORAGE_DIR = path.join(ROOT_DIR, 'storage');
export const SESSION_DIR = path.join(STORAGE_DIR, 'sessions');
export const MEMORY_DIR = path.join(STORAGE_DIR, 'memory');
export const LOG_DIR = path.join(STORAGE_DIR, 'logs');

export const appConfig = {
  version: 'V13.20',
  edition: process.env.NUSAMIND_EDITION || 'flash',
  editionName: process.env.NUSAMIND_EDITION_NAME || 'NusaMind Flash Version',
  editionDescription: process.env.NUSAMIND_EDITION_DESCRIPTION || 'FAST Response, ringan, cocok riset awal, minim pemahaman.',
  defaultIntelligenceLevel: process.env.AI_DEFAULT_INTELLIGENCE_LEVEL || process.env.AI_DEFAULT_INTELLIGENCE || 'instant',
  provider: process.env.AI_PROVIDER || 'ollama',
  defaultMode: process.env.AI_DEFAULT_MODE || 'auto',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api',
  ollamaModel: process.env.OLLAMA_MODEL || 'qwen2.5:7b',
  ollamaCoderModel: process.env.OLLAMA_CODER_MODEL || 'qwen2.5-coder:7b',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
  maxSteps: Number(process.env.AI_MAX_STEPS || 3),
  temperature: Number(process.env.AI_TEMPERATURE || 0.25),
  maxOutputTokens: Number(process.env.AI_MAX_OUTPUT_TOKENS || 800),
  memoryEnabled: (process.env.AI_MEMORY_ENABLED || 'true') !== 'false',
  toolsEnabled: (process.env.AI_ENABLE_TOOLS || 'true') !== 'false',
  streamingEnabled: (process.env.AI_ENABLE_STREAMING || 'true') !== 'false',
};

'use client';

import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

type Mode = 'auto' | 'quran' | 'universal' | 'coding' | 'companion' | 'workflow';
type IntelligenceLevel = 'instant' | 'ordinary' | 'medium' | 'high' | 'thinking';
type SavedSessionSummary = { sessionId: string; title: string; pinned: boolean; updatedAt: string; messages: Message[]; mode: Mode; intelligenceLevel: IntelligenceLevel };
type Message = { role: 'user' | 'assistant'; content: string; meta?: string };
type FileAnalysisResponse = { ok: boolean; analysis?: { fileName: string; extension: string; kind: string; parser: string; summary: string; warnings: string[]; preview: string; recommendedMode?: Mode }; promptContext?: string; error?: string };

type Status = {
  version?: string;
  provider?: string;
  ollama?: { ok: boolean; message: string; models?: string[] };
  datasets?: { quranTrainingRecords?: number; quranKnowledgeChunks?: number; universalKnowledgeItems?: number; workflowStages?: number };
  monitoring?: { totalSessions?: number; totalMemoryFiles?: number; totalInteractionLogs?: number };
  feedback?: { totalFeedback?: number; averageRating?: number | null };
  vectorIndex?: { indexedDocs?: number };
};

type WorkflowStep = {
  id: string;
  title: string;
  objective: string;
  checklist: string[];
  outputs: string[];
  metrics: string[];
  tools: string[];
};

const quickPrompts = [
  'Tampilkan Surah Al-Fatihah lengkap dengan latin dan terjemah',
  'Kenapa laptop saya panas saat gaming?',
  'Buatkan contoh API login Next.js',
  'Aku lagi bingung, temenin ngobrol dong',
  'Upgrade AI saya ikutin alur: masalah → platform → workflow → MVP → deploy → monitoring',
];

function readSavedSessions(): SavedSessionSummary[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('nusamind_saved_sessions_v13_9') || '[]'); }
  catch { return []; }
}

function writeSavedSessions(sessions: SavedSessionSummary[]) {
  if (typeof window === 'undefined') return;
  const sorted = sessions.sort((a, b) => Number(b.pinned) - Number(a.pinned) || String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0, 40);
  localStorage.setItem('nusamind_saved_sessions_v13_9', JSON.stringify(sorted));
}

function getStoredSessionId() {
  if (typeof window === 'undefined') return '';
  const current = localStorage.getItem('quran_next_ai_session');
  if (current) return current;
  const created = `session_${crypto.randomUUID()}`;
  localStorage.setItem('quran_next_ai_session', created);
  return created;
}

export function ChatShell() {
  const [sessionId, setSessionId] = useState('');
  const [mode, setMode] = useState<Mode>('auto');
  const [intelligenceLevel, setIntelligenceLevel] = useState<IntelligenceLevel>('medium');
  const [savedSessions, setSavedSessions] = useState<SavedSessionSummary[]>([]);
  const [pinnedCurrent, setPinnedCurrent] = useState(false);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileNotice, setFileNotice] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Assalamualaikum, aku NusaMind AI V13.9. Sekarang aku punya alur upgrade yang jauh lebih jelas: planning, data, RAG, model lokal, pipeline jawaban, backend integration, evaluasi, lalu monitoring & improvement.',
      meta: 'ready',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sid = getStoredSessionId();
    setSessionId(sid);
    const sessions = readSavedSessions();
    setSavedSessions(sessions);
    const restored = sessions.find((s) => s.sessionId === sid);
    if (restored?.messages?.length) {
      setMessages(restored.messages);
      setMode(restored.mode || 'auto');
      setIntelligenceLevel(restored.intelligenceLevel || 'medium');
      setPinnedCurrent(Boolean(restored.pinned));
      setFileNotice('Session terakhir berhasil dipulihkan setelah refresh.');
    }
    fetch('/api/status').then((res) => res.json()).then(setStatus).catch(() => setStatus(null));
    fetch('/api/workflow').then((res) => res.json()).then((json) => setWorkflow(json.steps || [])).catch(() => setWorkflow([]));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!sessionId || typeof window === 'undefined') return;
    const sessions = readSavedSessions();
    const firstUser = messages.find((m) => m.role === 'user')?.content || 'Session NusaMind AI';
    const item: SavedSessionSummary = { sessionId, title: firstUser.slice(0, 56), pinned: pinnedCurrent, updatedAt: new Date().toISOString(), messages, mode, intelligenceLevel };
    const next = [item, ...sessions.filter((s) => s.sessionId !== sessionId)];
    writeSavedSessions(next);
    setSavedSessions(next.sort((a, b) => Number(b.pinned) - Number(a.pinned) || String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0, 40));
  }, [messages, mode, intelligenceLevel, sessionId, pinnedCurrent]);

  const statusText = useMemo(() => {
    if (!status) return 'Mengecek status AI...';
    const ollama = status.ollama?.ok ? 'Ollama aktif' : `Ollama belum aktif: ${status.ollama?.message || '-'}`;
    return `${status.version || 'V13.9'} • ${ollama} • Quran index ${status.datasets?.quranKnowledgeChunks ?? 0} • Universal ${status.datasets?.universalKnowledgeItems ?? 0} • Workflow ${status.datasets?.workflowStages ?? 0}`;
  }, [status]);


  async function analyzeSelectedFile(question: string) {
    if (!selectedFile) return { message: question, meta: mode };
    setUploadingFile(true);
    setFileNotice(`Menganalisis file ${selectedFile.name}...`);
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      form.append('question', question || 'Jelaskan dan analisis file ini.');
      const json: FileAnalysisResponse = await fetch('/api/upload/analyze', { method: 'POST', body: form }).then((res) => res.json());
      if (!json.ok || !json.promptContext || !json.analysis) {
        throw new Error(json.error || 'File gagal dianalisis.');
      }
      const warn = json.analysis.warnings?.length ? ` Peringatan: ${json.analysis.warnings.join(' ')}` : '';
      setFileNotice(`${json.analysis.fileName} • ${json.analysis.kind} • ${json.analysis.parser}.${warn}`);
      return { message: json.promptContext, meta: `file:${json.analysis.extension || json.analysis.kind}` };
    } catch (error) {
      const text = error instanceof Error ? error.message : 'File gagal dianalisis.';
      setFileNotice(text);
      return { message: `${question}\n\n[Catatan file upload: ${text}]`, meta: 'file-error' };
    } finally {
      setUploadingFile(false);
    }
  }

  async function sendMessage(event?: FormEvent, override?: string) {
    event?.preventDefault();
    const rawMessage = (override || input).trim();
    if ((!rawMessage && !selectedFile) || loading || uploadingFile) return;
    const displayMessage = rawMessage || `Analisis file: ${selectedFile?.name}`;
    const analyzed = await analyzeSelectedFile(displayMessage);
    const message = analyzed.message.trim();

    setInput('');
    setSelectedFile(null);
    setLoading(true);
    setMessages((prev: Message[]) => [...prev, { role: 'user', content: displayMessage, meta: analyzed.meta }, { role: 'assistant', content: '', meta: 'streaming' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId, mode, intelligenceLevel }),
      });

      const returnedSession = res.headers.get('x-quran-ai-session-id');
      const returnedMode = res.headers.get('x-quran-ai-mode');
      if (returnedSession) {
        setSessionId(returnedSession);
        localStorage.setItem('quran_next_ai_session', returnedSession);
      }

      if (!res.ok || !res.body) {
        const json = await fetch('/api/chat-json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, sessionId, mode, intelligenceLevel }),
        }).then((r) => r.json());
        setMessages((prev: Message[]) => prev.map((item: Message, idx: number) => idx === prev.length - 1 ? { role: 'assistant', content: json.answer || 'AI gagal menjawab.', meta: json.mode } : item));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages((prev: Message[]) => prev.map((item: Message, idx: number) => idx === prev.length - 1 ? { role: 'assistant', content: answer, meta: returnedMode || mode } : item));
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Terjadi error tidak dikenal.';
      setMessages((prev: Message[]) => prev.map((item: Message, idx: number) => idx === prev.length - 1 ? { role: 'assistant', content: `AI error: ${text}\n\nCek apakah Ollama sudah menyala, dependency sudah terpasang, dan model sudah di-pull.`, meta: 'error' } : item));
    } finally {
      setLoading(false);
      fetch('/api/status').then((res) => res.json()).then(setStatus).catch(() => undefined);
    }
  }

  function resetSession() {
    const created = `session_${crypto.randomUUID()}`;
    localStorage.setItem('quran_next_ai_session', created);
    setSessionId(created);
    setPinnedCurrent(false);
    setMessages([{ role: 'assistant', content: 'Session baru dibuat. Memori chat sebelumnya tidak dipakai di percakapan ini.', meta: 'reset' }]);
  }

  function togglePinCurrent() {
    const next = !pinnedCurrent;
    setPinnedCurrent(next);
    fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, pinned: next, defaultIntelligenceLevel: intelligenceLevel }) }).catch(() => undefined);
  }

  function restoreLocalSession(item: SavedSessionSummary) {
    localStorage.setItem('quran_next_ai_session', item.sessionId);
    setSessionId(item.sessionId);
    setMessages(item.messages?.length ? item.messages : [{ role: 'assistant', content: `Session ${item.title} dipulihkan.`, meta: 'restore' }]);
    setMode(item.mode || 'auto');
    setIntelligenceLevel(item.intelligenceLevel || 'medium');
    setPinnedCurrent(Boolean(item.pinned));
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Next.js + Vercel AI SDK + Ollama Offline</p>
          <div className="brand-row"><img src="/nusamind-logo.png" alt="NusaMind AI logo" /><h1>NusaMind AI V13.9</h1></div>
          <p className="subtitle">Universal local intelligence dengan Quran Exact Guard, RAG, memory, coding/debug mode, workflow AI, upload file, level kecerdasan, session persistence, pinned session, evaluasi, dan monitoring. Fokusnya jawaban sesuai pertanyaan user, tidak ngawur, dan tetap aman untuk topik agama.</p>
        </div>
        <div className="status-card">
          <span>Status</span>
          <p>{statusText}</p>
          <div className="mini-stats">
            <div><strong>{status?.monitoring?.totalSessions ?? 0}</strong><small>Session</small></div>
            <div><strong>{status?.monitoring?.totalInteractionLogs ?? 0}</strong><small>Logs</small></div>
            <div><strong>{status?.vectorIndex?.indexedDocs ?? 0}</strong><small>Index</small></div>
          </div>
        </div>
      </section>

      <section className="workflow-board">
        <div className="board-head">
          <h2>Alur & Skematik Pengembangan AI Lokal</h2>
          <p>Struktur upgrade sekarang mengikuti blueprint yang rapi, jadi arah pengembangannya tidak lagi nanggung.</p>
        </div>
        <div className="workflow-grid">
          {workflow.map((step: WorkflowStep) => (
            <article key={step.id} className="workflow-card">
              <span className="workflow-chip">{step.id.replace('step_', 'Tahap ')}</span>
              <h3>{step.title}</h3>
              <p>{step.objective}</p>
              <ul>
                {step.checklist.slice(0, 3).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="main-grid">
        <aside className="side-card">
          <h2>Mode AI</h2>
          <select value={mode} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMode(e.target.value as Mode)}>
            <option value="auto">Auto Router</option>
            <option value="quran">Quran Mode</option>
            <option value="universal">Universal Mode</option>
            <option value="coding">Coding/Debug Mode</option>
            <option value="companion">Companion Mode</option>
            <option value="workflow">Workflow Upgrade Mode</option>
          </select>

          <h2>Level Kecerdasan</h2>
          <select value={intelligenceLevel} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setIntelligenceLevel(e.target.value as IntelligenceLevel)}>
            <option value="instant">Instant - cepat & singkat</option>
            <option value="ordinary">Ordinary - santai harian</option>
            <option value="medium">Medium - seimbang</option>
            <option value="high">High - analisis detail</option>
            <option value="thinking">Thinking - deep reasoning</option>
          </select>
          <small>Level mengatur kedalaman jawaban, retrieval, token budget, dan gaya brainstorming.</small>

          <h2>Saved Session</h2>
          <button className="secondary" onClick={togglePinCurrent}>{pinnedCurrent ? 'Unpin Session' : 'Pin Session'}</button>
          <div className="prompt-list session-list">
            {savedSessions.slice(0, 8).map((item) => (
              <button key={item.sessionId} onClick={() => restoreLocalSession(item)} disabled={loading} title={item.sessionId}>{item.pinned ? '📌 ' : ''}{item.title || item.sessionId}</button>
            ))}
          </div>

          <h2>Quick Test</h2>
          <div className="prompt-list">
            {quickPrompts.map((prompt: string) => (
              <button key={prompt} onClick={() => sendMessage(undefined, prompt)} disabled={loading}>{prompt}</button>
            ))}
          </div>

          <h2>Session</h2>
          <code>{sessionId || 'loading...'}</code>
          <button className="secondary" onClick={resetSession}>Reset Session</button>
          <a className="secondary link-button" href="/dashboard">Buka Dashboard</a>

          <h2>Checklist Upgrade</h2>
          <div className="checklist-box">
            <label><input type="checkbox" checked readOnly /> Problem & use case jelas</label>
            <label><input type="checkbox" checked readOnly /> Data & RAG dipisah rapi</label>
            <label><input type="checkbox" checked readOnly /> Workflow blueprint tersedia</label>
            <label><input type="checkbox" checked readOnly /> Monitoring endpoint tersedia</label>
            <label><input type="checkbox" checked readOnly /> Evaluasi endpoint tersedia</label>
            <label><input type="checkbox" checked readOnly /> Feedback loop tersedia</label>
            <label><input type="checkbox" checked readOnly /> Vector-lite index tersedia</label>
          </div>
        </aside>

        <section className="chat-card">
          <div className="messages">
            {messages.map((message: Message, index: number) => (
              <article key={`${message.role}-${index}`} className={`message ${message.role}`}>
                <div className="bubble">
                  <span className="role">{message.role === 'user' ? 'Kamu' : 'NusaMind AI'} {message.meta ? `• ${message.meta}` : ''}</span>
                  <p>{message.content || (message.role === 'assistant' && loading ? 'Menjawab...' : '')}</p>
                </div>
              </article>
            ))}
            <div ref={bottomRef} />
          </div>

          <form className="composer" onSubmit={sendMessage}>
            <textarea value={input} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)} placeholder="Tanya apa saja, atau upload file gambar/dokumen lalu minta analisis..." rows={2} onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }} />
            <div className="file-upload-row">
              <input type="file" accept=".png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff,.svg,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.json,.xml,.html,.ppt,.pptx,.odt,.ods,.odp,.js,.ts,.tsx,.jsx,.css,.php,.py,.java,.rb,.sql,.log,.yml,.yaml" onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const file = e.currentTarget.files?.[0] || null; setSelectedFile(file); setFileNotice(file ? `File siap dianalisis: ${file.name}` : ''); }} />
              {fileNotice ? <small>{fileNotice}</small> : <small>Upload opsional: gambar, PDF, Word, Excel, CSV, TXT, code, JSON.</small>}
            </div>
            <button disabled={loading || uploadingFile || (!input.trim() && !selectedFile)}>{loading || uploadingFile ? '...' : 'Kirim'}</button>
          </form>
        </section>
      </section>
    </main>
  );
}

async function getStatus() {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/status`, { cache: 'no-store' });
    return res.json();
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const status = await getStatus();

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Production Dashboard</p>
          <h1>Monitoring V12</h1>
          <p className="subtitle">Dashboard ringan untuk memantau dataset, knowledge expansion, tuning prep, Ollama, session, feedback, dan vector-lite index.</p>
        </div>
        <div className="status-card">
          <span>Health</span>
          <p>{status?.version || 'App belum bisa diakses dari server render.'}</p>
        </div>
      </section>

      <section className="workflow-board">
        <div className="board-head">
          <h2>System Metrics</h2>
          <p>Gunakan angka ini untuk melihat apakah AI sudah siap masuk staging/production.</p>
        </div>
        <div className="workflow-grid">
          <article className="workflow-card"><span className="workflow-chip">Dataset</span><h3>{status?.datasets?.quranTrainingRecords ?? 0}</h3><p>Quran training records</p></article>
          <article className="workflow-card"><span className="workflow-chip">RAG</span><h3>{status?.datasets?.quranKnowledgeChunks ?? 0}</h3><p>Quran knowledge chunks</p></article>
          <article className="workflow-card"><span className="workflow-chip">Universal</span><h3>{status?.datasets?.universalKnowledgeItems ?? 0}</h3><p>Universal knowledge items</p></article>
          <article className="workflow-card"><span className="workflow-chip">Vector-lite</span><h3>{status?.vectorIndex?.indexedDocs ?? 0}</h3><p>Indexed documents</p></article>
          <article className="workflow-card"><span className="workflow-chip">V12</span><h3>{status?.datasets?.knowledgeExpansionV12 ?? 0}</h3><p>Current knowledge cards</p></article>
          <article className="workflow-card"><span className="workflow-chip">Playbooks</span><h3>{status?.datasets?.domainPlaybooksV12 ?? 0}</h3><p>Domain troubleshooting playbooks</p></article>
          <article className="workflow-card"><span className="workflow-chip">Sessions</span><h3>{status?.monitoring?.totalSessions ?? 0}</h3><p>Saved sessions</p></article>
          <article className="workflow-card"><span className="workflow-chip">Logs</span><h3>{status?.monitoring?.totalInteractionLogs ?? 0}</h3><p>Interaction logs</p></article>
          <article className="workflow-card"><span className="workflow-chip">Feedback</span><h3>{status?.feedback?.totalFeedback ?? 0}</h3><p>User feedback rows</p></article>
          <article className="workflow-card"><span className="workflow-chip">Ollama</span><h3>{status?.ollama?.ok ? 'OK' : 'OFF'}</h3><p>{status?.ollama?.message || '-'}</p></article>
        </div>
      </section>
    </main>
  );
}

export const versionProfile = {
  "version": "V13.20",
  "edition": "flash",
  "editionName": "NusaMind Flash Version",
  "description": "FAST Response, ringan, cocok riset awal, minim pemahaman.",
  "defaultLevel": "instant",
  "globalCounts": {
    "universalKnowledge": 612833,
    "languageVariants": 69246,
    "goldenEvaluationCases": 14203,
    "vectorLiteStatusIndex": "681188+"
  },
  "priorityNote": "Jawaban cepat dan langsung inti; jika task terlalu berat sarankan Lite/Max.",
  "topCategories": [
    {
      "title": "Matematika Deep Reasoning",
      "previous": 9488,
      "score": 10144
    },
    {
      "title": "Bahasa Interaksi Natural",
      "previous": 8788,
      "score": 9450
    },
    {
      "title": "Scenario Safe Critique Work Coding Alignment",
      "previous": 8600,
      "score": 9268
    },
    {
      "title": "Machine Learning Deep Pipeline",
      "previous": 8188,
      "score": 8862
    },
    {
      "title": "Scenario Policy Answer Alignment",
      "previous": 8188,
      "score": 8868
    },
    {
      "title": "Tren Viral Safe Reasoning",
      "previous": 7888,
      "score": 8574
    },
    {
      "title": "Pemrograman Advanced Reliability",
      "previous": 7388,
      "score": 8080
    },
    {
      "title": "Scenario Math Language Trend Alignment",
      "previous": 6888,
      "score": 7586
    },
    {
      "title": "Agama Safe Context",
      "previous": 6788,
      "score": 7492
    },
    {
      "title": "UU UUD Legal Literacy",
      "previous": 6348,
      "score": 7058
    },
    {
      "title": "Politik Netral Demokrasi",
      "previous": 6188,
      "score": 6904
    },
    {
      "title": "Makanan Minuman Safe Lifestyle",
      "previous": 5988,
      "score": 6710
    },
    {
      "title": "Integrated Safety Routing",
      "previous": 5788,
      "score": 6516
    },
    {
      "title": "Math Language Trend Evaluation Rubric",
      "previous": 5488,
      "score": 6222
    },
    {
      "title": "File Accuracy Scenario",
      "previous": 5267,
      "score": 6007
    },
    {
      "title": "Coding Fullstack",
      "previous": 4897,
      "score": 5643
    },
    {
      "title": "Phrasing Expansion - Tech",
      "previous": 4897,
      "score": 5649
    },
    {
      "title": "Networking",
      "previous": 4628,
      "score": 5386
    },
    {
      "title": "Windows Laptop",
      "previous": 4628,
      "score": 5392
    },
    {
      "title": "Math Academic",
      "previous": 4628,
      "score": 5398
    },
    {
      "title": "Internship",
      "previous": 4628,
      "score": 5404
    },
    {
      "title": "Coding Debugging",
      "previous": 4628,
      "score": 5410
    },
    {
      "title": "AI Engineering",
      "previous": 4385,
      "score": 5173
    },
    {
      "title": "Production Architecture",
      "previous": 4335,
      "score": 5129
    },
    {
      "title": "AI RAG LLM",
      "previous": 4335,
      "score": 5135
    },
    {
      "title": "AI RAG LLM Query Variants",
      "previous": 4335,
      "score": 5141
    },
    {
      "title": "Telekomunikasi",
      "previous": 4292,
      "score": 5104
    },
    {
      "title": "Pengetahuan Fashion",
      "previous": 4238,
      "score": 5056
    },
    {
      "title": "Pengetahuan IPS",
      "previous": 4238,
      "score": 5062
    }
  ],
  "features": [
    {
      "id": "FLASH-13.20-001",
      "category": "Core Performance",
      "feature": "Fast Response Engine",
      "setting": "reasoning_depth=low; max_tokens=500-800; rag_top_k=1-3; verifier=false; streaming=true",
      "command": "/version flash",
      "guardrail": "Jika topik sensitif/berat, sarankan pindah ke Lite/Max."
    },
    {
      "id": "FLASH-13.20-002",
      "category": "Prompt Profile",
      "feature": "Lightweight Prompt",
      "setting": "short_system_prompt=true; minimal_instruction=true; no_long_explanation=true",
      "command": "/profile flash",
      "guardrail": "Tetap wajib patuh safety walau prompt ringan."
    },
    {
      "id": "FLASH-13.20-003",
      "category": "RAG",
      "feature": "Minimal RAG Retrieval",
      "setting": "rag_enabled=true; rag_top_k=1-3; reranker=false; source_preview=short",
      "command": "/rag on; /sources",
      "guardrail": "Jika sumber tidak cukup, jangan mengarang."
    },
    {
      "id": "FLASH-13.20-004",
      "category": "Output Style",
      "feature": "Short Answer Mode",
      "setting": "answer_length=short; bullet_limit=3-5; table=false_by_default",
      "command": "/short; /answer short",
      "guardrail": "Jangan memotong informasi safety penting."
    },
    {
      "id": "FLASH-13.20-005",
      "category": "CLI Startup",
      "feature": "Fast CLI Startup",
      "setting": "load_memory=minimal; preload_kb=false; lazy_load=true",
      "command": "nusamind --flash",
      "guardrail": "Jangan skip safety module saat startup."
    },
    {
      "id": "FLASH-13.20-006",
      "category": "Cache",
      "feature": "Quick Cache Answer",
      "setting": "cache_common_questions=true; cache_ttl=7-30_days; cache_by_version=flash",
      "command": "/cache status",
      "guardrail": "Cache harus invalid jika sumber sudah berubah."
    },
    {
      "id": "FLASH-13.20-007",
      "category": "Research",
      "feature": "Quick Research Mode",
      "setting": "summary_depth=low; source_count=1-3; no_deep_compare=true",
      "command": "/research quick",
      "guardrail": "Untuk fakta terbaru wajib cek sumber/update."
    },
    {
      "id": "FLASH-13.20-008",
      "category": "Coding",
      "feature": "Basic Coding Help",
      "setting": "code_analysis_depth=basic; max_files=1; no_root_cause_deep=true",
      "command": "/debug quick; /review-code quick",
      "guardrail": "Jangan menyarankan command destruktif tanpa warning."
    },
    {
      "id": "FLASH-13.20-009",
      "category": "Matematika",
      "feature": "Basic Math Solver",
      "setting": "math_depth=basic; verifier=light; formula_explanation=short",
      "command": "/math quick",
      "guardrail": "Jika soal kompleks, sarankan Lite/Max."
    },
    {
      "id": "FLASH-13.20-010",
      "category": "Telekomunikasi",
      "feature": "Basic Telecom Answer",
      "setting": "telecom_depth=basic; formula_detail=false",
      "command": "/telecom quick",
      "guardrail": "Jangan memberi instruksi jamming/gangguan RF."
    },
    {
      "id": "FLASH-13.20-011",
      "category": "Memory",
      "feature": "Minimal Memory Mode",
      "setting": "memory_mode=minimal; session_context=recent_only; long_term_memory=read_limited",
      "command": "/memory minimal",
      "guardrail": "Jangan menyimpan memory baru tanpa izin."
    },
    {
      "id": "FLASH-13.20-012",
      "category": "Session",
      "feature": "Basic Session Continuity",
      "setting": "recent_window=5-10_messages; auto_summary=false_or_light",
      "command": "/continue; /last",
      "guardrail": "Jika referensi ambigu, sebutkan asumsi."
    },
    {
      "id": "FLASH-13.20-013",
      "category": "File Handling",
      "feature": "Quick Text Summary",
      "setting": "max_file_size=small; extraction_depth=basic; table_extraction=false",
      "command": "/attach file.txt; /summary quick",
      "guardrail": "Jika file tidak terbaca, jangan menebak isi file."
    },
    {
      "id": "FLASH-13.20-014",
      "category": "Version Routing",
      "feature": "Suggest Upgrade to Lite/Max",
      "setting": "complexity_threshold_lite=0.45; threshold_max=0.75",
      "command": "/version auto",
      "guardrail": "Jangan menjawab asal hanya demi cepat."
    },
    {
      "id": "FLASH-13.20-015",
      "category": "Export",
      "feature": "Fast Export Basic",
      "setting": "export_formats=txt,md,csv_basic; no_complex_formatting=true",
      "command": "/export last csv",
      "guardrail": "Jangan export data sensitif tanpa warning."
    }
  ]
} as const;

function formatCount(value: number | string): string {
  if (typeof value === 'string') return value;
  return new Intl.NumberFormat('id-ID').format(value);
}

export function buildVersionProfilePrompt(): string {
  const counts = versionProfile.globalCounts;
  const top = versionProfile.topCategories.slice(0, 14).map((item) => `- ${item.title}: ${formatCount(item.previous)} → ${formatCount(item.score)}`).join('\n');
  const features = versionProfile.features.slice(0, 10).map((item) => `- ${item.id} ${item.category}/${item.feature}: ${item.setting}`).join('\n');
  return `Profil NusaMind aktif: ${versionProfile.editionName} ${versionProfile.version}. ${versionProfile.description}
Default level: ${versionProfile.defaultLevel}. Catatan: ${versionProfile.priorityNote}
Global count V13.20: Universal Knowledge=${formatCount(counts.universalKnowledge)}, Language Variants=${formatCount(counts.languageVariants)}, Golden Evaluation Cases=${formatCount(counts.goldenEvaluationCases)}, Vector-lite status index=${counts.vectorLiteStatusIndex}.
Top category dinaikkan dari versi sebelumnya:
${top}
CSV upgrade yang wajib dipakai:
${features}
Aturan keras: upgrade ini hanya menyentuh AI core, CLI, RAG, memory, session, evaluasi, knowledge, script, dan cleanup. Jangan mengubah UI web kecuali user minta eksplisit.`;
}

export function buildVersionCommandAnswer(): string {
  const counts = versionProfile.globalCounts;
  const features = versionProfile.features.slice(0, 12).map((item, index) => `${index + 1}. ${item.id} — ${item.feature} (${item.category})`).join('\n');
  return [
    `${versionProfile.editionName} ${versionProfile.version}`,
    versionProfile.description,
    `Default level: ${versionProfile.defaultLevel}`,
    `Universal Knowledge: ${formatCount(counts.universalKnowledge)}`,
    `Language Variants: ${formatCount(counts.languageVariants)}`,
    `Golden Evaluation Cases: ${formatCount(counts.goldenEvaluationCases)}`,
    `Vector-lite status index: ${counts.vectorLiteStatusIndex}`,
    '',
    'Upgrade utama:',
    features,
    '',
    'No UI touch: aktif. Fokus upgrade hanya AI/CLI/RAG/memory/session/evaluation/cleanup.'
  ].join('\n');
}

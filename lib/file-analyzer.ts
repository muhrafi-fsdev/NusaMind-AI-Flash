import path from 'node:path';

export type UploadedFileKind = 'image' | 'document' | 'spreadsheet' | 'text' | 'code' | 'archive' | 'unknown';
export type ExtractionConfidence = 'high' | 'medium' | 'low' | 'metadata-only' | 'failed';

export type FileQualitySignal = {
  key: string;
  status: 'pass' | 'warning' | 'fail' | 'unknown';
  detail: string;
};

export type UploadedFileAnalysis = {
  fileName: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  sizeMB: number;
  kind: UploadedFileKind;
  supported: boolean;
  parser: string;
  extractedText: string;
  preview: string;
  evidenceSnippets: string[];
  warnings: string[];
  qualitySignals: FileQualitySignal[];
  confidence: ExtractionConfidence;
  confidenceScore: number;
  summary: string;
  recommendedMode: 'auto' | 'universal' | 'coding' | 'workflow';
  supportedFormats: string[];
  accuracyPolicy: string[];
};

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_TEXT_CHARS = 60000;
const TEXT_EXT = new Set(['txt','md','csv','json','xml','html','htm','svg','log','env','ini','yml','yaml','js','jsx','ts','tsx','css','scss','php','py','java','rb','sql','sh','bat','ps1','cpp','c','h','cs']);
const IMAGE_EXT = new Set(['png','jpg','jpeg','webp','gif','bmp','tiff','tif','svg']);
const DOC_EXT = new Set(['pdf','doc','docx','ppt','pptx','odt','odp']);
const SHEET_EXT = new Set(['xls','xlsx','ods']);
export const SUPPORTED_UPLOAD_FORMATS = [
  'PNG','JPG','JPEG','WEBP','GIF','BMP','TIFF','SVG',
  'PDF','DOCX','XLSX','CSV','TXT','MD','JSON','XML','HTML',
  'JS','TS','CSS','PHP','PY','JAVA','RB','SQL','LOG','YAML'
];

export const ACCURACY_POLICY = [
  'Jawab hanya berdasarkan isi file yang benar-benar berhasil diekstrak atau dibaca.',
  'Bedakan bukti file, metadata file, dan asumsi pribadi.',
  'Jangan mengarang teks, angka, tabel, halaman, sheet, baris, atau isi gambar.',
  'Jika gambar buram, dokumen corrupt, parser gagal, atau bukti kurang, sebutkan keterbatasan dan minta upload ulang/teks penting.',
  'Untuk dokumen panjang, ringkas bertahap dan gunakan evidence snippet yang relevan.',
  'Untuk file sensitif, jaga privasi dan jangan menyimpan/membocorkan data berlebih.'
];

function extOf(fileName: string) {
  return path.extname(fileName || '').replace('.', '').toLowerCase();
}
function detectKind(ext: string, mime: string): UploadedFileKind {
  if (IMAGE_EXT.has(ext) || mime.startsWith('image/')) return 'image';
  if (SHEET_EXT.has(ext)) return 'spreadsheet';
  if (TEXT_EXT.has(ext) || mime.startsWith('text/')) return ext === 'csv' ? 'spreadsheet' : (['js','jsx','ts','tsx','css','php','py','java','rb','sql','sh','bat','ps1','cpp','c','h','cs'].includes(ext) ? 'code' : 'text');
  if (DOC_EXT.has(ext) || mime.includes('pdf') || mime.includes('word') || mime.includes('presentation')) return 'document';
  if (['zip','rar','7z'].includes(ext)) return 'archive';
  return 'unknown';
}
function truncate(input: string, max = MAX_TEXT_CHARS) {
  const text = String(input || '').replace(/\u0000/g, '').trim();
  if (text.length <= max) return text;
  return text.slice(0, max) + `\n\n[TRUNCATED: teks dipotong agar aman. Total karakter awal sekitar ${text.length}.]`;
}
function basicStats(text: string) {
  const lines = text ? text.split(/\r?\n/).length : 0;
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  return { lines, words, chars: text.length };
}
function buildEvidenceSnippets(text: string, max = 5) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length >= 24);
  const snippets = lines.slice(0, max).map((line, index) => `Snippet ${index + 1}: ${line.slice(0, 420)}`);
  if (!snippets.length && text.trim()) snippets.push(`Snippet 1: ${text.trim().slice(0, 420)}`);
  return snippets;
}
function detectQualitySignals(fileName: string, ext: string, mimeType: string, sizeBytes: number, kind: UploadedFileKind, extractedText: string, parser: string, warnings: string[]): FileQualitySignal[] {
  const signals: FileQualitySignal[] = [];
  signals.push({ key: 'extension_detected', status: ext ? 'pass' : 'warning', detail: ext ? `Ekstensi .${ext}` : 'Ekstensi tidak terdeteksi dari nama file.' });
  signals.push({ key: 'mime_detected', status: mimeType && mimeType !== 'application/octet-stream' ? 'pass' : 'warning', detail: `MIME: ${mimeType || '-'}` });
  signals.push({ key: 'size_limit', status: sizeBytes <= MAX_FILE_SIZE ? 'pass' : 'fail', detail: `${(sizeBytes / (1024 * 1024)).toFixed(3)} MB dari batas rekomendasi 20 MB.` });
  signals.push({ key: 'supported_kind', status: kind !== 'unknown' && kind !== 'archive' ? 'pass' : 'warning', detail: `Jenis file: ${kind}` });
  if (kind === 'image' && ext !== 'svg') {
    signals.push({ key: 'image_text_extraction', status: 'warning', detail: 'Gambar raster butuh OCR/vision model untuk membaca teks/objek secara penuh.' });
  }
  if (extractedText) {
    const stats = basicStats(extractedText);
    signals.push({ key: 'text_extracted', status: stats.chars > 80 ? 'pass' : 'warning', detail: `${stats.chars} karakter, ${stats.words} kata, ${stats.lines} baris berhasil diekstrak.` });
    const weird = (extractedText.match(/[�\u0000]/g) || []).length;
    signals.push({ key: 'encoding_quality', status: weird === 0 ? 'pass' : 'warning', detail: weird === 0 ? 'Tidak terlihat karakter rusak besar.' : `Ada ${weird} karakter rusak/aneh.` });
  } else {
    signals.push({ key: 'text_extracted', status: kind === 'image' ? 'unknown' : 'warning', detail: 'Belum ada teks yang berhasil diekstrak.' });
  }
  if (warnings.length) signals.push({ key: 'warnings', status: 'warning', detail: warnings.join(' | ') });
  signals.push({ key: 'parser_used', status: parser === 'metadata-only' ? 'warning' : 'pass', detail: `Parser: ${parser}` });
  return signals;
}
function confidenceFromSignals(kind: UploadedFileKind, extractedText: string, warnings: string[], signals: FileQualitySignal[]): { confidence: ExtractionConfidence; score: number } {
  const stats = basicStats(extractedText);
  let score = 0.25;
  if (kind !== 'unknown' && kind !== 'archive') score += 0.15;
  if (stats.chars > 200) score += 0.25;
  else if (stats.chars > 40) score += 0.12;
  if (stats.words > 80) score += 0.15;
  if (!warnings.length) score += 0.12;
  if (signals.some((s) => s.key === 'size_limit' && s.status === 'fail')) score -= 0.22;
  if (kind === 'image' && !extractedText) score = Math.min(score, 0.35);
  score = Math.max(0, Math.min(0.98, score));
  const confidence: ExtractionConfidence = score >= 0.78 ? 'high' : score >= 0.56 ? 'medium' : score >= 0.36 ? 'low' : (extractedText ? 'low' : 'metadata-only');
  return { confidence, score: Number(score.toFixed(2)) };
}
async function parseText(buffer: Buffer) {
  return truncate(new TextDecoder('utf-8', { fatal: false }).decode(buffer));
}
async function parsePdf(buffer: Buffer, warnings: string[]) {
  try {
    const mod: any = await import('pdf-parse');
    const pdfParse = mod.default || mod;
    const result = await pdfParse(buffer);
    return truncate(result.text || '');
  } catch (error) {
    warnings.push('PDF parser belum tersedia/gagal. Jalankan npm install, atau copy teks penting dari PDF. PDF scan tetap butuh OCR.');
    return '';
  }
}
async function parseDocx(buffer: Buffer, warnings: string[]) {
  try {
    const mammoth: any = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return truncate(result.value || '');
  } catch (error) {
    warnings.push('DOCX parser belum tersedia/gagal. Jalankan npm install, atau export dokumen ke TXT/PDF.');
    return '';
  }
}
async function parseSpreadsheet(buffer: Buffer, ext: string, warnings: string[]) {
  try {
    const XLSX: any = await import('xlsx');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const parts: string[] = [];
    for (const sheetName of workbook.SheetNames.slice(0, 10)) {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }).slice(0, 160);
      parts.push(`# Sheet: ${sheetName}\n` + rows.map((row: any[]) => row.join(' | ')).join('\n'));
    }
    return truncate(parts.join('\n\n'));
  } catch (error) {
    warnings.push(`${ext.toUpperCase()} parser belum tersedia/gagal. Coba export ke CSV untuk hasil lebih stabil.`);
    return '';
  }
}

export async function analyzeUploadedFile(file: File): Promise<UploadedFileAnalysis> {
  const fileName = file.name || 'uploaded-file';
  const extension = extOf(fileName);
  const mimeType = file.type || 'application/octet-stream';
  const sizeBytes = file.size || 0;
  const sizeMB = Number((sizeBytes / (1024 * 1024)).toFixed(3));
  const kind = detectKind(extension, mimeType);
  const warnings: string[] = [];
  if (sizeBytes > MAX_FILE_SIZE) warnings.push(`Ukuran file ${sizeMB} MB melebihi batas rekomendasi 20 MB.`);
  const buffer = Buffer.from(await file.arrayBuffer());
  let extractedText = '';
  let parser = 'metadata-only';

  if (sizeBytes <= MAX_FILE_SIZE) {
    if (kind === 'image') {
      parser = extension === 'svg' ? 'svg-text-or-image-metadata' : 'image-metadata';
      if (extension === 'svg') extractedText = await parseText(buffer);
      else warnings.push('Gambar raster diterima sebagai metadata. Untuk membaca teks/objek gambar secara akurat, tambahkan OCR/vision model atau pastikan screenshot sangat jelas.');
    } else if (TEXT_EXT.has(extension) || mimeType.startsWith('text/')) {
      parser = 'text-decoder';
      extractedText = await parseText(buffer);
    } else if (extension === 'pdf') {
      parser = 'pdf-parse';
      extractedText = await parsePdf(buffer, warnings);
    } else if (extension === 'docx') {
      parser = 'mammoth-docx';
      extractedText = await parseDocx(buffer, warnings);
    } else if (SHEET_EXT.has(extension)) {
      parser = 'xlsx';
      extractedText = await parseSpreadsheet(buffer, extension, warnings);
    } else if (extension === 'doc' || extension === 'ppt' || extension === 'pptx' || extension === 'odt' || extension === 'ods' || extension === 'odp') {
      warnings.push(`${extension.toUpperCase()} dikenali, tetapi parser penuh belum stabil di mode lokal ini. Disarankan export ke PDF/TXT/CSV atau pasang parser tambahan.`);
    }
  }

  const stats = basicStats(extractedText);
  const supported = kind !== 'unknown' && kind !== 'archive';
  const qualitySignals = detectQualitySignals(fileName, extension, mimeType, sizeBytes, kind, extractedText, parser, warnings);
  const confidenceResult = confidenceFromSignals(kind, extractedText, warnings, qualitySignals);
  const evidenceSnippets = buildEvidenceSnippets(extractedText);
  const recommendedMode = kind === 'code' ? 'coding' : (['pdf','docx','xlsx','csv','json','xml','html','md','txt','svg'].includes(extension) ? 'universal' : 'auto');
  const summary = extractedText
    ? `File berhasil dianalisis dengan parser ${parser}. Confidence ${confidenceResult.confidence} (${confidenceResult.score}). Terdeteksi ${stats.lines} baris, ${stats.words} kata, ${stats.chars} karakter.`
    : `File dikenali sebagai ${kind}. Isi teks belum berhasil diekstrak penuh; gunakan metadata/preview dan minta konteks tambahan jika perlu. Confidence ${confidenceResult.confidence} (${confidenceResult.score}).`;
  return {
    fileName, extension, mimeType, sizeBytes, sizeMB, kind, supported, parser,
    extractedText,
    preview: extractedText.slice(0, 4000),
    evidenceSnippets,
    warnings,
    qualitySignals,
    confidence: confidenceResult.confidence,
    confidenceScore: confidenceResult.score,
    summary,
    recommendedMode,
    supportedFormats: SUPPORTED_UPLOAD_FORMATS,
    accuracyPolicy: ACCURACY_POLICY,
  };
}

export function buildFilePromptContext(analysis: UploadedFileAnalysis, userQuestion: string) {
  const text = analysis.extractedText ? `\n\nISI FILE YANG TERBACA:\n${analysis.extractedText}` : '';
  const evidence = analysis.evidenceSnippets.length ? `\nEVIDENCE SNIPPETS:\n- ${analysis.evidenceSnippets.join('\n- ')}` : '';
  const warnings = analysis.warnings.length ? `\nPERINGATAN/KETERBATASAN:\n- ${analysis.warnings.join('\n- ')}` : '';
  const signals = analysis.qualitySignals.length ? `\nQUALITY SIGNALS:\n- ${analysis.qualitySignals.map((s) => `${s.key}: ${s.status} — ${s.detail}`).join('\n- ')}` : '';
  return `[KONTEKS FILE UPLOAD V13.8]\nNama file: ${analysis.fileName}\nFormat: ${analysis.extension || '-'}\nMIME: ${analysis.mimeType}\nUkuran: ${analysis.sizeMB} MB\nJenis: ${analysis.kind}\nParser: ${analysis.parser}\nConfidence: ${analysis.confidence} (${analysis.confidenceScore})\nRingkasan parser: ${analysis.summary}${warnings}${signals}${evidence}${text}\n\nATURAN AKURASI:\n- Jawab hanya dari isi file yang terbaca atau bukti yang tersedia.\n- Jangan mengarang isi gambar/dokumen/tabel/halaman/sheet/baris.\n- Jika bukti kurang, sebutkan keterbatasan dan minta upload ulang/teks yang lebih jelas.\n\n[PERTANYAAN USER]\n${userQuestion || 'Jelaskan dan analisis file ini.'}`;
}

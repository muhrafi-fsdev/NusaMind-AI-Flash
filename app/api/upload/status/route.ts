import { SUPPORTED_UPLOAD_FORMATS, ACCURACY_POLICY } from '@/lib/file-analyzer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    ok: true,
    version: 'V13.8 Accurate Image & Document Reading Foundation',
    supportedFormats: SUPPORTED_UPLOAD_FORMATS,
    accuracyFeatures: [
      'file quality signals',
      'extraction confidence score',
      'evidence snippets',
      'no-hallucination file policy',
      'parser/OCR limitation warning',
      'privacy-aware file analysis',
    ],
    accuracyPolicy: ACCURACY_POLICY,
    notes: [
      'TXT/MD/CSV/JSON/XML/HTML/SVG/code/log dapat dibaca sebagai teks.',
      'PDF/DOCX/XLSX memakai parser opsional dari dependency npm.',
      'Gambar raster masih membutuhkan OCR/vision model untuk membaca teks/objek secara penuh.',
      'AI wajib menyebut confidence dan keterbatasan jika file/gambar/dokumen tidak terbaca jelas.',
    ],
    endpoints: ['/api/upload/analyze', '/api/upload/status'],
  });
}

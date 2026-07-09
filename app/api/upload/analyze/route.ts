import { analyzeUploadedFile, buildFilePromptContext } from '@/lib/file-analyzer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const fileValue = form.get('file');
    const question = String(form.get('question') || 'Jelaskan dan analisis file ini.');
    if (!fileValue || typeof fileValue === 'string') {
      return Response.json({ ok: false, error: 'File belum dikirim. Gunakan field multipart/form-data bernama file.' }, { status: 400 });
    }
    const analysis = await analyzeUploadedFile(fileValue);
    return Response.json({ ok: true, analysis, promptContext: buildFilePromptContext(analysis, question) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memproses file.';
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

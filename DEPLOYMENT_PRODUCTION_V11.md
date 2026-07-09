# Deployment Production V11

## 1. Local Development

```bash
npm install
ollama pull qwen2.5:7b
ollama serve
npm run vector:reindex
npm run dev
```

## 2. Internal Staging

Checklist:

- `.env.local` sudah benar
- `ADMIN_TOKEN` diisi
- `npm run vector:reindex` sudah dijalankan
- `npm run evaluate:mock` pass
- `/api/status` menampilkan Ollama OK
- `/dashboard` menampilkan metrik

## 3. Production Local Server

```bash
npm run build
npm run start
```

## 4. Docker Optional

```bash
docker compose up --build
```

## 5. Monitoring

Pantau:

- `/api/status`
- `/api/monitoring`
- `/api/feedback`
- `/dashboard`

## 6. Improvement Loop

Jika jawaban buruk:

1. cek feedback label
2. cek source retrieval
3. perbaiki dataset
4. reindex vector-lite
5. test golden set
6. deploy ulang

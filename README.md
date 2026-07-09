# NusaMind AI Flash V13.20

NusaMind AI Flash V13.20 adalah versi ringan dari NusaMind AI yang difokuskan untuk respons cepat, penggunaan lokal, riset ringan, CLI Chat, RAG knowledge search, dan session continuity.

## Fitur Utama

- Flash mode untuk respons cepat
- CLI Chat lokal
- Session continuity: AI dapat melanjutkan pembahasan dalam session yang sama
- RAG knowledge search berbasis dataset lokal
- Integrasi Ollama untuk menjalankan model AI secara lokal
- Dataset Al-Qur'an dan knowledge dasar
- Bahasa Indonesia natural dan santai
- No UI touch pada upgrade V13.20 Flash

## Requirement

Sebelum menjalankan project, install:

- Node.js 22 atau lebih baru
- npm
- Ollama
- Model Ollama yang direkomendasikan:
  - `qwen2.5:7b`
  - `qwen2.5-coder:7b`

## Cara Install

Clone repository:

```bash
git clone https://github.com/USERNAME/nusamind-ai-flash-v13-20.git
cd nusamind-ai-flash-v13-20
```

Install dependency:

```bash
npm install
```

Copy environment file:

```bash
cp .env.example .env
```

Untuk Windows PowerShell:

```powershell
Copy-Item ".env.example" ".env"
```

## Menjalankan Ollama

Jalankan Ollama:

```bash
ollama serve
```

Download model:

```bash
ollama pull qwen2.5:7b
ollama pull qwen2.5-coder:7b
```

Cek status Ollama dari project:

```bash
npm run ai:ollama
```

## Menjalankan Server

```bash
npm run dev
```

Buka:

```txt
http://localhost:3000
```

## Menjalankan CLI Chat

Windows PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\cli\nusamind-chat.ps1" -Mode auto -IntelligenceLevel instant -SessionId "public-user"
```

Atau gunakan BAT:

```powershell
.\start-cli-auto.bat
```

Mode Flash khusus:

```powershell
.\start-cli-flash.bat
```

## Command CLI

```txt
/help
/version
/profile
/session
/summary
/last
/tasks
/pin teks penting
/artifacts
/health
/private on
/private off
/rename
/new
/load sessionId
/level instant
exit
```

## DataPack Opsional

Repo GitHub ini sengaja tidak menyertakan beberapa file dataset besar supaya repository tetap ringan dan aman untuk di-clone.

File yang tidak dimasukkan ke repo utama antara lain:

```txt
data/universal-knowledge.json
data/training-shards/
data/knowledge_sources/
data/all-top-category-boost-v13-10.json
data/all-top-category-boost-v13-11.json
data/all-top-category-boost-v13-14.json
data/feature-boost-math-language-trend-v13-11.json
data/language-variants-id.json
storage/
```

Jika tersedia DataPack di halaman Releases, download file tersebut lalu extract ke root project agar folder `data/` dan `storage/` terisi kembali.

Setelah DataPack dipasang, jalankan:

```bash
npm run vector:reindex
npm run knowledge:check
npm run version:summary
```

## Cara Jalan di Laragon / PowerShell

Contoh folder:

```powershell
cd "C:\laragon\www\nusamind-ai-flash-v13-20"
npm install
npm run dev
```

Terminal kedua:

```powershell
cd "C:\laragon\www\nusamind-ai-flash-v13-20"
.\start-cli-auto.bat
```

## Catatan Keamanan dan Akurasi

NusaMind AI Flash berjalan lokal di perangkat pengguna. Hasil jawaban AI tetap perlu diverifikasi, terutama untuk topik agama, hukum, kesehatan, keuangan, keamanan siber, akademik, dan keputusan penting lainnya.

Jangan commit file `.env`, session pribadi, log percakapan, atau dataset yang lisensinya belum jelas.

## Status V13.20 Flash

- Universal Knowledge target: 612.833
- Language Variants target: 69.246
- Golden Evaluation Cases target: 14.203
- Vector-lite status index target: 681.188+
- Fokus: fast response, ringan, cocok riset awal

## Lisensi

Lisensi belum ditentukan. Jika ingin menjadikan project ini open-source, tambahkan file `LICENSE` sesuai pilihan lisensi yang diinginkan.

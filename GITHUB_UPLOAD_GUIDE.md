# Panduan Upload ke GitHub

## 1. Extract ZIP GitHub Ready

Extract file ZIP ini ke folder lokal, misalnya:

```txt
C:\laragon\www\nusamind-ai-flash-v13-20
```

## 2. Cek file yang tidak boleh ikut commit

Pastikan file berikut tidak ikut masuk repo:

```txt
.env
node_modules/
.next/
storage/
data/universal-knowledge.json
data/training-shards/
data/knowledge_sources/
*.zip
*.log
```

## 3. Init Git

```powershell
git init
git add .
git status
git commit -m "Initial release NusaMind AI Flash V13.20"
git branch -M main
git remote add origin https://github.com/USERNAME/nusamind-ai-flash-v13-20.git
git push -u origin main
```

## 4. Upload DataPack ke Release, bukan commit repo

Jika ingin membagikan dataset besar, upload sebagai GitHub Release asset, misalnya:

```txt
NusaMind_AI_Flash_V13_20_DATAPACK_RELEASE.zip
```

Publik cukup download DataPack, extract ke root project, lalu jalankan reindex.

## 5. Deskripsi Repository

```txt
NusaMind AI Flash V13.20 — lightweight local AI assistant built with Next.js, Ollama, CLI Chat, RAG knowledge search, session continuity, and Indonesian-friendly response behavior.
```

## 6. Topics GitHub

```txt
nusamind
ai-assistant
ollama
nextjs
rag
local-ai
cli-chat
indonesian-ai
quran-ai
typescript
```

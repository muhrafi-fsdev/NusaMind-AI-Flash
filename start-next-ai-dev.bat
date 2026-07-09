@echo off
setlocal
cd /d "%~dp0"
echo ==============================================
echo AL-QURAN NUSANTARA AI V9 - NEXT.JS DEV
echo ==============================================
if not exist node_modules (
  echo node_modules belum ada. Menjalankan npm install...
  npm install
)
echo.
echo Cek Ollama. Kalau belum aktif, buka terminal lain dan jalankan: ollama serve
echo Model utama yang disarankan: ollama pull qwen2.5:7b
echo.
npm run dev
pause

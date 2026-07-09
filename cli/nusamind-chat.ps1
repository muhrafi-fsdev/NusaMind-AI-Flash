param(
  [string]$Mode = "auto",
  [string]$SessionId = "cli-rafi",
  [string]$IntelligenceLevel = "instant",
  [string]$BaseUrl = "http://localhost:3000"
)
try { chcp 65001 > $null } catch {}
try {
  [Console]::InputEncoding = [System.Text.Encoding]::UTF8
  [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
  $OutputEncoding = [System.Text.Encoding]::UTF8
} catch {}

function New-SessionId {
  return "cli-" + (Get-Date -Format "yyyyMMdd-HHmmss")
}

function Invoke-JsonRequest {
  param([string]$Url,[string]$Method="GET",[object]$Body=$null)
  $client = New-Object System.Net.WebClient
  $client.Encoding = [System.Text.Encoding]::UTF8
  $client.Headers.Add("Accept", "application/json")
  if ($Body -ne $null) {
    $client.Headers.Add("Content-Type", "application/json; charset=utf-8")
    $payloadJson = $Body | ConvertTo-Json -Depth 12
    return $client.UploadString($Url, $Method, $payloadJson) | ConvertFrom-Json
  }
  return $client.DownloadString($Url) | ConvertFrom-Json
}

function Send-NusaMindMessage {
  param([string]$Message,[string]$Mode,[string]$SessionId,[string]$BaseUrl,[string]$IntelligenceLevel)
  $payloadObject = @{ message=$Message; mode=$Mode; sessionId=$SessionId; intelligenceLevel=$IntelligenceLevel }
  try {
    $response = Invoke-JsonRequest -Url "$BaseUrl/api/chat-json" -Method "POST" -Body $payloadObject
    if ($response.answer) { return $response.answer }
    if ($response.reply) { return $response.reply }
    if ($response.message) { return $response.message }
    if ($response.error) { return "Error dari server: $($response.error)" }
    return ($response | ConvertTo-Json -Depth 10)
  } catch { return "ERROR_CLI_REQUEST: $($_.Exception.Message)" }
}

function Show-Header {
  Clear-Host
  Write-Host "NusaMind AI CLI Chat V13.20 - NusaMind Flash Version" -ForegroundColor Cyan
  Write-Host "Mode        : $Mode" -ForegroundColor Gray
  Write-Host "Level       : $IntelligenceLevel" -ForegroundColor Gray
  Write-Host "Session     : $SessionId" -ForegroundColor Gray
  Write-Host "Base URL    : $BaseUrl" -ForegroundColor Gray
  Write-Host "Command     : /help, /version, /session, /summary, /last, /tasks, /pin, /health, /new, /load <id>, /level <name>, exit" -ForegroundColor Yellow
  Write-Host ""
}

Show-Header
while ($true) {
  Write-Host "You: " -NoNewline -ForegroundColor Green
  $userInput = Read-Host
  if ($userInput -eq "exit") { Write-Host ""; Write-Host "Chat selesai." -ForegroundColor Yellow; break }
  if ([string]::IsNullOrWhiteSpace($userInput)) { continue }

  if ($userInput -eq "/new") {
    $SessionId = New-SessionId
    Write-Host "Session baru: $SessionId" -ForegroundColor Yellow
    continue
  }
  if ($userInput -like "/load *") {
    $target = $userInput.Substring(6).Trim()
    if ($target.Length -gt 0) { $SessionId = $target; Write-Host "Session aktif diganti: $SessionId" -ForegroundColor Yellow }
    continue
  }
  if ($userInput -like "/level *") {
    $targetLevel = $userInput.Substring(7).Trim().ToLower()
    if (@("instant","ordinary","medium","high","thinking","deep") -contains $targetLevel) {
      if ($targetLevel -eq "deep") { $targetLevel = "thinking" }
      $IntelligenceLevel = $targetLevel
      Write-Host "Level aktif: $IntelligenceLevel" -ForegroundColor Yellow
    } else {
      Write-Host "Level valid: instant, ordinary, medium, high, thinking" -ForegroundColor Yellow
    }
    continue
  }
  if ($userInput -eq "/sessions") {
    try {
      $res = Invoke-JsonRequest -Url "$BaseUrl/api/sessions" -Method "GET"
      if ($res.sessions) {
        $res.sessions | Select-Object -First 15 | ForEach-Object { Write-Host ("- {0} | {1} pesan | {2}" -f $_.sessionId,$_.messageCount,$_.title) }
      } else { Write-Host ($res | ConvertTo-Json -Depth 10) }
    } catch { Write-Host "Gagal ambil sessions: $($_.Exception.Message)" -ForegroundColor Red }
    continue
  }

  Write-Host ""
  Write-Host "NusaMind AI:" -ForegroundColor Cyan
  $answer = Send-NusaMindMessage -Message $userInput -Mode $Mode -SessionId $SessionId -BaseUrl $BaseUrl -IntelligenceLevel $IntelligenceLevel
  if ($answer -like "ERROR_CLI_REQUEST:*") {
    Write-Host $answer -ForegroundColor Red
    Write-Host ""
    Write-Host "Pastikan server Next.js sudah jalan di $BaseUrl" -ForegroundColor Yellow
    Write-Host "Cek terminal server: npm run dev" -ForegroundColor Yellow
  } else { Write-Host $answer }
  Write-Host ""
}

$ErrorActionPreference = 'Stop'
$taskRoot = $PSScriptRoot
$ollamaExe = Join-Path $taskRoot 'runtime\ollama.exe'
if (-not (Test-Path -LiteralPath $ollamaExe)) {
    $ollamaCommand = Get-Command 'ollama.exe' -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    $installedExe = Join-Path $env:LOCALAPPDATA 'Programs\Ollama\ollama.exe'
    if ($ollamaCommand) { $ollamaExe = $ollamaCommand.Source }
    elseif (Test-Path -LiteralPath $installedExe) { $ollamaExe = $installedExe }
    else { throw 'Install Ollama for Windows from https://ollama.com/download/windows, then run this file again. See README.md.' }
}
# A dedicated loopback server keeps this project separate from port 11434.
# These environment values apply only to this process and its children.
$env:OLLAMA_HOST = '127.0.0.1:11435'
$env:OLLAMA_MODELS = Join-Path $taskRoot 'models'
$env:OLLAMA_NO_CLOUD = '1'
try { $null = Invoke-RestMethod 'http://127.0.0.1:11435/api/tags' -TimeoutSec 2 }
catch {
    Start-Process -FilePath $ollamaExe -ArgumentList 'serve' -WindowStyle Hidden -WorkingDirectory $taskRoot -RedirectStandardOutput (Join-Path $taskRoot 'ai-server.log') -RedirectStandardError (Join-Path $taskRoot 'ai-server-error.log')
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Milliseconds 500
        try { $null = Invoke-RestMethod 'http://127.0.0.1:11435/api/tags' -TimeoutSec 2; $ready = $true; break } catch {}
    }
    if (-not $ready) { throw 'Local AI did not start. See ai-server-error.log.' }
}
$models = Invoke-RestMethod 'http://127.0.0.1:11435/api/tags' -TimeoutSec 5
if (-not ($models.models | Where-Object { $_.name -eq 'qwen2.5-coder:3b' })) {
    & $ollamaExe pull 'qwen2.5-coder:3b'
    if ($LASTEXITCODE -ne 0) { throw 'Model download failed. Check the internet connection and retry.' }
}
Write-Host 'Local SQL AI is ready. Open MySQL Workbench > Tools > SQL AI.'

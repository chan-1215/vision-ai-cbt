$ErrorActionPreference = 'Stop'
$taskRoot = $PSScriptRoot
$moduleDir = Join-Path $env:APPDATA 'MySQL\Workbench\modules'
New-Item -ItemType Directory -Path $moduleDir -Force | Out-Null
$plugin = Join-Path $moduleDir 'mysql_korean_ai_grt.py'
if (Test-Path -LiteralPath $plugin) {
    Copy-Item -LiteralPath $plugin -Destination ($plugin + '.backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
}
Copy-Item -LiteralPath (Join-Path $taskRoot 'mysql_korean_ai_grt.py') -Destination $plugin -Force
$config = @{root=$taskRoot} | ConvertTo-Json
[IO.File]::WriteAllText((Join-Path $moduleDir 'mysql_korean_ai_config.json'), $config, [Text.UTF8Encoding]::new($false))
Write-Host 'Installed. Restart MySQL Workbench to load Tools > SQL AI.'

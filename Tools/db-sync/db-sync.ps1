# NaturDex · db-sync (envoltorio PowerShell)
# Reenvía a Tools/db-sync/db-sync.js con Node. Uso:  .\Tools\db-sync\db-sync.ps1 status
$ErrorActionPreference = 'Stop'
$script = Join-Path $PSScriptRoot 'db-sync.js'
$node = (Get-Command node -ErrorAction SilentlyContinue)
if (-not $node) {
    $candidate = 'C:\Program Files\nodejs\node.exe'
    if (Test-Path $candidate) { $node = $candidate } else {
        Write-Error 'No se encuentra Node.js en el PATH. Instálalo o añade C:\Program Files\nodejs al PATH.'
        exit 1
    }
} else { $node = $node.Source }
& $node $script @args
exit $LASTEXITCODE

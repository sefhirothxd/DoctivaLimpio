# ------------------------------------------------------------------
# Genera un paquete de entrega limpio (solo código fuente).
# Excluye: node_modules, dist, .git, .env y zips previos.
# Uso:  powershell -ExecutionPolicy Bypass -File scripts\pack.ps1
# ------------------------------------------------------------------
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$out   = Join-Path $root "intranet-handoff-$stamp.zip"

$excluidos = @('node_modules', 'dist', '.git', '.env')
$items = Get-ChildItem -Force | Where-Object {
    $_.Name -notin $excluidos -and
    $_.Name -notlike '*.zip' -and
    $_.Name -notlike '*.tar.gz'
}

Compress-Archive -Path $items.FullName -DestinationPath $out -Force

$mb = [math]::Round((Get-Item $out).Length / 1MB, 2)
Write-Host ''
Write-Host "✔ Paquete listo: $out ($mb MB)" -ForegroundColor Green
Write-Host '  Contiene solo código fuente, esquema SQL y documentación.'
Write-Host '  Quien lo reciba debe ejecutar: npm install && npm run dev'

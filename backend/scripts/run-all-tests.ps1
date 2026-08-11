# scripts/run-all-tests.ps1
# ============================================================
# Script PowerShell para ejecutar TODAS las pruebas (Unit, QA, Int)
# BD SQLite aislada se crea y se limpia automaticamente.
# Genera un reporte HTML global unificado.
# ============================================================

$ErrorActionPreference = "Stop"
$BackendDir   = Split-Path -Parent $PSScriptRoot
$ReportDir    = Join-Path $BackendDir "test-reports"
$DbFile       = Join-Path $BackendDir "prisma\test.db"

# -- COLORES --------------------------------------------------
function Write-Header  { param($msg) Write-Host "`n$msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "  [!]  $msg" -ForegroundColor Yellow }
function Write-Fail    { param($msg) Write-Host "  [X]  $msg" -ForegroundColor Red }
function Write-Info    { param($msg) Write-Host "  [i]  $msg" -ForegroundColor Gray }

# -- BANNER ---------------------------------------------------
Write-Host ""
Write-Host "  ==================================================" -ForegroundColor Magenta
Write-Host "      FoamWash - REPORTE GLOBAL DE PRUEBAS" -ForegroundColor Magenta
Write-Host "     Unitarias + Calidad + Integracion (SQLite)" -ForegroundColor Magenta
Write-Host "  ==================================================" -ForegroundColor Magenta
Write-Host ""


# -- CREAR DIRECTORIO DE REPORTES ------------------------------
Write-Header "[ 1/4 ] Preparando directorio de reportes..."

if (-not (Test-Path $ReportDir)) {
    New-Item -ItemType Directory -Path $ReportDir | Out-Null
    Write-Success "Directorio creado: test-reports/"
}
else {
    Write-Success "Directorio listo: test-reports/"
}

# -- GENERAR CLIENTE PRISMA SQLITE -----------------------------
Write-Header "[ 2/4 ] Generando cliente Prisma para SQLite (Pruebas de Integracion)..."

Set-Location $BackendDir

try {
    Write-Info "Ejecutando: npx prisma generate --schema=prisma/schema.test.prisma"
    npx prisma generate --schema=prisma/schema.test.prisma
    if ($LASTEXITCODE -ne 0) { throw "prisma generate fallo" }
    Write-Success "Cliente Prisma SQLite generado correctamente."
}
catch {
    Write-Fail "Error generando cliente Prisma: $_"
    exit 1
}

Write-Info "Ejecutando: npx prisma db push --schema=prisma/schema.test.prisma --force-reset"
try {
    npx prisma db push --schema=prisma/schema.test.prisma --force-reset --accept-data-loss
    if ($LASTEXITCODE -ne 0) { throw "prisma db push fallo" }
    Write-Success "Base de datos SQLite de testing creada/actualizada."
}
catch {
    Write-Fail "Error creando BD SQLite: $_"
    exit 1
}

# -- EJECUTAR PRUEBAS ------------------------------------------
Write-Header "[ 3/4 ] Ejecutando TODAS las pruebas en secuencia (--runInBand)..."
Write-Info "Esto ejecutara unitarias, calidad e integracion. Puede tardar un par de minutos..."
Write-Host ""

$fechaReporte = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$nombreArchivo = "foamwash-global-report-$fechaReporte.html"
$reportePath  = Join-Path $ReportDir $nombreArchivo

# Pasamos el nombre del reporte al config de jest-html-reporters
$env:JEST_HTML_REPORTERS_FILE_NAME = $nombreArchivo

$startTime = Get-Date

try {
    # Usamos --runInBand para que las pruebas de integración (y unitarias) corran secuencialmente y no bloqueen la BD
    # --json --outputFile extrae los resultados crudos para que el reporte ejecutivo los lea
    npx jest --config=jest.config.js --runInBand --forceExit --detectOpenHandles --json --outputFile=test-reports/test-results.json
    $exitCode = $LASTEXITCODE
}
catch {
    $exitCode = 1
}

$duracion = (Get-Date) - $startTime
$segundos = [Math]::Round($duracion.TotalSeconds, 1)

Write-Host ""

if ($exitCode -eq 0) {
    Write-Header "[ 4/4 ] Resultado: [OK] TODAS LAS PRUEBAS PASARON"
    Write-Success "Duracion total: ${segundos}s"
}
else {
    Write-Header "[ 4/4 ] Resultado: [X] ALGUNAS PRUEBAS FALLARON"
    Write-Fail "Duracion total: ${segundos}s - Revisa el reporte global para mas detalles."
}

# -- LIMPIEZA DE BD --------------------------------------------
Write-Info "Limpiando base de datos de pruebas (test.db)..."
if (Test-Path $DbFile) {
    Remove-Item -Path $DbFile -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "$DbFile-journal" -Force -ErrorAction SilentlyContinue
    Write-Success "Base de datos de pruebas eliminada."
}

# -- MOSTRAR REPORTE EJECUTIVO --------------------------------
if (Test-Path $reportePath) {
    # 1. Traducir el reporte tecnico (opcionalmente lo dejamos guardado)
    node scripts/translate-report.js $reportePath
    
    Write-Success "Reporte global traducido exitosamente."
    Write-Host ""
    Write-Host "  Abriendo Reporte Global en el navegador..." -ForegroundColor Cyan
    Start-Process $reportePath
}
else {
    Write-Warning "No se encontro el reporte HTML en: $reportePath"
    Write-Info "Busca el reporte mas reciente en: $ReportDir"
}

Write-Host ""
exit $exitCode

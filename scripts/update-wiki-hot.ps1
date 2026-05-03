# DIVINIA — Auto-update wiki/hot.md
# Ejecuta diariamente via Windows Task Scheduler
# Lee estado real de Supabase + git log y actualiza la fecha del hot cache

$VAULT = "c:\Users\divin\OneDrive\Desktop\chatbots plantillas"
$HOT = "$VAULT\wiki\hot.md"
$DIVINIA = "C:\divinia"
$LOG = "C:\divinia\scripts\update-wiki.log"

function Write-Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$ts — $msg" | Tee-Object -FilePath $LOG -Append | Write-Host
}

Write-Log "Iniciando auto-update del hot cache..."

# 1. Actualizar fecha en el frontmatter
$today = Get-Date -Format "yyyy-MM-dd"
$content = Get-Content $HOT -Raw -Encoding UTF8

if ($content -match 'updated: \d{4}-\d{2}-\d{2}') {
    $content = $content -replace 'updated: \d{4}-\d{2}-\d{2}', "updated: $today"
    Set-Content -Path $HOT -Value $content -Encoding UTF8 -NoNewline
    Write-Log "Fecha actualizada a $today"
} else {
    Write-Log "ERROR: No se encontró el campo 'updated:' en hot.md"
    exit 1
}

# 2. Registrar último commit de C:/divinia en el log
try {
    $lastCommit = git -C $DIVINIA log -1 --format="%h %s (%cr)" 2>&1
    Write-Log "Último commit divinia: $lastCommit"
} catch {
    Write-Log "No se pudo leer git log: $_"
}

Write-Log "Hot cache actualizado correctamente."
Write-Log "---"

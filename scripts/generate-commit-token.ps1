$bytes = [byte[]]::new(32)
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$token = -join ($bytes | ForEach-Object { "{0:x2}" -f $_ })
$rng.Dispose()

Write-Host "Generated SYNC_DEMO_COMMIT_TOKEN: $token" -ForegroundColor Cyan

if (Test-Path ".env.local") {
    $content = Get-Content ".env.local"
    if ($content -match "^SYNC_DEMO_COMMIT_TOKEN=") {
        $content = $content -replace "^SYNC_DEMO_COMMIT_TOKEN=.*$", "SYNC_DEMO_COMMIT_TOKEN=$token"
        Set-Content -Path ".env.local" -Value $content
    } else {
        Add-Content -Path ".env.local" -Value "SYNC_DEMO_COMMIT_TOKEN=$token"
    }
    Write-Host "[OK] Added SYNC_DEMO_COMMIT_TOKEN to .env.local" -ForegroundColor Green
}

return $token

param(
    [Parameter(Mandatory = $false)]
    [string]$VideoPath = ".\public\sample_reference.mp4"
)

$ErrorActionPreference = "Stop"

$baseUrl = if ($env:SYNC_API_BASE_URL) { $env:SYNC_API_BASE_URL.TrimEnd("/") } else { "https://api.sync.so/v2" }

if (-not $env:SYNC_API_KEY) {
    if (Test-Path ".env.local") {
        $envMatch = Get-Content ".env.local" | Where-Object { $_ -match "^SYNC_API_KEY=(.+)$" } | Select-Object -First 1
        if ($envMatch -match "^SYNC_API_KEY=(.+)$") {
            $env:SYNC_API_KEY = $matches[1].Trim()
        }
    }
}

if (-not $env:SYNC_API_KEY) {
    throw "SYNC_API_KEY is not set. Put the rotated key in .env.local or the current shell."
}

$resolvedPath = Resolve-Path $VideoPath
$file = Get-Item $resolvedPath

$contentType = switch ($file.Extension.ToLowerInvariant()) {
    ".mp4" { "video/mp4" }
    ".mov" { "video/quicktime" }
    default { throw "Unsupported video extension '$($file.Extension)'. Use the raw MP4 or MOV downloaded from Sync." }
}

if ($file.Length -lt 10000) {
    throw "The file is unexpectedly small: $($file.Length) bytes."
}

# Optional local media validation.
$ffprobe = Get-Command "ffprobe" -ErrorAction SilentlyContinue
if ($ffprobe) {
    $probeJson = & ffprobe `
        -v error `
        -show_entries "format=duration,size" `
        -show_entries "stream=codec_type,codec_name,width,height" `
        -of json `
        $file.FullName | Out-String
    $probe = $probeJson | ConvertFrom-Json
    $videoStream = $probe.streams | Where-Object { $_.codec_type -eq "video" } | Select-Object -First 1
    if (-not $videoStream) {
        throw "The selected file does not contain a video stream."
    }
    $duration = [double]$probe.format.duration
    if ($duration -le 0) {
        throw "The selected video has zero or invalid duration."
    }
    Write-Host "Local validation passed:"
    Write-Host " Duration: $duration seconds"
    Write-Host " Codec: $($videoStream.codec_name)"
    Write-Host " Size: $($file.Length) bytes"
} else {
    Write-Warning "ffprobe is not installed. Continuing with file-size validation only."
}

$authHeaders = @{
    "x-api-key" = $env:SYNC_API_KEY
}

# STEP 1: Request one presigned upload URL.
Write-Host "[Step 1/4] Requesting presigned upload URL..."
$presignPayload = @{
    fileName    = $file.Name
    contentType = $contentType
    size        = [int64]$file.Length
} | ConvertTo-Json

$presign = Invoke-RestMethod `
    -Method POST `
    -Uri "$baseUrl/assets/upload" `
    -Headers $authHeaders `
    -ContentType "application/json" `
    -Body $presignPayload

if (-not $presign.uploadUrl -or -not $presign.url) {
    throw "Sync did not return the expected uploadUrl and canonical url."
}

# STEP 2: Upload the bytes.
# IMPORTANT:
# - Do not add x-api-key to this PUT.
# - Content-Type must exactly match the presign request.
Write-Host "[Step 2/4] Uploading raw video bytes via HTTP PUT..."
Invoke-WebRequest `
    -Method PUT `
    -Uri $presign.uploadUrl `
    -InFile $file.FullName `
    -ContentType $contentType `
    -UseBasicParsing | Out-Null

# STEP 3: Register the uploaded file as a reusable VIDEO asset.
Write-Host "[Step 3/4] Registering reusable VIDEO asset..."
$registrationPayload = @{
    url        = $presign.url
    type       = "VIDEO"
    name       = $file.Name
    visibility = "USER"
} | ConvertTo-Json

$asset = Invoke-RestMethod `
    -Method POST `
    -Uri "$baseUrl/assets" `
    -Headers $authHeaders `
    -ContentType "application/json" `
    -Body $registrationPayload

if (-not $asset.id) {
    throw "Sync registered the upload but did not return an asset ID."
}

# STEP 4: Verify the registered asset before accepting it.
Write-Host "[Step 4/4] Verifying registered asset metadata..."
$verified = Invoke-RestMethod `
    -Method GET `
    -Uri "$baseUrl/assets/$($asset.id)" `
    -Headers $authHeaders

if ($verified.type -ne "VIDEO") {
    throw "Registered asset type is '$($verified.type)', expected VIDEO."
}
if ([int64]$verified.size -lt 10000) {
    throw "Registered asset has an invalid size: $($verified.size) bytes."
}
if ($null -ne $verified.durationSeconds -and [double]$verified.durationSeconds -le 0) {
    throw "Registered asset has zero or invalid duration."
}

Write-Host ""
Write-Host "SUCCESS: reusable Sync VIDEO asset registered." -ForegroundColor Green
Write-Host "Asset ID: $($verified.id)" -ForegroundColor Cyan
Write-Host "Name: $($verified.name)"
Write-Host "Format: $($verified.format)"
Write-Host "Duration: $($verified.durationSeconds)"
Write-Host "Size: $($verified.size)"
Write-Host ""
Write-Host "Add this value to .env.local:"
Write-Host "SYNC_BASE_VIDEO_ASSET_ID=$($verified.id)"

if (Test-Path ".env.local") {
    $content = Get-Content ".env.local"
    if ($content -match "^SYNC_BASE_VIDEO_ASSET_ID=") {
        $content = $content -replace "^SYNC_BASE_VIDEO_ASSET_ID=.*$", "SYNC_BASE_VIDEO_ASSET_ID=$($verified.id)"
        Set-Content -Path ".env.local" -Value $content
    } else {
        Add-Content -Path ".env.local" -Value "SYNC_BASE_VIDEO_ASSET_ID=$($verified.id)"
    }
    Write-Host "[OK] Persisted SYNC_BASE_VIDEO_ASSET_ID into .env.local" -ForegroundColor Green
}

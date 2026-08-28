$ErrorActionPreference = "Stop"
$repository = "B-Divyesh/sf-local-live-captions"
$release = Invoke-RestMethod -Headers @{ Accept = "application/vnd.github+json" } -Uri "https://api.github.com/repos/$repository/releases/latest"
$asset = $release.assets | Where-Object { $_.name -match '\.(msi|exe)$' } | Select-Object -First 1
$checksums = $release.assets | Where-Object { $_.name -eq "SHA256SUMS" } | Select-Object -First 1
if (-not $asset -or -not $checksums) { throw "The Windows download is not published yet. Visit https://github.com/$repository/releases" }
$folder = Join-Path $env:TEMP ("local-live-captions-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $folder | Out-Null
try {
  $target = Join-Path $folder $asset.name
  Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $target
  $sumFile = Join-Path $folder "SHA256SUMS"
  Invoke-WebRequest -Uri $checksums.browser_download_url -OutFile $sumFile
  $expected = ((Get-Content $sumFile | Where-Object { $_ -match [regex]::Escape($asset.name) }) -split ' ')[0]
  $actual = (Get-FileHash -Algorithm SHA256 $target).Hash.ToLower()
  if (-not $expected -or $actual -ne $expected.ToLower()) { throw "Checksum did not match. Nothing was installed." }
  Start-Process -FilePath $target -Wait
  Write-Host "Verified and opened the Local Live Captions installer."
} finally {
  Remove-Item -Recurse -Force $folder
}

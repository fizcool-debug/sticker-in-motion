param(
    [Parameter(Mandatory = $true)][ValidatePattern('^\d+\.\d+(\.\d+)?$')][string]$Version,
    [Parameter(Mandatory = $true)][string]$ApkPath,
    [Parameter(Mandatory = $true)][ValidatePattern('^[0-9a-f]{40}$')][string]$TargetCommit,
    [Parameter(Mandatory = $true)][string]$NotesFile
)
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$repository = 'fizcool-debug/sticker-in-motion'
$apiRoot = "https://api.github.com/repos/$repository"
$tag = "v$Version"
$apk = Get-Item -LiteralPath $ApkPath
if ($apk.Extension -ne '.apk' -or $apk.Length -eq 0) { throw 'Supply a nonempty APK.' }
$hash = (Get-FileHash -LiteralPath $apk.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
$assetName = "Sticker-in-Motion-$tag.apk"
$notes = Get-Content -LiteralPath $NotesFile -Raw
$body = "$notes`n`nAPK SHA-256: ``$hash``"

# Use normal Git authentication without saving or printing credentials.
$token = $env:GH_TOKEN
if (-not $token) {
    $credential = @('protocol=https', 'host=github.com', 'username=fizcool-debug', '') |
        git -c credential.interactive=false credential fill
    if ($LASTEXITCODE) { throw 'GitHub authentication is unavailable. Sign in with Git Credential Manager or set GH_TOKEN.' }
    $password = $credential | Where-Object { $_ -like 'password=*' } | Select-Object -First 1
    if (-not $password) { throw 'GitHub authentication is unavailable.' }
    $token = $password.Substring(9)
}
$headers = @{ Authorization = "Bearer $token"; Accept = 'application/vnd.github+json'; 'X-GitHub-Api-Version' = '2022-11-28' }
function Invoke-GithubJson([string]$Method, [string]$Uri, $Payload) {
    $request = @{ Method = $Method; Uri = $Uri; Headers = $headers }
    if ($null -ne $Payload) {
        $request.ContentType = 'application/json; charset=utf-8'
        $request.Body = [Text.Encoding]::UTF8.GetBytes(($Payload | ConvertTo-Json -Depth 10))
    }
    Invoke-RestMethod @request
}
$repo = Invoke-GithubJson GET $apiRoot $null
if ($repo.full_name -ne $repository -or -not $repo.private) { throw 'Expected the private sticker-in-motion repository.' }
$commit = Invoke-GithubJson GET "$apiRoot/commits/$TargetCommit" $null
if ($commit.sha -ne $TargetCommit) { throw 'The source commit is not available on GitHub.' }
# The tag lookup returns drafts visible to the authenticated owner as well.
$release = $null
try { $release = Invoke-GithubJson GET "$apiRoot/releases/tags/$tag" $null }
catch { if ([int]$_.Exception.Response.StatusCode -ne 404) { throw } }
if (-not $release) {
    $release = Invoke-GithubJson POST "$apiRoot/releases" @{
        tag_name = $tag; target_commitish = $TargetCommit; name = "Sticker in Motion $tag"
        body = $body; draft = $true; prerelease = $false
    }
}
if ($release.tag_name -ne $tag) { throw 'Release tag mismatch.' }
$asset = $release.assets | Where-Object { $_.name -eq $assetName } | Select-Object -First 1
if (-not $asset) {
    if (-not $release.draft) { throw 'Refusing to modify an already published release.' }
    $uploadBase = $release.upload_url -replace '\{.*$', ''
    $uploadUri = [Uri]($uploadBase + '?name=' + [Uri]::EscapeDataString($assetName))
    if ($uploadUri.Scheme -ne 'https' -or $uploadUri.Host -ne 'uploads.github.com') { throw 'Unexpected upload destination.' }
    $asset = Invoke-RestMethod -Method POST -Uri $uploadUri -Headers $headers -ContentType 'application/vnd.android.package-archive' -InFile $apk.FullName
}
if ($asset.state -ne 'uploaded' -or $asset.size -ne $apk.Length -or $asset.digest -ne "sha256:$hash") {
    throw 'Uploaded APK verification failed. The draft has not been published.'
}
if ($release.draft) {
    $release = Invoke-GithubJson PATCH "$apiRoot/releases/$($release.id)" @{
        body = $body; draft = $false; prerelease = $false; make_latest = 'true'
    }
}
$verified = Invoke-GithubJson GET "$apiRoot/releases/tags/$tag" $null
$verifiedAsset = $verified.assets | Where-Object { $_.name -eq $assetName } | Select-Object -First 1
if ($verified.draft -or $verifiedAsset.size -ne $apk.Length -or $verifiedAsset.digest -ne "sha256:$hash") {
    throw 'Published release verification failed.'
}
[PSCustomObject]@{ Release = $verified.html_url; Asset = $verifiedAsset.browser_download_url; Bytes = $apk.Length; SHA256 = $hash }

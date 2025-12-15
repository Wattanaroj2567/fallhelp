# PowerShell Script: Analyze Git Changes and Group by Feature
# Usage: .\scripts\analyze-changes.ps1

Write-Host "=== FallHelp Git Changes Analysis ===" -ForegroundColor Cyan
Write-Host ""

# Get all changed files
$changedFiles = git status --porcelain | ForEach-Object {
    $line = $_.Trim()
    if ($line -match '^(\?\?| M|M |MM|A |D )\s+(.+)$') {
        [PSCustomObject]@{
            Status = $matches[1].Trim()
            File = $matches[2]
        }
    }
}

Write-Host "Total files changed: $($changedFiles.Count)" -ForegroundColor Yellow
Write-Host ""

# Group by feature/type
$groups = @{
    "Documentation" = @()
    "Mobile - Error Handling" = @()
    "Mobile - Type Safety" = @()
    "Mobile - Security/State" = @()
    "Mobile - Components" = @()
    "Backend - Services" = @()
    "Backend - Controllers" = @()
    "Backend - IoT" = @()
    "Backend - Routes" = @()
    "Backend - Tests" = @()
    "Admin - Components" = @()
    "Admin - Hooks" = @()
    "Admin - Pages" = @()
    "Arduino" = @()
    "Config" = @()
    "Other" = @()
}

foreach ($file in $changedFiles) {
    $path = $file.File
    
    if ($path -match '\.md$|^docs/|^CHANGELOG|^AGENT\.md') {
        $groups["Documentation"] += $file
    }
    elseif ($path -match '^mobile/services/api\.ts$|^mobile/utils/errorHelper\.ts$') {
        $groups["Mobile - Error Handling"] += $file
    }
    elseif ($path -match '^mobile/hooks/useSafeRouter|^mobile/components/Bounceable') {
        $groups["Mobile - Type Safety"] += $file
    }
    elseif ($path -match '^mobile/context/AuthContext|^mobile/hooks/useProtectedRoute') {
        $groups["Mobile - Security/State"] += $file
    }
    elseif ($path -match '^mobile/app/.*\.tsx$') {
        $groups["Mobile - Components"] += $file
    }
    elseif ($path -match '^backend/src/services/') {
        $groups["Backend - Services"] += $file
    }
    elseif ($path -match '^backend/src/controllers/') {
        $groups["Backend - Controllers"] += $file
    }
    elseif ($path -match '^backend/src/iot/') {
        $groups["Backend - IoT"] += $file
    }
    elseif ($path -match '^backend/src/routes/|^backend/src/app\.ts|^backend/src/server\.ts') {
        $groups["Backend - Routes"] += $file
    }
    elseif ($path -match '^backend/src/__tests__/') {
        $groups["Backend - Tests"] += $file
    }
    elseif ($path -match '^admin/src/components/') {
        $groups["Admin - Components"] += $file
    }
    elseif ($path -match '^admin/src/hooks/') {
        $groups["Admin - Hooks"] += $file
    }
    elseif ($path -match '^admin/src/pages/|^admin/src/services/|^admin/src/context/') {
        $groups["Admin - Pages"] += $file
    }
    elseif ($path -match '^arduino/') {
        $groups["Arduino"] += $file
    }
    elseif ($path -match 'package\.json|package-lock\.json|\.gitignore|tsconfig|vite\.config') {
        $groups["Config"] += $file
    }
    else {
        $groups["Other"] += $file
    }
}

# Display grouped results
foreach ($groupName in $groups.Keys | Sort-Object) {
    $files = $groups[$groupName]
    if ($files.Count -gt 0) {
        Write-Host "`n[$groupName]" -ForegroundColor Green
        Write-Host "  Files: $($files.Count)" -ForegroundColor Gray
        foreach ($file in $files | Select-Object -First 5) {
            Write-Host "    $($file.Status) $($file.File)" -ForegroundColor White
        }
        if ($files.Count -gt 5) {
            Write-Host "    ... and $($files.Count - 5) more" -ForegroundColor DarkGray
        }
    }
}

Write-Host "`n=== Suggested Commit Groups ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Documentation & Config:" -ForegroundColor Yellow
Write-Host "   git add AGENT.md CHANGELOG.md docs/ .gitignore package*.json"
Write-Host ""
Write-Host "2. Mobile Error Handling:" -ForegroundColor Yellow
Write-Host "   git add mobile/services/api.ts mobile/utils/errorHelper.ts"
Write-Host ""
Write-Host "3. Mobile Components:" -ForegroundColor Yellow
Write-Host "   git add mobile/app/**/*.tsx"
Write-Host ""
Write-Host "4. Backend Services:" -ForegroundColor Yellow
Write-Host "   git add backend/src/services/ backend/src/controllers/"
Write-Host ""
Write-Host "5. Admin New Features:" -ForegroundColor Yellow
Write-Host "   git add admin/src/components/ admin/src/hooks/"


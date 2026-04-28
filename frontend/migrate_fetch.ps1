$compDir = "src\components"
$files = Get-ChildItem -Path $compDir -Filter "*.tsx"

foreach ($file in $files) {
    $path = $file.FullName
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

    if ($content.Contains("await fetch(")) {
        if (-not $content.Contains("from '../api'")) {
            $content = "import { apiFetch } from '../api';" + [System.Environment]::NewLine + $content
        }
        $content = $content.Replace("await fetch(", "await apiFetch(")
        [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Updated component: $($file.Name)"
    }
}
Write-Host "Components migration complete."

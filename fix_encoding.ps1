$htmlFiles = Get-ChildItem -Path d:\xdddddddddddd\Kentakitos-1\src\main\resources\static -Recurse -Include index.html

foreach ($file in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    if ($content -match 'Cerrar SesiÃ³n') {
        $content = $content -replace 'Cerrar SesiÃ³n', 'Cerrar Sesión'
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
    }
}
Write-Output "Encoding fixed"

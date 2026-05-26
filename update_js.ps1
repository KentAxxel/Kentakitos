$jsFiles = Get-ChildItem -Path d:\xdddddddddddd\Kentakitos-1\src\main\resources\static -Recurse -Include app.js | Where-Object { $_.FullName -notmatch '\\js\\app\.js$' }

$dropdownCode = @"
document.addEventListener('DOMContentLoaded', () => {
    // Dropdown Profile logic
    const btnProfileDropdown = document.getElementById('btnProfileDropdown');
    const profileDropdown = document.getElementById('profileDropdown');
    const headerUsername = document.getElementById('headerUsername');
    
    const usStr = localStorage.getItem('usuario');
    if (usStr && headerUsername) {
        try {
            const us = JSON.parse(usStr);
            headerUsername.textContent = us.nombreCompleto || us.username;
        } catch(e) {}
    }

    if (btnProfileDropdown && profileDropdown) {
        btnProfileDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
        document.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
        });
    }

    const btnLogoutAction = document.getElementById('btnLogoutAction');
    if (btnLogoutAction) {
        btnLogoutAction.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm("¿Deseas cerrar sesión?")) {
                const tk = localStorage.getItem('jwtToken');
                if (tk) {
                    try {
                        await fetch('http://127.0.0.1:8080/api/auth/logout', {
                            method: 'POST',
                            headers: { 'Authorization': 'Bearer ' + tk }
                        });
                    } catch(e) {}
                }
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('usuario');
                window.location.href = '/login-oauth.html';
            }
        });
    }
});
"@

foreach ($file in $jsFiles) {
    # Evitar duplicados
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if (-not $content.Contains('btnProfileDropdown')) {
        $content += "`r`n" + $dropdownCode
        [System.IO.File]::WriteAllText($file.FullName, $content)
    }
}
Write-Output "JS updated"

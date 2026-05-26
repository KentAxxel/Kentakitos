$htmlFiles = Get-ChildItem -Path d:\xdddddddddddd\Kentakitos-1\src\main\resources\static -Recurse -Include index.html

foreach ($file in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    
    # Remove existing header-actions if it exists
    $content = $content -replace '(?s)\s*<div class="header-actions">.*?</div>', ''
    
    # Insert new header actions before </header>
    $headerActions = @"
                
                <div class="header-actions">
                    <button class="profile-btn">
                        <i class='bx bx-bell'></i>
                    </button>
                    
                    <div class="profile-menu">
                        <button class="profile-btn" id="btnProfileDropdown">
                            <span id="headerUsername" class="header-username">Usuario</span>
                            <i class='bx bx-user'></i>
                        </button>
                        <div class="dropdown-content" id="profileDropdown">
                            <a href="#" id="btnLogoutAction"><i class='bx bx-log-out'></i> Cerrar Sesión</a>
                        </div>
                    </div>
                </div>
"@
    $content = $content -replace '</header>', ($headerActions + "`r`n            </header>")
    [System.IO.File]::WriteAllText($file.FullName, $content)
}
Write-Output "Done updating headers"

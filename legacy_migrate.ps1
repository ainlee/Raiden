<# 
玩家自機素材遷移腳本
功能：
1. 自動識別舊版素材結構
2. 轉換為統一目錄結構
3. 生成預設config.json
4. 建立符號連結保持兼容性
#>

# 設定路徑參數
$oldSpritesPath = "public/assets/sprites"
$newPlayersPath = "public/assets/players"

# 建立目標目錄結構
$models = @("MKII", "MADshark")
foreach ($model in $models) {
    $modelPath = Join-Path $newPlayersPath "Raiden-$model"
    New-Item -ItemType Directory -Force -Path $modelPath | Out-Null
    New-Item -ItemType Directory -Force -Path (Join-Path $modelPath "variants") | Out-Null
}

# 遷移素材檔案並建立符號連結
Get-ChildItem -Path $oldSpritesPath -Filter "Raiden-*" | ForEach-Object {
    $fileName = $_.Name
    $isConfig = $_.Extension -eq ".json"
    
    # 解析機體型號與玩家類型
    if ($fileName -match 'Raiden-(?<model>\w+)(-(?<player>\dP))?') {
        $model = $matches['model']
        $player = $matches['player']
        
        $targetDir = Join-Path $newPlayersPath "Raiden-$model"
        $variantDir = Join-Path $targetDir "variants"
        
        if ($player) {
            # 處理玩家變體
            $newName = if ($isConfig) { "config.json" } else { "$player.png" }
            $destPath = Join-Path $variantDir $newName
        } else {
            # 處理基礎素材
            $newName = if ($isConfig) { "config.json" } else { "base.png" }
            $destPath = Join-Path $targetDir $newName
        }
        
        # 移動檔案並建立符號連結
        Move-Item -Path $_.FullName -Destination $destPath -Force
        New-Item -ItemType SymbolicLink -Path $_.FullName -Target $destPath | Out-Null
    }
}

# 生成預設config.json
Get-ChildItem -Path $newPlayersPath -Directory | ForEach-Object {
    $configPath = Join-Path $_.FullName "config.json"
    if (-not (Test-Path $configPath)) {
        @{
            name = $_.Name
            baseTexture = "base.png"
            variants = @()
        } | ConvertTo-Json | Out-File $configPath
    }
}

Write-Host "遷移完成！舊路徑符號連結已建立。"
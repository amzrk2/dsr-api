# the first time you do scripting,
# you will need to set the appropriate security settings
# Run PowerShell as administrator and type:
# set-executionpolicy remotesigned

Write-Host "ready to process JSON files..."
Pause
node "./_scripts/stringify.js"

Write-Host "ready to commit and push..."
Pause

git add .
$nowTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss K"
git commit -m $nowTime
git pull --rebase
git push origin
Write-Host "finished..."
Pause

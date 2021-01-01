# the first time you do scripting,
# you will need to set the appropriate security settings
# Run PowerShell as administrator and type:
# set-executionpolicy remotesigned

Write-Host "Ready to process JSON files..."
Pause
node "./stringify.js"

Write-Host "Ready to commit and push..."
Pause

git add .
$nowTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss K"
git commit -m $nowTime
git push origin
Write-Host "Finished..."
Pause

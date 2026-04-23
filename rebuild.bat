@echo off
chcp 65001 >nul
if exist dist rmdir /s /q dist
call npm run build
echo [OK] 已重建
pause

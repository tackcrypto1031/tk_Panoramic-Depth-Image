@echo off
chcp 65001 >nul
setlocal
title tk_depthimg

echo === tk_depthimg ===

where node >nul 2>nul
if errorlevel 1 (
  echo [X] 找不到 Node.js，請安裝 https://nodejs.org/
  start https://nodejs.org/
  pause
  exit /b 1
)

node scripts\check-node.cjs
if errorlevel 1 (
  echo [X] Node 版本需要 20 以上
  pause
  exit /b 1
)

echo [OK] Node ^& npm:
node -v
call npm -v

if not exist node_modules (
  echo [...] 安裝依賴中（第一次執行需要幾分鐘）...
  call npm install
  if errorlevel 1 (
    echo [X] npm install 失敗
    pause
    exit /b 1
  )
)

if not exist data\items.json (
  echo [...] 初始化 data 目錄...
  node scripts\init-data.cjs
)

node scripts\check-build.cjs
if errorlevel 1 (
  echo [...] 建置中（初次或版本變更）...
  call npm run build
  if errorlevel 1 (
    echo [X] 建置失敗
    pause
    exit /b 1
  )
)

node scripts\check-health.cjs
if not errorlevel 1 (
  echo [OK] Server 已在執行，開啟瀏覽器
  start http://localhost:3001
  exit /b 0
)

echo [...] 啟動 server...
start "tk_depthimg server" /min cmd /c "node dist\server\index.js"
timeout /t 2 /nobreak >nul
start http://localhost:3001
exit /b 0

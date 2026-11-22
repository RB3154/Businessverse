@echo off
REM Double-click to run The Businessverse on the presentation laptop (no internet needed).
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies - this needs internet once...
  call npm install
)
if not exist dist\index.html (
  echo Building the presentation...
  call npm run build
)
echo Opening The Businessverse at http://localhost:4173  -  press F for fullscreen.
call npx vite preview --port 4173 --strictPort --open

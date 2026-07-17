$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$python = Join-Path $root ".venv\Scripts\python.exe"

if (!(Test-Path $python)) {
  Write-Host "Python virtual environment was not found. Run the setup steps in README.md first." -ForegroundColor Red
  exit 1
}

Copy-Item (Join-Path $root ".env.sqlite.example") (Join-Path $root ".env") -Force

Push-Location $backend
& $python -m app.init_dev_db
Pop-Location

Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$backend`" && `"$python`" -m uvicorn app.main:app --host 127.0.0.1 --port 8000" -WindowStyle Minimized
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$frontend`" && npm.cmd run dev -- --hostname 127.0.0.1 --port 3000" -WindowStyle Minimized

Write-Host "Demo is starting..." -ForegroundColor Green
Write-Host "Frontend: http://127.0.0.1:3000/login"
Write-Host "Backend API: http://127.0.0.1:8000/docs"
Write-Host "Login: admin@example.com / Admin123!"

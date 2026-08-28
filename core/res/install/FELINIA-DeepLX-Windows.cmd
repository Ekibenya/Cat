@echo off
setlocal EnableExtensions
title FELINIA 本地翻译安装

set "DLX_VERSION=v1.2.4"
set "DLX_ASSET=deeplx_windows_amd64.exe"
set "DLX_SHA256=a8771e64d561a94506fb4aea0cb375bd5f5a09fbf810eddc5b6c23e647c4ba6b"
if /I "%PROCESSOR_ARCHITECTURE%"=="x86" (
  set "DLX_ASSET=deeplx_windows_386.exe"
  set "DLX_SHA256=0fe1ff0b94fe9c5f0f5265845aa161c73ba39ed9fb17808b57b3899e45267e78"
)

set "DLX_ROOT=%LOCALAPPDATA%\FELINIA\DLX"
set "DLX_BINARY=%DLX_ROOT%\deeplx.exe"
set "DLX_TEMP=%TEMP%\felinia-deeplx-download.exe"
set "DLX_START=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\FELINIA-DLX.cmd"
set "DLX_URL=https://github.com/OwO-Network/DLX/releases/download/%DLX_VERSION%/%DLX_ASSET%"

echo 正在下载安装本地翻译服务…
if not exist "%DLX_ROOT%" mkdir "%DLX_ROOT%"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Invoke-WebRequest -UseBasicParsing -Uri '%DLX_URL%' -OutFile '%DLX_TEMP%'; if ((Get-FileHash -Algorithm SHA256 '%DLX_TEMP%').Hash.ToLower() -ne '%DLX_SHA256%') { throw '安装文件校验失败' }; Move-Item -Force '%DLX_TEMP%' '%DLX_BINARY%'"
if errorlevel 1 goto failed

> "%DLX_START%" echo @echo off
>> "%DLX_START%" echo start "" /min "%DLX_BINARY%" -ip 127.0.0.1 -port 1188
start "" /min "%DLX_BINARY%" -ip 127.0.0.1 -port 1188
timeout /t 2 /nobreak >nul

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 -Uri 'http://127.0.0.1:1188/' | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 goto failed

echo.
echo 安装完成。本地翻译服务已经启动，以后登录 Windows 会自动启动。
pause
exit /b 0

:failed
echo.
echo 安装没有完成，请检查网络或安全软件提示后重试。
pause
exit /b 1

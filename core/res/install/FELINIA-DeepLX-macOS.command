#!/bin/zsh
set -euo pipefail

DLX_VERSION="v1.2.4"
DLX_RELEASE="https://github.com/OwO-Network/DLX/releases/download/${DLX_VERSION}"
DLX_ARCH="$(uname -m)"

case "$DLX_ARCH" in
  arm64)
    DLX_ASSET="deeplx_darwin_arm64"
    DLX_SHA256="577187f28886a4c15d214cc8af6f5f4e4d96755054029d297a0e0ab49ae510d1"
    ;;
  x86_64)
    DLX_ASSET="deeplx_darwin_amd64"
    DLX_SHA256="7c1192581055bf1a353734714ac43fa84e38e025c7a61501ff24c947672a13c2"
    ;;
  *)
    echo "暂不支持这台 Mac 的处理器：$DLX_ARCH"
    read -k 1 "?按任意键关闭…"
    exit 1
    ;;
esac

DLX_ROOT="$HOME/Library/Application Support/FELINIA/DLX"
DLX_BINARY="$DLX_ROOT/deeplx"
DLX_AGENT="$HOME/Library/LaunchAgents/dev.felinia.dlx.plist"
DLX_TEMP="$(mktemp /tmp/felinia-dlx.XXXXXX)"
trap 'rm -f "$DLX_TEMP"' EXIT

echo "正在下载安装本地翻译服务…"
mkdir -p "$DLX_ROOT" "$HOME/Library/LaunchAgents"
curl -fL --retry 3 --connect-timeout 15 -o "$DLX_TEMP" "$DLX_RELEASE/$DLX_ASSET"
echo "$DLX_SHA256  $DLX_TEMP" | shasum -a 256 -c -
mv "$DLX_TEMP" "$DLX_BINARY"
chmod 755 "$DLX_BINARY"

cat > "$DLX_AGENT" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>dev.felinia.dlx</string>
  <key>ProgramArguments</key>
  <array>
    <string>$DLX_BINARY</string>
    <string>-ip</string>
    <string>127.0.0.1</string>
    <string>-port</string>
    <string>1188</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>ProcessType</key>
  <string>Background</string>
  <key>StandardOutPath</key>
  <string>$HOME/Library/Logs/FELINIA-DLX.log</string>
  <key>StandardErrorPath</key>
  <string>$HOME/Library/Logs/FELINIA-DLX.error.log</string>
</dict>
</plist>
PLIST

launchctl bootout "gui/$UID/dev.felinia.dlx" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$UID" "$DLX_AGENT"
launchctl kickstart -k "gui/$UID/dev.felinia.dlx"

for _ in 1 2 3 4 5; do
  if curl -fsS --max-time 2 http://127.0.0.1:1188/ >/dev/null; then
    echo "安装完成。本地翻译服务已经启动。"
    read -k 1 "?按任意键关闭…"
    exit 0
  fi
  sleep 1
done

echo "程序已安装，但服务没有及时启动。请重新登录 Mac 后再试。"
read -k 1 "?按任意键关闭…"
exit 1

#!/bin/zsh

set -e

cd "$(dirname "$0")"

if [[ ! -d node_modules ]]; then
  echo "首次启动，正在准备软件…"
  npm install
fi

echo "求职轨迹正在启动…"
npm run dev -- --host 127.0.0.1 --strictPort &
tracker_pid=$!

cleanup() {
  kill "$tracker_pid" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

for attempt in {1..40}; do
  if curl --silent --fail http://127.0.0.1:5173/ >/dev/null 2>&1; then
    open http://127.0.0.1:5173/
    echo "软件已打开。需要停止时，直接关闭这个窗口即可。"
    wait "$tracker_pid"
    exit 0
  fi
  sleep 0.25
done

echo "启动超时，请检查 5173 端口是否被其他程序占用。"
exit 1

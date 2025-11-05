#!/usr/bin/env bash
# Usage: ./test_query.sh <query>


# Getting user input from arguments(with joining multiple words)
query="$*"
#if no input, exit
if [ -z "$query" ]; then
  echo "Please provide a query."
  exit 1
fi

# launch the server in the background
PORT=4242
HOST="http://localhost:${PORT}/mcp"

# start server and capture its PID
pnpm run dev --port "$PORT" --strictPort > /tmp/mdn-lookup.log 2>&1 &
SERVER_PID=$!

# ensure the server is killed when this script exits or is interrupted
cleanup() {
  if [ -n "${SERVER_PID:-}" ] && kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# Wait for server to start (poll up to ~10s)
echo "Waiting for server to start..."
for i in {1..10}; do
  if curl -sSf --max-time 1 "http://localhost:$PORT/" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

pnpx @modelcontextprotocol/inspector \
    --cli \
    "$HOST" \
    --transport http \
    --method tools/call \
    --tool-name mdnlookup \
    --tool-arg "query=$query"

exit 0
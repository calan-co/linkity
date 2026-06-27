#!/usr/bin/env bash
set -euo pipefail

run_doc_vader() {
  local candidate="$1"
  shift

  if [ "${candidate##*.}" = "js" ]; then
    exec node "$candidate" "$@"
  fi

  exec "$candidate" "$@"
}

if [ -n "${DOC_VADER_CLI:-}" ]; then
  run_doc_vader "$DOC_VADER_CLI" "$@"
fi

if [ -x "../doc-vader/node_modules/.bin/tsx" ] && [ -f "../doc-vader/cli/doc-vader.ts" ]; then
  exec "../doc-vader/node_modules/.bin/tsx" "../doc-vader/cli/doc-vader.ts" "$@"
fi

if [ -x "./node_modules/.bin/doc-vader" ]; then
  run_doc_vader "./node_modules/.bin/doc-vader" "$@"
fi

if command -v doc-vader >/dev/null 2>&1; then
  run_doc_vader "$(command -v doc-vader)" "$@"
fi

cat >&2 <<'EOF'
Unable to find a usable doc-vader CLI.
EOF
exit 1

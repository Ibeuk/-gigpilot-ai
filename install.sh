#!/usr/bin/env bash
# Entrypoint shortcut for setup-vps.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$SCRIPT_DIR/setup-vps.sh" "$@"

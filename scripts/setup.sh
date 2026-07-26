#!/usr/bin/env bash
set -euo pipefail

echo "=== SQL Analytics Workbench Setup ==="

if [ -f package.json ]; then
  echo "Installing Node dependencies..."
  npm install
fi

if [ ! -d .venv ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv .venv
fi

echo "Installing Python dependencies..."
# shellcheck disable=SC1091
source .venv/bin/activate
pip install --upgrade pip
pip install -r python/requirements.txt

echo "Generating datasets..."
bash scripts/seed-data.sh

echo "=== Setup complete ==="

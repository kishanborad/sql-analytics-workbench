#!/usr/bin/env bash
set -euo pipefail

echo "=== Seeding datasets ==="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

if [ -d .venv ]; then
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi

python python/generate_datasets.py --output public/datasets
python python/validate_datasets.py --datasets public/datasets
python python/schema_exporter.py --datasets public/datasets --output public/schemas.json

echo "=== Datasets seeded and validated ==="

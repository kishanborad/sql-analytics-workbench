#!/usr/bin/env bash
set -euo pipefail

echo "=== Running all tests ==="

echo "--- Python tests ---"
if [ -d .venv ]; then
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi
cd python
python -m pytest tests/ -v --tb=short --cov=. --cov-report=term-missing
cd ..

echo "--- Frontend tests ---"
npx vitest run --reporter=verbose

echo "=== All tests passed ==="

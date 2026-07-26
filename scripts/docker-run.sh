#!/usr/bin/env bash
set -euo pipefail

echo "=== Building and running Docker container ==="

docker compose up --build -d

echo "Running at http://localhost:8080"
echo "Stop with: docker compose down"

#!/usr/bin/env bash
set -euo pipefail

echo "=== Deploying to GitHub Pages ==="

echo "Building..."
npm run build

echo "Deploying to gh-pages..."
npx gh-pages -d dist

echo "=== Deployed to https://kishanborad.github.io/sql-analytics-workbench/ ==="

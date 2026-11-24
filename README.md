# SQL Analytics Workbench

A browser-based SQL environment powered by DuckDB-WASM. Write queries against three built-in datasets (e-commerce, GitHub activity, weather stations), see results in sortable tables, and visualize data with six chart types via Observable Plot.

Everything runs client-side. No server, no API keys, no data leaves your browser.

**Live demo:** [kishanborad.github.io/sql-analytics-workbench](https://kishanborad.github.io/sql-analytics-workbench/)

## Datasets

- **E-commerce**: customers, products, orders (~750 rows total)
- **GitHub Activity**: repos, commits, pull requests (~840 rows total)
- **Weather Stations**: stations, daily readings (~830 rows total)

## Tech stack

- DuckDB-WASM for in-browser SQL
- CodeMirror 6 for the SQL editor with autocomplete
- Observable Plot for charts (bar, line, pie, scatter, area, heatmap)
- React 19 + TypeScript + Tailwind CSS
- Python (Faker, pytest) for dataset generation and validation
- Docker + GitHub Actions CI
- Bash scripts for setup, testing, deployment

## Requirements

- Node.js 20 and npm. CI uses Node 20 and the Dockerfile builds on
  `node:20-slim`. Install with `npm ci`, which follows
  `package-lock.json`.
- Python 3.10 or later. `python/setup.py` requires Python 3.10 or
  later, CI tests Python 3.10, 3.11, and 3.12, and the Dockerfile
  builds on `python:3.12-slim`.
- Python packages, from `python/requirements.txt`: Faker 28.0.0 or
  later, pytest 8.0.0 or later, pytest-cov 5.0.0 or later,
  ruff 0.5.0 or later.
- Frontend packages, from `package.json`: React and React DOM 19.2.8,
  DuckDB-WASM (`@duckdb/duckdb-wasm`) 1.33.1-dev57.0, CodeMirror 6.0.2
  with the `@codemirror` 6.x packages, Observable Plot
  (`@observablehq/plot`) 0.6.17, Vite 6.4.3, TypeScript 7.0.2,
  Tailwind CSS 4.3.3, Vitest 4.1.10.
- Bash, because `npm run build` first runs `scripts/seed-data.sh`,
  which regenerates the datasets with Python.
- Docker is optional, only for the container path (`Dockerfile`).

## Getting started

```bash
git clone https://github.com/kishanborad/sql-analytics-workbench.git
cd sql-analytics-workbench
bash scripts/setup.sh
npm run dev
```

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm test           # Run unit tests (Vitest)
npm run lint       # TypeScript check
bash scripts/test.sh   # Run all tests (Python + frontend)
bash scripts/deploy.sh # Deploy to GitHub Pages
```

## AI tools

Built with [Claude Code](https://claude.ai/code) as the AI copilot for code generation, agent-driven development, and automated testing workflows.

## Author

Kishan Borad
- [GitHub](https://github.com/kishanborad)
- [LinkedIn](https://linkedin.com/in/kishanborad27)

## License

MIT

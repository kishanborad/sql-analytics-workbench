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
- React 18 + TypeScript + Tailwind CSS
- Python (Faker, pytest) for dataset generation and validation
- Docker + GitHub Actions CI
- Bash scripts for setup, testing, deployment

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

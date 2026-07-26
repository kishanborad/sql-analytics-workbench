# SQL Analytics Workbench

A browser-based SQL environment powered by DuckDB-WASM. Write queries against three built-in datasets (e-commerce, GitHub activity, weather stations), see results in sortable tables, and visualize data with six chart types via Observable Plot.

Everything runs client-side. No server, no API keys, no data leaves your browser.

## Datasets

- **E-commerce**: customers, products, orders (~750 rows total)
- **GitHub Activity**: repos, commits, pull requests (~840 rows total)
- **Weather Stations**: stations, daily readings (~830 rows total)

## Tech Stack

- DuckDB-WASM for in-browser SQL
- CodeMirror 6 for the SQL editor with autocomplete
- Observable Plot for charts (bar, line, pie, scatter, area, heatmap)
- React + TypeScript + Tailwind CSS
- Python for dataset generation and validation

## Development

```bash
bash scripts/setup.sh
npm run dev
```

## Testing

```bash
bash scripts/test.sh
```

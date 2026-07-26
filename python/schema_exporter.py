"""Export dataset schemas from CSV headers to JSON."""

import argparse
import csv
import json
import os

_TYPE_PATTERNS = {
    "id": "number",
    "count": "number",
    "total": "number",
    "price": "number",
    "stock": "number",
    "quantity": "number",
    "stars": "number",
    "forks": "number",
    "additions": "number",
    "deletions": "number",
    "latitude": "number",
    "longitude": "number",
    "elevation": "number",
    "temp_high": "number",
    "temp_low": "number",
    "precipitation": "number",
    "wind_speed": "number",
}

_DATE_COLUMNS = {
    "signup_date",
    "order_date",
    "created_at",
    "committed_at",
    "merged_at",
    "date",
}


def _infer_type(column_name: str) -> str:
    col_lower = column_name.lower()
    if col_lower in _DATE_COLUMNS:
        return "date"
    for pattern, col_type in _TYPE_PATTERNS.items():
        if pattern in col_lower:
            return col_type
    return "string"


def export_schemas(datasets_dir: str) -> dict:
    """Export schemas for all datasets in a directory."""
    schemas: dict = {}

    if not os.path.isdir(datasets_dir):
        return schemas

    for dataset_name in sorted(os.listdir(datasets_dir)):
        dataset_path = os.path.join(datasets_dir, dataset_name)
        if not os.path.isdir(dataset_path):
            continue

        tables = []
        for filename in sorted(os.listdir(dataset_path)):
            if not filename.endswith(".csv"):
                continue

            filepath = os.path.join(dataset_path, filename)
            with open(filepath, encoding="utf-8") as f:
                reader = csv.reader(f)
                header = next(reader, None)
                if header is None:
                    continue

            table_name = filename.replace(".csv", "")
            columns = [
                {"name": col, "type": _infer_type(col)} for col in header
            ]
            tables.append({"name": table_name, "columns": columns})

        if tables:
            schemas[dataset_name] = {"tables": tables}

    return schemas


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export dataset schemas to JSON")
    parser.add_argument(
        "--datasets",
        default=os.path.join(os.path.dirname(__file__), "..", "public", "datasets"),
    )
    parser.add_argument(
        "--output",
        default=os.path.join(os.path.dirname(__file__), "..", "public", "schemas.json"),
    )
    args = parser.parse_args()
    schemas = export_schemas(args.datasets)
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(schemas, f, indent=2)
    print(f"Exported schemas for {len(schemas)} datasets to {args.output}")

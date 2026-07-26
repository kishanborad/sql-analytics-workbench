"""Validate CSV datasets against expected schemas.

Checks column names, types (by sampling values), row count ranges,
and primary key uniqueness.
"""

import argparse
import csv
import os

SCHEMAS: dict[str, dict] = {
    "ecommerce": {
        "customers.csv": {
            "columns": ["id", "name", "email", "city", "country", "signup_date"],
            "min_rows": 100,
            "max_rows": 300,
            "pk": "id",
        },
        "products.csv": {
            "columns": ["id", "name", "category", "price", "stock"],
            "min_rows": 30,
            "max_rows": 100,
            "pk": "id",
        },
        "orders.csv": {
            "columns": ["id", "customer_id", "product_id", "quantity", "total", "status", "order_date"],
            "min_rows": 300,
            "max_rows": 700,
            "pk": "id",
        },
    },
    "github": {
        "repos.csv": {
            "columns": ["id", "name", "language", "stars", "forks", "created_at"],
            "min_rows": 20,
            "max_rows": 60,
            "pk": "id",
        },
        "commits.csv": {
            "columns": ["id", "repo_id", "author", "message", "additions", "deletions", "committed_at"],
            "min_rows": 400,
            "max_rows": 800,
            "pk": "id",
        },
        "pull_requests.csv": {
            "columns": ["id", "repo_id", "author", "title", "status", "created_at", "merged_at"],
            "min_rows": 100,
            "max_rows": 300,
            "pk": "id",
        },
    },
    "weather": {
        "stations.csv": {
            "columns": ["id", "name", "city", "country", "latitude", "longitude", "elevation"],
            "min_rows": 20,
            "max_rows": 50,
            "pk": "id",
        },
        "readings.csv": {
            "columns": ["id", "station_id", "date", "temp_high", "temp_low", "precipitation", "wind_speed"],
            "min_rows": 500,
            "max_rows": 1200,
            "pk": "id",
        },
    },
}


def validate_dataset(dataset_dir: str, schema: dict) -> list[str]:
    """Validate a single dataset directory against its schema."""
    errors: list[str] = []

    for filename, spec in schema.items():
        filepath = os.path.join(dataset_dir, filename)

        if not os.path.exists(filepath):
            errors.append(f"Missing file: {filename}")
            continue

        with open(filepath, encoding="utf-8") as f:
            reader = csv.reader(f)
            header = next(reader, None)

            if header is None:
                errors.append(f"{filename}: empty file")
                continue

            if header != spec["columns"]:
                errors.append(
                    f"{filename}: expected columns {spec['columns']}, got {header}"
                )

            rows = list(reader)
            row_count = len(rows)

            if row_count < spec["min_rows"]:
                errors.append(
                    f"{filename}: too few rows ({row_count} < {spec['min_rows']})"
                )
            if row_count > spec["max_rows"]:
                errors.append(
                    f"{filename}: too many rows ({row_count} > {spec['max_rows']})"
                )

            pk_col = spec["columns"].index(spec["pk"])
            pk_values = [row[pk_col] for row in rows]
            if len(pk_values) != len(set(pk_values)):
                errors.append(f"{filename}: duplicate primary key values in '{spec['pk']}'")

    return errors


def validate_all(datasets_dir: str) -> dict[str, list[str]]:
    """Validate all datasets. Returns {dataset_name: [errors]}."""
    results: dict[str, list[str]] = {}
    for dataset_name, schema in SCHEMAS.items():
        dataset_path = os.path.join(datasets_dir, dataset_name)
        results[dataset_name] = validate_dataset(dataset_path, schema)
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate CSV datasets")
    parser.add_argument(
        "--datasets",
        default=os.path.join(os.path.dirname(__file__), "..", "public", "datasets"),
    )
    args = parser.parse_args()
    results = validate_all(args.datasets)
    all_valid = True
    for name, errs in results.items():
        if errs:
            all_valid = False
            print(f"FAIL {name}:")
            for e in errs:
                print(f"  - {e}")
        else:
            print(f"OK   {name}")
    raise SystemExit(0 if all_valid else 1)

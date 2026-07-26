"""Tests for the dataset validator."""

import csv
import os
import tempfile

from validate_datasets import validate_dataset


class TestValidateDataset:
    def _make_csv(self, path, headers, rows):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerows(rows)

    def test_valid_dataset_returns_no_errors(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            self._make_csv(
                os.path.join(tmpdir, "test.csv"),
                ["id", "name"],
                [[str(i), f"item{i}"] for i in range(50)],
            )
            schema = {
                "test.csv": {
                    "columns": ["id", "name"],
                    "min_rows": 10,
                    "max_rows": 100,
                    "pk": "id",
                }
            }
            errors = validate_dataset(tmpdir, schema)
            assert errors == []

    def test_missing_file_reports_error(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            schema = {
                "missing.csv": {
                    "columns": ["id"],
                    "min_rows": 1,
                    "max_rows": 10,
                    "pk": "id",
                }
            }
            errors = validate_dataset(tmpdir, schema)
            assert len(errors) == 1
            assert "Missing file" in errors[0]

    def test_wrong_columns_reports_error(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            self._make_csv(
                os.path.join(tmpdir, "test.csv"),
                ["id", "wrong_col"],
                [["1", "val"]],
            )
            schema = {
                "test.csv": {
                    "columns": ["id", "name"],
                    "min_rows": 1,
                    "max_rows": 10,
                    "pk": "id",
                }
            }
            errors = validate_dataset(tmpdir, schema)
            assert any("expected columns" in e for e in errors)

    def test_too_few_rows_reports_error(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            self._make_csv(
                os.path.join(tmpdir, "test.csv"),
                ["id", "name"],
                [["1", "only_one"]],
            )
            schema = {
                "test.csv": {
                    "columns": ["id", "name"],
                    "min_rows": 10,
                    "max_rows": 100,
                    "pk": "id",
                }
            }
            errors = validate_dataset(tmpdir, schema)
            assert any("too few rows" in e for e in errors)

    def test_duplicate_pk_reports_error(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            self._make_csv(
                os.path.join(tmpdir, "test.csv"),
                ["id", "name"],
                [["1", "a"], ["1", "b"], ["2", "c"]] * 5,
            )
            schema = {
                "test.csv": {
                    "columns": ["id", "name"],
                    "min_rows": 1,
                    "max_rows": 100,
                    "pk": "id",
                }
            }
            errors = validate_dataset(tmpdir, schema)
            assert any("duplicate" in e for e in errors)

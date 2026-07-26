"""Tests for the schema exporter."""

import csv
import os
import tempfile

from schema_exporter import export_schemas


class TestExportSchemas:
    def _make_csv(self, path, headers):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerow(["1"] * len(headers))

    def test_exports_table_structure(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            ds_dir = os.path.join(tmpdir, "testdb")
            self._make_csv(os.path.join(ds_dir, "users.csv"), ["id", "name", "signup_date"])
            schemas = export_schemas(tmpdir)
            assert "testdb" in schemas
            tables = schemas["testdb"]["tables"]
            assert len(tables) == 1
            assert tables[0]["name"] == "users"

    def test_infers_column_types(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            ds_dir = os.path.join(tmpdir, "testdb")
            self._make_csv(os.path.join(ds_dir, "items.csv"), ["id", "name", "price", "created_at"])
            schemas = export_schemas(tmpdir)
            columns = schemas["testdb"]["tables"][0]["columns"]
            types = {c["name"]: c["type"] for c in columns}
            assert types["id"] == "number"
            assert types["name"] == "string"
            assert types["price"] == "number"
            assert types["created_at"] == "date"

    def test_empty_directory_returns_empty(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            schemas = export_schemas(tmpdir)
            assert schemas == {}

    def test_multiple_tables_sorted(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            ds_dir = os.path.join(tmpdir, "mydb")
            self._make_csv(os.path.join(ds_dir, "zebra.csv"), ["id"])
            self._make_csv(os.path.join(ds_dir, "alpha.csv"), ["id"])
            schemas = export_schemas(tmpdir)
            table_names = [t["name"] for t in schemas["mydb"]["tables"]]
            assert table_names == ["alpha", "zebra"]

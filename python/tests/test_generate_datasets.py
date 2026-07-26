"""Tests for the dataset generator."""

import os
import tempfile

from generate_datasets import generate_all, generate_ecommerce


class TestGenerateEcommerce:
    def test_creates_three_csv_files(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            counts = generate_ecommerce(tmpdir)
            ecom_dir = os.path.join(tmpdir, "ecommerce")
            assert os.path.exists(os.path.join(ecom_dir, "customers.csv"))
            assert os.path.exists(os.path.join(ecom_dir, "products.csv"))
            assert os.path.exists(os.path.join(ecom_dir, "orders.csv"))
            assert len(counts) == 3

    def test_customer_row_count(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            counts = generate_ecommerce(tmpdir)
            assert counts["customers.csv"] == 200

    def test_product_row_count(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            counts = generate_ecommerce(tmpdir)
            assert counts["products.csv"] == 50

    def test_order_row_count(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            counts = generate_ecommerce(tmpdir)
            assert counts["orders.csv"] == 500


class TestGenerateAll:
    def test_creates_all_eight_files(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            counts = generate_all(tmpdir)
            assert len(counts) == 8

    def test_all_counts_positive(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            counts = generate_all(tmpdir)
            for name, count in counts.items():
                assert count > 0, f"{name} has 0 rows"

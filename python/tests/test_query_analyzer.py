"""Tests for the query analyzer."""

from query_analyzer import analyze_query


class TestAnalyzeQuery:
    def test_simple_select(self):
        result = analyze_query("SELECT * FROM customers")
        assert result["type"] == "SELECT"
        assert "customers" in result["tables"]

    def test_join_query(self):
        result = analyze_query(
            "SELECT c.name, o.total FROM customers c JOIN orders o ON c.id = o.customer_id"
        )
        assert result["type"] == "JOIN"
        assert "customers" in result["tables"]
        assert "orders" in result["tables"]

    def test_aggregate_query(self):
        result = analyze_query(
            "SELECT category, COUNT(*) FROM products GROUP BY category"
        )
        assert result["type"] == "AGGREGATE"
        assert result["has_group_by"] is True

    def test_window_function(self):
        result = analyze_query(
            "SELECT author, COUNT(*) OVER (PARTITION BY repo_id) FROM commits"
        )
        assert result["type"] == "WINDOW"

    def test_order_by_detection(self):
        result = analyze_query("SELECT * FROM repos ORDER BY stars DESC")
        assert result["has_order_by"] is True

    def test_no_order_by(self):
        result = analyze_query("SELECT * FROM repos")
        assert result["has_order_by"] is False

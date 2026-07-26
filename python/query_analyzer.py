"""Analyze SQL queries to categorize their complexity and structure."""

import argparse
import re


_JOIN_RE = re.compile(r"\bJOIN\b", re.IGNORECASE)
_GROUP_BY_RE = re.compile(r"\bGROUP\s+BY\b", re.IGNORECASE)
_ORDER_BY_RE = re.compile(r"\bORDER\s+BY\b", re.IGNORECASE)
_WINDOW_RE = re.compile(r"\bOVER\s*\(", re.IGNORECASE)
_AGG_RE = re.compile(r"\b(COUNT|SUM|AVG|MIN|MAX)\s*\(", re.IGNORECASE)
_FROM_RE = re.compile(r"\bFROM\s+(\w+)", re.IGNORECASE)
_JOIN_TABLE_RE = re.compile(r"\bJOIN\s+(\w+)", re.IGNORECASE)


def analyze_query(sql: str) -> dict:
    """Analyze a SQL query and return its structure."""
    tables: list[str] = []

    for match in _FROM_RE.finditer(sql):
        table = match.group(1).lower()
        if table not in tables:
            tables.append(table)

    for match in _JOIN_TABLE_RE.finditer(sql):
        table = match.group(1).lower()
        if table not in tables:
            tables.append(table)

    has_group_by = bool(_GROUP_BY_RE.search(sql))
    has_order_by = bool(_ORDER_BY_RE.search(sql))
    has_window = bool(_WINDOW_RE.search(sql))
    has_join = bool(_JOIN_RE.search(sql))
    has_agg = bool(_AGG_RE.search(sql))

    if has_window:
        query_type = "WINDOW"
    elif has_join:
        query_type = "JOIN"
    elif has_agg or has_group_by:
        query_type = "AGGREGATE"
    else:
        query_type = "SELECT"

    return {
        "type": query_type,
        "tables": tables,
        "has_group_by": has_group_by,
        "has_order_by": has_order_by,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze a SQL query")
    parser.add_argument("sql", help="SQL query string")
    args = parser.parse_args()
    result = analyze_query(args.sql)
    for k, v in result.items():
        print(f"  {k}: {v}")

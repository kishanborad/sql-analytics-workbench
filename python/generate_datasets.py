"""Generate realistic CSV datasets for the SQL Analytics Workbench.

Creates three datasets (e-commerce, GitHub activity, weather stations)
with internally consistent foreign keys and realistic value distributions.
"""

import argparse
import csv
import os
import random
from datetime import date, timedelta

from faker import Faker

fake = Faker()
Faker.seed(42)
random.seed(42)

CATEGORIES = ["Electronics", "Clothing", "Books", "Home", "Sports"]
STATUSES = ["completed", "pending", "shipped", "cancelled", "returned"]
LANGUAGES = ["Python", "TypeScript", "Go", "Rust", "Java", "C++", "Ruby", "Swift"]
PR_STATUSES = ["merged", "open", "closed"]
CITIES = [
    ("New York", "US", 40.71, -74.01),
    ("London", "UK", 51.51, -0.13),
    ("Tokyo", "JP", 35.68, 139.69),
    ("Sydney", "AU", -33.87, 151.21),
    ("Berlin", "DE", 52.52, 13.40),
    ("Mumbai", "IN", 19.08, 72.88),
    ("São Paulo", "BR", -23.55, -46.63),
    ("Cairo", "EG", 30.04, 31.24),
    ("Toronto", "CA", 43.65, -79.38),
    ("Seoul", "KR", 37.57, 126.98),
]


def _write_csv(path: str, headers: list[str], rows: list[list]) -> int:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
    return len(rows)


def generate_ecommerce(output_dir: str) -> dict[str, int]:
    """Generate customers, products, and orders CSVs."""
    ecom_dir = os.path.join(output_dir, "ecommerce")
    counts = {}

    customers = []
    for i in range(1, 201):
        city_data = random.choice(CITIES)
        customers.append([
            i,
            fake.name(),
            fake.email(),
            city_data[0],
            city_data[1],
            fake.date_between(start_date="-3y", end_date="today").isoformat(),
        ])
    counts["customers.csv"] = _write_csv(
        os.path.join(ecom_dir, "customers.csv"),
        ["id", "name", "email", "city", "country", "signup_date"],
        customers,
    )

    products = []
    for i in range(1, 51):
        products.append([
            i,
            fake.catch_phrase(),
            random.choice(CATEGORIES),
            round(random.uniform(5.0, 500.0), 2),
            random.randint(0, 1000),
        ])
    counts["products.csv"] = _write_csv(
        os.path.join(ecom_dir, "products.csv"),
        ["id", "name", "category", "price", "stock"],
        products,
    )

    orders = []
    for i in range(1, 501):
        product = random.choice(products)
        qty = random.randint(1, 10)
        orders.append([
            i,
            random.randint(1, 200),
            product[0],
            qty,
            round(product[3] * qty, 2),
            random.choice(STATUSES),
            fake.date_between(start_date="-2y", end_date="today").isoformat(),
        ])
    counts["orders.csv"] = _write_csv(
        os.path.join(ecom_dir, "orders.csv"),
        ["id", "customer_id", "product_id", "quantity", "total", "status", "order_date"],
        orders,
    )

    return counts


def generate_github(output_dir: str) -> dict[str, int]:
    """Generate repos, commits, and pull_requests CSVs."""
    gh_dir = os.path.join(output_dir, "github")
    counts = {}

    repos = []
    for i in range(1, 41):
        repos.append([
            i,
            fake.slug() + "-" + random.choice(["api", "cli", "lib", "app", "sdk"]),
            random.choice(LANGUAGES),
            random.randint(1, 5000),
            random.randint(0, 800),
            fake.date_between(start_date="-4y", end_date="-6m").isoformat(),
        ])
    counts["repos.csv"] = _write_csv(
        os.path.join(gh_dir, "repos.csv"),
        ["id", "name", "language", "stars", "forks", "created_at"],
        repos,
    )

    authors = [fake.user_name() for _ in range(15)]
    commits = []
    for i in range(1, 601):
        commits.append([
            i,
            random.randint(1, 40),
            random.choice(authors),
            fake.sentence(nb_words=6),
            random.randint(0, 500),
            random.randint(0, 400),
            fake.date_between(start_date="-2y", end_date="today").isoformat(),
        ])
    counts["commits.csv"] = _write_csv(
        os.path.join(gh_dir, "commits.csv"),
        ["id", "repo_id", "author", "message", "additions", "deletions", "committed_at"],
        commits,
    )

    prs = []
    for i in range(1, 201):
        status = random.choice(PR_STATUSES)
        created = fake.date_between(start_date="-2y", end_date="today")
        merged = (
            (created + timedelta(days=random.randint(1, 14))).isoformat()
            if status == "merged"
            else ""
        )
        prs.append([
            i,
            random.randint(1, 40),
            random.choice(authors),
            fake.sentence(nb_words=5),
            status,
            created.isoformat(),
            merged,
        ])
    counts["pull_requests.csv"] = _write_csv(
        os.path.join(gh_dir, "pull_requests.csv"),
        ["id", "repo_id", "author", "title", "status", "created_at", "merged_at"],
        prs,
    )

    return counts


def generate_weather(output_dir: str) -> dict[str, int]:
    """Generate stations and readings CSVs."""
    wx_dir = os.path.join(output_dir, "weather")
    counts = {}

    stations = []
    station_id = 0
    for city_name, country, lat, lon in CITIES:
        for suffix in ["Airport", "Downtown", "Harbor"]:
            station_id += 1
            stations.append([
                station_id,
                f"{city_name} {suffix}",
                city_name,
                country,
                round(lat + random.uniform(-0.1, 0.1), 4),
                round(lon + random.uniform(-0.1, 0.1), 4),
                random.randint(2, 350),
            ])
    counts["stations.csv"] = _write_csv(
        os.path.join(wx_dir, "stations.csv"),
        ["id", "name", "city", "country", "latitude", "longitude", "elevation"],
        stations,
    )

    readings = []
    reading_id = 0
    start = date(2024, 1, 1)
    for sid in range(1, station_id + 1):
        num_days = random.randint(20, 35)
        for d in range(num_days):
            reading_id += 1
            day = start + timedelta(days=d * random.randint(7, 14))
            base_temp = random.uniform(-5, 35)
            readings.append([
                reading_id,
                sid,
                day.isoformat(),
                round(base_temp + random.uniform(2, 8), 1),
                round(base_temp - random.uniform(2, 8), 1),
                round(random.uniform(0, 50), 1),
                round(random.uniform(0, 80), 1),
            ])
    counts["readings.csv"] = _write_csv(
        os.path.join(wx_dir, "readings.csv"),
        ["id", "station_id", "date", "temp_high", "temp_low", "precipitation", "wind_speed"],
        readings,
    )

    return counts


def generate_all(output_dir: str) -> dict[str, int]:
    """Generate all datasets and return filename-to-row-count mapping."""
    counts: dict[str, int] = {}
    counts.update(generate_ecommerce(output_dir))
    counts.update(generate_github(output_dir))
    counts.update(generate_weather(output_dir))
    return counts


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate CSV datasets")
    parser.add_argument(
        "--output",
        default=os.path.join(os.path.dirname(__file__), "..", "public", "datasets"),
        help="Output directory for CSV files",
    )
    args = parser.parse_args()
    result = generate_all(args.output)
    for name, count in sorted(result.items()):
        print(f"  {name}: {count} rows")
    print(f"Generated {len(result)} files")

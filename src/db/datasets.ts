import type { DatasetInfo } from '../types';

export const DATASETS: DatasetInfo[] = [
  {
    id: 'ecommerce',
    name: 'E-commerce',
    tables: [
      {
        name: 'customers',
        csvPath: 'datasets/ecommerce/customers.csv',
        columns: [
          { name: 'id', type: 'number' },
          { name: 'name', type: 'string' },
          { name: 'email', type: 'string' },
          { name: 'city', type: 'string' },
          { name: 'country', type: 'string' },
          { name: 'signup_date', type: 'date' },
        ],
      },
      {
        name: 'products',
        csvPath: 'datasets/ecommerce/products.csv',
        columns: [
          { name: 'id', type: 'number' },
          { name: 'name', type: 'string' },
          { name: 'category', type: 'string' },
          { name: 'price', type: 'number' },
          { name: 'stock', type: 'number' },
        ],
      },
      {
        name: 'orders',
        csvPath: 'datasets/ecommerce/orders.csv',
        columns: [
          { name: 'id', type: 'number' },
          { name: 'customer_id', type: 'number' },
          { name: 'product_id', type: 'number' },
          { name: 'quantity', type: 'number' },
          { name: 'total', type: 'number' },
          { name: 'status', type: 'string' },
          { name: 'order_date', type: 'date' },
        ],
      },
    ],
    starterQueries: [
      {
        label: 'Revenue by category',
        sql: `-- Revenue breakdown by product category
-- Excludes cancelled orders, shows % of total revenue
WITH category_revenue AS (
  SELECT
    p.category,
    ROUND(SUM(o.total), 2) AS revenue,
    COUNT(DISTINCT o.id) AS order_count,
    COUNT(DISTINCT o.customer_id) AS unique_customers
  FROM orders o
  JOIN products p ON o.product_id = p.id
  WHERE o.status != 'cancelled'
  GROUP BY p.category
),
total AS (
  SELECT SUM(revenue) AS grand_total FROM category_revenue
)
SELECT
  cr.category,
  cr.revenue,
  cr.order_count,
  cr.unique_customers,
  ROUND(cr.revenue * 100.0 / t.grand_total, 1) AS pct_of_total
FROM category_revenue cr
CROSS JOIN total t
ORDER BY cr.revenue DESC`,
      },
      {
        label: 'Monthly revenue trend',
        sql: `-- Monthly revenue with running total and month-over-month growth
-- Shows how revenue accumulates and changes over time
WITH monthly AS (
  SELECT
    DATE_TRUNC('month', CAST(order_date AS DATE)) AS month,
    ROUND(SUM(total), 2) AS revenue,
    COUNT(*) AS orders,
    COUNT(DISTINCT customer_id) AS buyers,
    ROUND(AVG(total), 2) AS avg_order_value
  FROM orders
  WHERE status != 'cancelled'
  GROUP BY DATE_TRUNC('month', CAST(order_date AS DATE))
)
SELECT
  month,
  revenue,
  orders,
  buyers,
  avg_order_value,
  SUM(revenue) OVER (ORDER BY month) AS cumulative_revenue,
  ROUND(
    (revenue - LAG(revenue) OVER (ORDER BY month))
    * 100.0 / NULLIF(LAG(revenue) OVER (ORDER BY month), 0),
    1
  ) AS mom_growth_pct
FROM monthly
ORDER BY month`,
      },
      {
        label: 'Top customers by LTV',
        sql: `-- Customer lifetime value analysis
-- Ranks customers by total spend, includes order frequency
-- and average days between orders
WITH customer_orders AS (
  SELECT
    c.name AS customer,
    c.country,
    c.city,
    COUNT(o.id) AS total_orders,
    ROUND(SUM(o.total), 2) AS lifetime_value,
    ROUND(AVG(o.total), 2) AS avg_order_value,
    MIN(CAST(o.order_date AS DATE)) AS first_order,
    MAX(CAST(o.order_date AS DATE)) AS last_order,
    COUNT(DISTINCT p.category) AS categories_bought
  FROM customers c
  JOIN orders o ON c.id = o.customer_id
  JOIN products p ON o.product_id = p.id
  WHERE o.status != 'cancelled'
  GROUP BY c.name, c.country, c.city
)
SELECT
  customer,
  country,
  total_orders,
  lifetime_value,
  avg_order_value,
  categories_bought,
  first_order,
  last_order,
  CASE
    WHEN total_orders > 1
    THEN (last_order - first_order) / (total_orders - 1)
    ELSE NULL
  END AS avg_days_between_orders
FROM customer_orders
ORDER BY lifetime_value DESC
LIMIT 15`,
      },
      {
        label: 'Country × status heatmap',
        sql: `-- Order status breakdown by country
-- Shows which countries have the highest return/cancel rates
SELECT
  c.country,
  o.status,
  COUNT(*) AS order_count
FROM orders o
JOIN customers c ON o.customer_id = c.id
GROUP BY c.country, o.status
ORDER BY c.country, o.status`,
      },
      {
        label: 'Product performance',
        sql: `-- Product performance scorecard
-- Combines sales metrics with inventory status
WITH product_sales AS (
  SELECT
    p.name AS product,
    p.category,
    p.price AS unit_price,
    p.stock AS current_stock,
    COUNT(o.id) AS times_ordered,
    SUM(o.quantity) AS units_sold,
    ROUND(SUM(o.total), 2) AS total_revenue,
    COUNT(DISTINCT o.customer_id) AS unique_buyers,
    COUNT(CASE WHEN o.status = 'returned' THEN 1 END) AS returns,
    COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) AS cancellations
  FROM products p
  LEFT JOIN orders o ON p.id = o.product_id
  GROUP BY p.name, p.category, p.price, p.stock
)
SELECT
  product,
  category,
  unit_price,
  current_stock,
  times_ordered,
  units_sold,
  total_revenue,
  unique_buyers,
  ROUND(returns * 100.0 / NULLIF(times_ordered, 0), 1) AS return_rate_pct,
  ROUND(cancellations * 100.0 / NULLIF(times_ordered, 0), 1) AS cancel_rate_pct
FROM product_sales
ORDER BY total_revenue DESC`,
      },
      {
        label: 'Price vs stock scatter',
        sql: `-- Price vs remaining stock by category
-- Helps identify pricing sweet spots and overstock risks
SELECT
  p.name AS product,
  p.category,
  p.price,
  p.stock,
  COALESCE(sales.units_sold, 0) AS units_sold,
  ROUND(p.price * p.stock, 2) AS inventory_value
FROM products p
LEFT JOIN (
  SELECT product_id, SUM(quantity) AS units_sold
  FROM orders
  WHERE status NOT IN ('cancelled', 'returned')
  GROUP BY product_id
) sales ON p.id = sales.product_id
ORDER BY p.price DESC`,
      },
    ],
  },
  {
    id: 'github',
    name: 'GitHub Activity',
    tables: [
      {
        name: 'repos',
        csvPath: 'datasets/github/repos.csv',
        columns: [
          { name: 'id', type: 'number' },
          { name: 'name', type: 'string' },
          { name: 'language', type: 'string' },
          { name: 'stars', type: 'number' },
          { name: 'forks', type: 'number' },
          { name: 'created_at', type: 'date' },
        ],
      },
      {
        name: 'commits',
        csvPath: 'datasets/github/commits.csv',
        columns: [
          { name: 'id', type: 'number' },
          { name: 'repo_id', type: 'number' },
          { name: 'author', type: 'string' },
          { name: 'message', type: 'string' },
          { name: 'additions', type: 'number' },
          { name: 'deletions', type: 'number' },
          { name: 'committed_at', type: 'date' },
        ],
      },
      {
        name: 'pull_requests',
        csvPath: 'datasets/github/pull_requests.csv',
        columns: [
          { name: 'id', type: 'number' },
          { name: 'repo_id', type: 'number' },
          { name: 'author', type: 'string' },
          { name: 'title', type: 'string' },
          { name: 'status', type: 'string' },
          { name: 'created_at', type: 'date' },
          { name: 'merged_at', type: 'date' },
        ],
      },
    ],
    starterQueries: [
      {
        label: 'Stars by language',
        sql: `-- Aggregate stars and repo count by programming language
-- Shows which languages are most popular in this dataset
WITH language_stats AS (
  SELECT
    language,
    COUNT(*) AS repo_count,
    SUM(stars) AS total_stars,
    SUM(forks) AS total_forks,
    ROUND(AVG(stars), 0) AS avg_stars,
    MAX(stars) AS max_stars
  FROM repos
  GROUP BY language
)
SELECT
  language,
  repo_count,
  total_stars,
  total_forks,
  avg_stars,
  max_stars,
  ROUND(total_forks * 100.0 / NULLIF(total_stars, 0), 1)
    AS fork_to_star_ratio
FROM language_stats
ORDER BY total_stars DESC`,
      },
      {
        label: 'Author × language heatmap',
        sql: `-- Commit activity matrix: author vs language
-- Reveals each developer's language focus
SELECT
  co.author,
  r.language,
  COUNT(*) AS commits
FROM commits co
JOIN repos r ON co.repo_id = r.id
GROUP BY co.author, r.language
HAVING COUNT(*) >= 3
ORDER BY commits DESC`,
      },
      {
        label: 'Weekly commit velocity',
        sql: `-- Weekly development velocity with code churn
-- Tracks additions, deletions, and net lines per week
WITH weekly AS (
  SELECT
    DATE_TRUNC('week', CAST(committed_at AS DATE)) AS week,
    COUNT(*) AS commits,
    SUM(additions) AS additions,
    SUM(deletions) AS deletions,
    COUNT(DISTINCT author) AS active_authors,
    COUNT(DISTINCT repo_id) AS active_repos
  FROM commits
  GROUP BY DATE_TRUNC('week', CAST(committed_at AS DATE))
)
SELECT
  week,
  commits,
  additions,
  deletions,
  (additions - deletions) AS net_lines,
  active_authors,
  active_repos,
  ROUND(
    additions * 100.0 / NULLIF(additions + deletions, 0), 1
  ) AS addition_pct
FROM weekly
ORDER BY week`,
      },
      {
        label: 'PR merge rate by repo',
        sql: `-- Pull request outcomes by repository
-- Identifies repos with low merge rates or high rejection
WITH pr_stats AS (
  SELECT
    r.name AS repo,
    r.language,
    r.stars,
    COUNT(*) AS total_prs,
    COUNT(CASE WHEN pr.status = 'merged' THEN 1 END) AS merged,
    COUNT(CASE WHEN pr.status = 'open' THEN 1 END) AS open_prs,
    COUNT(CASE WHEN pr.status = 'closed' THEN 1 END) AS rejected,
    COUNT(DISTINCT pr.author) AS contributors
  FROM pull_requests pr
  JOIN repos r ON pr.repo_id = r.id
  GROUP BY r.name, r.language, r.stars
)
SELECT
  repo,
  language,
  stars,
  total_prs,
  merged,
  rejected,
  open_prs,
  contributors,
  ROUND(merged * 100.0 / total_prs, 1) AS merge_rate_pct
FROM pr_stats
ORDER BY merge_rate_pct DESC`,
      },
      {
        label: 'Top contributors',
        sql: `-- Developer leaderboard by code contribution
-- Measures commits, code churn, and impact across repos
WITH author_stats AS (
  SELECT
    author,
    COUNT(*) AS total_commits,
    SUM(additions) AS total_additions,
    SUM(deletions) AS total_deletions,
    SUM(additions + deletions) AS total_churn,
    COUNT(DISTINCT repo_id) AS repos_touched,
    MIN(CAST(committed_at AS DATE)) AS first_commit,
    MAX(CAST(committed_at AS DATE)) AS last_commit
  FROM commits
  GROUP BY author
)
SELECT
  author,
  total_commits,
  total_additions,
  total_deletions,
  total_churn,
  repos_touched,
  first_commit,
  last_commit,
  ROUND(total_deletions * 100.0
    / NULLIF(total_churn, 0), 1) AS delete_ratio_pct,
  (last_commit - first_commit) AS active_days
FROM author_stats
ORDER BY total_churn DESC
LIMIT 15`,
      },
      {
        label: 'Stars vs forks scatter',
        sql: `-- Repo popularity: stars vs forks
-- Dot size represents the fork-to-star ratio
SELECT
  r.name,
  r.language,
  r.stars,
  r.forks,
  ROUND(r.forks * 100.0 / NULLIF(r.stars, 0), 1)
    AS fork_pct,
  (SELECT COUNT(*) FROM commits c
   WHERE c.repo_id = r.id) AS commit_count
FROM repos r
ORDER BY r.stars DESC`,
      },
    ],
  },
  {
    id: 'weather',
    name: 'Weather Stations',
    tables: [
      {
        name: 'stations',
        csvPath: 'datasets/weather/stations.csv',
        columns: [
          { name: 'id', type: 'number' },
          { name: 'name', type: 'string' },
          { name: 'city', type: 'string' },
          { name: 'country', type: 'string' },
          { name: 'latitude', type: 'number' },
          { name: 'longitude', type: 'number' },
          { name: 'elevation', type: 'number' },
        ],
      },
      {
        name: 'readings',
        csvPath: 'datasets/weather/readings.csv',
        columns: [
          { name: 'id', type: 'number' },
          { name: 'station_id', type: 'number' },
          { name: 'date', type: 'date' },
          { name: 'temp_high', type: 'number' },
          { name: 'temp_low', type: 'number' },
          { name: 'precipitation', type: 'number' },
          { name: 'wind_speed', type: 'number' },
        ],
      },
    ],
    starterQueries: [
      {
        label: 'City climate summary',
        sql: `-- Comprehensive climate statistics per city
-- Includes temperature ranges, precipitation, and wind
WITH city_stats AS (
  SELECT
    s.city,
    s.country,
    COUNT(r.id) AS total_readings,
    ROUND(AVG(r.temp_high), 1) AS avg_high,
    ROUND(AVG(r.temp_low), 1) AS avg_low,
    ROUND(AVG(r.temp_high - r.temp_low), 1) AS avg_range,
    MAX(r.temp_high) AS max_temp,
    MIN(r.temp_low) AS min_temp,
    ROUND(AVG(r.precipitation), 1) AS avg_precip,
    ROUND(SUM(r.precipitation), 1) AS total_precip,
    ROUND(AVG(r.wind_speed), 1) AS avg_wind,
    MAX(r.wind_speed) AS max_wind
  FROM readings r
  JOIN stations s ON r.station_id = s.id
  GROUP BY s.city, s.country
)
SELECT
  city,
  country,
  total_readings,
  avg_high,
  avg_low,
  avg_range,
  max_temp,
  min_temp,
  avg_precip,
  total_precip,
  avg_wind,
  max_wind
FROM city_stats
ORDER BY avg_high DESC`,
      },
      {
        label: 'Daily temperature trend',
        sql: `-- Daily average temperatures across all stations
-- Shows seasonal patterns and temperature spread
SELECT
  CAST(r.date AS DATE) AS day,
  ROUND(AVG(r.temp_high), 1) AS avg_high,
  ROUND(AVG(r.temp_low), 1) AS avg_low,
  ROUND(MAX(r.temp_high) - MIN(r.temp_low), 1)
    AS daily_spread,
  ROUND(AVG(r.precipitation), 1) AS avg_precip
FROM readings r
GROUP BY CAST(r.date AS DATE)
ORDER BY day`,
      },
      {
        label: 'City × country heatmap',
        sql: `-- Reading count by city and country
-- Reveals data coverage across locations
SELECT
  s.city,
  s.country,
  COUNT(*) AS readings,
  ROUND(AVG(r.temp_high), 1) AS avg_temp
FROM readings r
JOIN stations s ON r.station_id = s.id
GROUP BY s.city, s.country
ORDER BY readings DESC`,
      },
      {
        label: 'Temperature vs wind scatter',
        sql: `-- Relationship between temperature and wind speed
-- Colored by city to show geographic patterns
SELECT
  s.city,
  r.temp_high,
  r.wind_speed,
  r.precipitation
FROM readings r
JOIN stations s ON r.station_id = s.id`,
      },
      {
        label: 'Precipitation by country',
        sql: `-- Total and average precipitation by country
-- Identifies wettest and driest regions
WITH country_precip AS (
  SELECT
    s.country,
    COUNT(*) AS reading_count,
    ROUND(SUM(r.precipitation), 1) AS total_precip,
    ROUND(AVG(r.precipitation), 2) AS avg_daily_precip,
    MAX(r.precipitation) AS max_single_day,
    COUNT(CASE WHEN r.precipitation > 0 THEN 1 END) AS rainy_days
  FROM readings r
  JOIN stations s ON r.station_id = s.id
  GROUP BY s.country
)
SELECT
  country,
  total_precip,
  avg_daily_precip,
  max_single_day,
  rainy_days,
  ROUND(rainy_days * 100.0 / reading_count, 1)
    AS rainy_day_pct
FROM country_precip
ORDER BY total_precip DESC`,
      },
      {
        label: 'Extreme weather alerts',
        sql: `-- Days with extreme conditions
-- High temp, strong wind, or heavy precipitation
SELECT
  s.name AS station,
  s.city,
  s.country,
  CAST(r.date AS DATE) AS day,
  r.temp_high,
  r.temp_low,
  r.wind_speed,
  r.precipitation,
  CASE
    WHEN r.temp_high > 38 THEN 'Extreme heat'
    WHEN r.temp_low < -5 THEN 'Extreme cold'
    WHEN r.wind_speed > 45 THEN 'High wind'
    WHEN r.precipitation > 25 THEN 'Heavy rain'
    ELSE 'Moderate'
  END AS alert_type
FROM readings r
JOIN stations s ON r.station_id = s.id
WHERE r.temp_high > 38
   OR r.temp_low < -5
   OR r.wind_speed > 45
   OR r.precipitation > 25
ORDER BY r.temp_high DESC
LIMIT 25`,
      },
    ],
  },
];

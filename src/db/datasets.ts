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
        label: 'Revenue by category (pie)',
        sql: `SELECT p.category, ROUND(SUM(o.total), 2) AS revenue
FROM orders o
JOIN products p ON o.product_id = p.id
WHERE o.status != 'cancelled'
GROUP BY p.category
ORDER BY revenue DESC`,
      },
      {
        label: 'Monthly revenue trend',
        sql: `SELECT DATE_TRUNC('month', CAST(order_date AS DATE)) AS month,
       ROUND(SUM(total), 2) AS revenue,
       COUNT(*) AS order_count
FROM orders
WHERE status != 'cancelled'
GROUP BY month
ORDER BY month`,
      },
      {
        label: 'Top 10 customers by lifetime value',
        sql: `SELECT c.name AS customer,
       c.country,
       COUNT(o.id) AS orders,
       ROUND(SUM(o.total), 2) AS lifetime_value,
       ROUND(AVG(o.total), 2) AS avg_order
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.status != 'cancelled'
GROUP BY c.name, c.country
ORDER BY lifetime_value DESC
LIMIT 10`,
      },
      {
        label: 'Country × status breakdown (heatmap)',
        sql: `SELECT c.country, o.status, COUNT(*) AS order_count
FROM orders o
JOIN customers c ON o.customer_id = c.id
GROUP BY c.country, o.status
ORDER BY c.country, o.status`,
      },
      {
        label: 'Orders by status (pie)',
        sql: `SELECT status, COUNT(*) AS count
FROM orders
GROUP BY status
ORDER BY count DESC`,
      },
      {
        label: 'Price vs stock (scatter)',
        sql: `SELECT p.name, p.price, p.stock, p.category
FROM products p
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
        label: 'Stars by language (pie)',
        sql: `SELECT language, SUM(stars) AS total_stars
FROM repos
GROUP BY language
ORDER BY total_stars DESC`,
      },
      {
        label: 'Author × language activity (heatmap)',
        sql: `SELECT co.author, r.language, COUNT(*) AS commits
FROM commits co
JOIN repos r ON co.repo_id = r.id
GROUP BY co.author, r.language
ORDER BY commits DESC`,
      },
      {
        label: 'Weekly commit activity',
        sql: `SELECT DATE_TRUNC('week', CAST(committed_at AS DATE)) AS week,
       COUNT(*) AS commits,
       SUM(additions) AS lines_added,
       SUM(deletions) AS lines_removed
FROM commits
GROUP BY week
ORDER BY week`,
      },
      {
        label: 'PR merge rate by repo',
        sql: `SELECT r.name AS repo,
       COUNT(*) AS total_prs,
       COUNT(CASE WHEN pr.status = 'merged' THEN 1 END) AS merged,
       ROUND(COUNT(CASE WHEN pr.status = 'merged' THEN 1 END) * 100.0 / COUNT(*), 1) AS merge_rate_pct
FROM pull_requests pr
JOIN repos r ON pr.repo_id = r.id
GROUP BY r.name
ORDER BY merge_rate_pct DESC`,
      },
      {
        label: 'Top contributors by churn',
        sql: `SELECT author,
       COUNT(*) AS commits,
       SUM(additions) AS additions,
       SUM(deletions) AS deletions,
       SUM(additions + deletions) AS total_churn,
       ROUND(SUM(deletions) * 100.0 / NULLIF(SUM(additions + deletions), 0), 1) AS delete_pct
FROM commits
GROUP BY author
ORDER BY total_churn DESC
LIMIT 10`,
      },
      {
        label: 'Stars vs forks (scatter)',
        sql: `SELECT name, stars, forks, language
FROM repos
ORDER BY stars DESC`,
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
        label: 'Avg high temp by city (bar)',
        sql: `SELECT s.city,
       ROUND(AVG(r.temp_high), 1) AS avg_high,
       ROUND(AVG(r.temp_low), 1) AS avg_low,
       ROUND(AVG(r.wind_speed), 1) AS avg_wind
FROM readings r
JOIN stations s ON r.station_id = s.id
GROUP BY s.city
ORDER BY avg_high DESC`,
      },
      {
        label: 'Daily temperature trend (line)',
        sql: `SELECT CAST(r.date AS DATE) AS day,
       ROUND(AVG(r.temp_high), 1) AS avg_high,
       ROUND(AVG(r.temp_low), 1) AS avg_low
FROM readings r
GROUP BY day
ORDER BY day`,
      },
      {
        label: 'City × country readings (heatmap)',
        sql: `SELECT s.city, s.country, COUNT(*) AS readings
FROM readings r
JOIN stations s ON r.station_id = s.id
GROUP BY s.city, s.country
ORDER BY readings DESC`,
      },
      {
        label: 'Temperature vs wind speed (scatter)',
        sql: `SELECT r.temp_high, r.wind_speed, s.city
FROM readings r
JOIN stations s ON r.station_id = s.id`,
      },
      {
        label: 'Precipitation by country (pie)',
        sql: `SELECT s.country,
       ROUND(SUM(r.precipitation), 1) AS total_precip
FROM readings r
JOIN stations s ON r.station_id = s.id
GROUP BY s.country
ORDER BY total_precip DESC`,
      },
      {
        label: 'Extreme weather days',
        sql: `SELECT s.name AS station,
       s.city,
       CAST(r.date AS DATE) AS day,
       r.temp_high,
       r.wind_speed,
       r.precipitation
FROM readings r
JOIN stations s ON r.station_id = s.id
WHERE r.temp_high > 35 OR r.wind_speed > 40 OR r.precipitation > 30
ORDER BY r.temp_high DESC
LIMIT 20`,
      },
    ],
  },
];

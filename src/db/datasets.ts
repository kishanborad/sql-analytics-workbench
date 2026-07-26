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
        label: 'Top 5 customers by spend',
        sql: `SELECT c.name, SUM(o.total) AS total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.name
ORDER BY total_spent DESC
LIMIT 5`,
      },
      {
        label: 'Monthly revenue trend',
        sql: `SELECT DATE_TRUNC('month', CAST(order_date AS DATE)) AS month,
       SUM(total) AS revenue
FROM orders
WHERE status != 'cancelled'
GROUP BY month
ORDER BY month`,
      },
      {
        label: 'Orders by status',
        sql: `SELECT status, COUNT(*) AS count
FROM orders
GROUP BY status
ORDER BY count DESC`,
      },
      {
        label: 'Avg order value by category',
        sql: `SELECT p.category, ROUND(AVG(o.total), 2) AS avg_order
FROM orders o
JOIN products p ON o.product_id = p.id
GROUP BY p.category
ORDER BY avg_order DESC`,
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
        label: 'Commits per author per month',
        sql: `SELECT author,
       DATE_TRUNC('month', CAST(committed_at AS DATE)) AS month,
       COUNT(*) AS commits
FROM commits
GROUP BY author, month
ORDER BY month, commits DESC`,
      },
      {
        label: 'Most starred repos by language',
        sql: `SELECT language, name, stars
FROM repos
ORDER BY stars DESC
LIMIT 10`,
      },
      {
        label: 'PR merge rate by repo',
        sql: `SELECT r.name,
       COUNT(*) AS total_prs,
       COUNT(CASE WHEN pr.status = 'merged' THEN 1 END) AS merged,
       ROUND(COUNT(CASE WHEN pr.status = 'merged' THEN 1 END) * 100.0 / COUNT(*), 1) AS merge_pct
FROM pull_requests pr
JOIN repos r ON pr.repo_id = r.id
GROUP BY r.name
ORDER BY merge_pct DESC`,
      },
      {
        label: 'Lines changed distribution',
        sql: `SELECT author,
       SUM(additions) AS total_additions,
       SUM(deletions) AS total_deletions,
       SUM(additions + deletions) AS total_changes
FROM commits
GROUP BY author
ORDER BY total_changes DESC`,
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
        label: 'Avg temperature by city',
        sql: `SELECT s.city,
       ROUND(AVG(r.temp_high), 1) AS avg_high,
       ROUND(AVG(r.temp_low), 1) AS avg_low
FROM readings r
JOIN stations s ON r.station_id = s.id
GROUP BY s.city
ORDER BY avg_high DESC`,
      },
      {
        label: 'Precipitation over time',
        sql: `SELECT CAST(date AS DATE) AS day,
       ROUND(AVG(precipitation), 1) AS avg_precip
FROM readings
GROUP BY day
ORDER BY day`,
      },
      {
        label: 'Hottest days across stations',
        sql: `SELECT s.name, r.date, r.temp_high
FROM readings r
JOIN stations s ON r.station_id = s.id
ORDER BY r.temp_high DESC
LIMIT 10`,
      },
      {
        label: 'Wind speed vs temperature',
        sql: `SELECT temp_high, wind_speed
FROM readings
ORDER BY temp_high`,
      },
    ],
  },
];

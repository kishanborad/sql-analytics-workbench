---
title: E-commerce Dataset
category: datasets
tags: [ecommerce, orders, customers, products, retail]
---

# E-commerce Dataset

Simulates a small online retail platform with three related tables.

## Tables

### customers (200 rows)
Registered shoppers with location and signup date. Foreign key target for orders.

### products (50 rows)
Catalog items across five categories (Electronics, Clothing, Books, Home, Sports) with price and stock levels.

### orders (500 rows)
Purchase records linking customers to products. Includes quantity, computed total, status (completed/pending/shipped/cancelled/returned), and order date.

## Relationships
- orders.customer_id references customers.id
- orders.product_id references products.id

## Interesting queries
- Revenue trends by month (filter out cancelled orders)
- Customer lifetime value (sum of order totals per customer)
- Category performance (avg order value, total sales)
- Geographic distribution of orders via customer city/country

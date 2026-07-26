---
title: Weather Stations Dataset
category: datasets
tags: [weather, stations, temperature, precipitation, time-series]
---

# Weather Stations Dataset

Daily weather readings from 30 stations across 10 cities worldwide.

## Tables

### stations (30 rows)
Three stations per city (Airport, Downtown, Harbor variants) with GPS coordinates and elevation.

### readings (~800 rows)
Daily observations with high/low temperature, precipitation, and wind speed. Each station has 20-35 readings spread over several months.

## Relationships
- readings.station_id references stations.id

## Interesting queries
- Temperature averages by city or country
- Precipitation patterns over time
- Correlation between wind speed and temperature
- Elevation effects on temperature readings
- Hottest/coldest stations

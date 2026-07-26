# Stage 1: Generate datasets
FROM python:3.12-slim AS data-builder
WORKDIR /app
COPY python/ python/
RUN pip install --no-cache-dir -r python/requirements.txt
COPY public/ public/
RUN python python/generate_datasets.py --output public/datasets \
    && python python/validate_datasets.py --datasets public/datasets \
    && python python/schema_exporter.py --datasets public/datasets --output public/schemas.json

# Stage 2: Build frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
COPY --from=data-builder /app/public/datasets/ public/datasets/
COPY --from=data-builder /app/public/schemas.json public/schemas.json
RUN npx tsc -b && npx vite build

# Stage 3: Serve
FROM nginx:alpine
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

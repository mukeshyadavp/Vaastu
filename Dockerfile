FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt backend/requirements.txt

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY package.json package.json
COPY vite.config.ts vite.config.ts
COPY frontend frontend
COPY backend backend

RUN npm install
RUN npm run build

RUN mkdir -p backend/uploads backend/generated_reports backend/static

EXPOSE 5000

CMD ["sh", "-c", "cd backend && gunicorn -w 1 --threads 2 --timeout 120 -b 0.0.0.0:${PORT:-5000} app:app"]
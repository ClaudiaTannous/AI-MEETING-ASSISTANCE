FROM python:3.12-slim

# Set working directory inside container
WORKDIR /app

# Install system dependencies (Postgres, YAML, etc.)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    libyaml-dev \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (better caching)
COPY requirements.txt .


# Upgrade pip, setuptools, wheel
RUN pip install --upgrade pip setuptools wheel

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code into container
COPY app ./app

COPY .env ./app/.env


# Expose FastAPI port
EXPOSE 8080

# Run FastAPI (entrypoint is backend/app/main.py)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]

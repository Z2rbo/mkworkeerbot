# Telegram Bot Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy bot code
COPY backend/bot/ ./backend/bot/

# Environment
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Run bot
CMD ["python", "-m", "backend.bot.telegram_bot"]

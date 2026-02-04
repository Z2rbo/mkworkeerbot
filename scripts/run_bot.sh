#!/bin/bash

# Telegram Bot Runner
# Запускает бота отдельно

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🤖 Starting Telegram Bot..."

# Activate virtual environment
if [ -d "backend/venv" ]; then
    source backend/venv/bin/activate
else
    echo "❌ Virtual environment not found. Run run_dev.sh first."
    exit 1
fi

# Load environment variables
if [ -f "config/.env" ]; then
    export $(cat config/.env | grep -v '^#' | xargs)
fi

# Check for bot token
if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ "$TELEGRAM_BOT_TOKEN" = "YOUR_BOT_TOKEN_HERE" ]; then
    echo "❌ TELEGRAM_BOT_TOKEN not set!"
    echo "   1. Get a token from @BotFather"
    echo "   2. Add it to config/.env"
    exit 1
fi

cd backend
python -m bot.telegram_bot

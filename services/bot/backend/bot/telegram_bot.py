"""
Portfolio Telegram Bot
Sales funnel bot for portfolio with:
- Welcome message with value proposition
- Service showcase
- Portfolio preview
- Lead capture
- CTA for consultation booking
"""

import os
import asyncio
import logging
from typing import Optional
from datetime import datetime

from telegram import (
    Update, 
    InlineKeyboardButton, 
    InlineKeyboardMarkup,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
    WebAppInfo
)
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    MessageHandler,
    ConversationHandler,
    filters,
    ContextTypes
)
import aiohttp

# Configuration
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api")
WEBSITE_URL = os.getenv("WEBSITE_URL", "https://your-portfolio.com")
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "")

# Logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Conversation states
(
    STATE_START,
    STATE_SERVICE_SELECTED,
    STATE_VIEWING_PORTFOLIO,
    STATE_CONTACT_NAME,
    STATE_CONTACT_EMAIL,
    STATE_CONTACT_MESSAGE,
    STATE_BUDGET,
) = range(7)

# Text constants
TEXTS = {
    "welcome": """
*Привет! Я Макар* \U0001f91d

Мне 16 лет. Занимаюсь дизайном курсов, монтажом рилсов и созданием Telegram-ботов.

*Мои услуги:*
\U0001f3a8 Дизайн — курсы, сайты, WB, чек-листы, аватарки, баннеры
\U0001f3ac Монтаж рилсов — вирусные ролики для блогеров
\U0001f916 Telegram Боты — воронки продаж и автоматизация
\U0001f310 Дизайн сайтов — лендинги и интернет-магазины

*Результаты:*
\U0001f4c8 15к подписчиков на YouTube за 10 видео
\U0001f525 Кейсы с блогерами-миллиониками
\U0001f3af 60+ человек на ивентах

Выберите раздел \U0001f447
    """,
    
    "design_info": """
*Дизайн курсов, сайтов и не только*

Создаю визуал для инфопродуктов, блогеров и бизнеса.

*Что делаю:*
• Презентации для курсов и вебинаров
• Дизайн сайтов — лендинги, интернет-магазины
• Инфографика для Wildberries
• Чек-листы и PDF-материалы
• Аватарки для каналов и соцсетей
• Баннеры и оформление мероприятий
• Визуальный стиль продукта

*Сроки:* от 2 дней
*Стоимость:* от 5000₽

*Примеры работ:* @dsgnportfromz2rbo
    """,
    
    "development_info": """
*Монтаж рилсов и шортсов*

Делаю вирусные ролики для блогеров и пабликов.

*Форматы:*
• Рилсы для Instagram
• Шортсы для YouTube
• TikTok видео
• Контент для пабликов

*Результаты:*
• Кейсы с блогерами-миллиониками
• 15к подписчиков на своём YouTube за 10 видео

*Сроки:* от 1 дня
*Стоимость:* от 2000₽

*Примеры работ:* @reelsexamples
    """,
    
    "bot_info": """
*Telegram Боты*

Создаю ботов для автоматизации и продаж.

*Возможности:*
• Воронки продаж
• Чат-боты для поддержки
• Боты-магазины
• Интеграции с платежами
• Уведомления и рассылки

*Примеры:*
• Бот для записи на услуги
• Бот-магазин с каталогом
• Бот техподдержки

*Сроки:* от 3 дней
*Стоимость:* от 10000₽
    """,
    
    "marketing_info": """
*Контент и продвижение*

Знаю как делать контент, который набирает охваты.

*Мой опыт:*
• 15к подписчиков на YouTube за 10 видео
• Работа с блогерами-миллиониками
• Организация мероприятий на 30-60 человек

*Могу помочь с:*
• Стратегией контента
• Оформлением канала
• Идеями для вирусных роликов

*Мой YouTube:* @m1ndpeak
    """,
    
    "portfolio_intro": """
*Мои работы*

Избранные проекты по категориям. Полное портфолио — на сайте и в каналах.

*Каналы с работами:*
• Дизайн: @dsgnportfromz2rbo
• Рилсы: @reelsexamples
• YouTube: @m1ndpeak
    """,
    
    "contact_start": """
*Давайте обсудим ваш проект*

Расскажите немного о себе, чтобы я мог подготовить предложение.

Как вас зовут?
    """,
    
    "contact_email": """
Отлично, {name}!

Укажите ваш email или Telegram для связи:
    """,
    
    "contact_message": """
Опишите кратко ваш проект или задачу:
    """,
    
    "contact_budget": """
Какой бюджет вы рассматриваете?
    """,
    
    "contact_success": """
*Заявка отправлена*

Спасибо за интерес. Свяжусь с вами в течение 24 часов.

А пока можете посмотреть портфолио на сайте или изучить другие услуги.
    """,
    
    "about": """
*Привет, я Макар*

16 лет. Учусь в школе и параллельно работаю над проектами.

*Чем занимаюсь:*
• Дизайн курсов и презентаций
• Монтаж рилсов (кейсы с миллиониками)
• YouTube: 15к подписчиков за 10 видео
• Telegram-боты
• Организация мероприятий на 30-60 человек

*Также:*
• Занимаюсь тайским боксом
• Был опыт в трейдинге и P2P

*Контакты:*
• Сайт: {website}
• Дизайн: @dsgnportfromz2rbo
• Рилсы: @reelsexamples
• YouTube: @m1ndpeak
    """,
    
    "help": """
*Навигация по боту*

Команды:
/start — Главное меню
/services — Услуги
/portfolio — Мои работы
/contact — Оставить заявку
/about — Обо мне
/website — Открыть сайт

Есть вопрос? Просто напишите.
    """
}

# Keyboards
def get_main_keyboard():
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("\U0001f3a8 Дизайн", callback_data="service_design"),
            InlineKeyboardButton("\U0001f3ac Рилсы", callback_data="service_development")
        ],
        [
            InlineKeyboardButton("\U0001f916 Telegram Боты", callback_data="service_bot"),
            InlineKeyboardButton("\U0001f4c8 Контент", callback_data="service_marketing")
        ],
        [
            InlineKeyboardButton("\U0001f4c1 Портфолио", callback_data="portfolio"),
            InlineKeyboardButton("\U0001f464 Обо мне", callback_data="about")
        ],
        [
            InlineKeyboardButton("\U0001f4dd Оставить заявку", callback_data="contact")
        ],
        [
            InlineKeyboardButton("\U0001f310 Открыть сайт", url=WEBSITE_URL)
        ]
    ])

def get_service_keyboard(service: str):
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("Примеры работ", callback_data=f"portfolio_{service}"),
            InlineKeyboardButton("Узнать цену", callback_data="contact")
        ],
        [
            InlineKeyboardButton("Назад", callback_data="back_main")
        ]
    ])

def get_portfolio_keyboard():
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("Дизайн", url="https://t.me/dsgnportfromz2rbo"),
            InlineKeyboardButton("Рилсы", url="https://t.me/reelsexamples")
        ],
        [
            InlineKeyboardButton("YouTube", url="https://youtube.com/@m1ndpeak")
        ],
        [
            InlineKeyboardButton("Все работы на сайте", url=f"{WEBSITE_URL}#works")
        ],
        [
            InlineKeyboardButton("Заказать проект", callback_data="contact")
        ],
        [
            InlineKeyboardButton("Назад", callback_data="back_main")
        ]
    ])

def get_contact_cancel_keyboard():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("Отмена", callback_data="cancel_contact")]
    ])

def get_budget_keyboard():
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("До 5000₽", callback_data="budget_5000"),
            InlineKeyboardButton("5-10к₽", callback_data="budget_10000")
        ],
        [
            InlineKeyboardButton("10-30к₽", callback_data="budget_30000"),
            InlineKeyboardButton("30к+ ₽", callback_data="budget_30000plus")
        ],
        [
            InlineKeyboardButton("Обсудим", callback_data="budget_discuss")
        ]
    ])

def get_back_keyboard():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("« Назад", callback_data="back_main")]
    ])

def get_after_contact_keyboard():
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("📁 Портфолио", callback_data="portfolio"),
            InlineKeyboardButton("🌐 Сайт", url=WEBSITE_URL)
        ],
        [
            InlineKeyboardButton("🏠 Главное меню", callback_data="back_main")
        ]
    ])

# Handlers
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Send welcome message with main menu."""
    user = update.effective_user
    logger.info(f"User {user.id} ({user.username}) started the bot")
    
    await update.message.reply_text(
        TEXTS["welcome"],
        parse_mode="Markdown",
        reply_markup=get_main_keyboard()
    )
    
    return STATE_START

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handle button callbacks."""
    query = update.callback_query
    await query.answer()
    
    data = query.data
    
    # Service info
    if data == "service_design":
        await query.edit_message_text(
            TEXTS["design_info"],
            parse_mode="Markdown",
            reply_markup=get_service_keyboard("design")
        )
        return STATE_SERVICE_SELECTED
    
    elif data == "service_development":
        await query.edit_message_text(
            TEXTS["development_info"],
            parse_mode="Markdown",
            reply_markup=get_service_keyboard("development")
        )
        return STATE_SERVICE_SELECTED
    
    elif data == "service_bot":
        await query.edit_message_text(
            TEXTS["bot_info"],
            parse_mode="Markdown",
            reply_markup=get_service_keyboard("bot")
        )
        return STATE_SERVICE_SELECTED
    
    elif data == "service_marketing":
        await query.edit_message_text(
            TEXTS["marketing_info"],
            parse_mode="Markdown",
            reply_markup=get_service_keyboard("marketing")
        )
        return STATE_SERVICE_SELECTED
    
    # Portfolio
    elif data == "portfolio" or data.startswith("portfolio_"):
        await show_portfolio(query, context, data)
        return STATE_VIEWING_PORTFOLIO
    
    # About
    elif data == "about":
        await query.edit_message_text(
            TEXTS["about"].format(website=WEBSITE_URL),
            parse_mode="Markdown",
            reply_markup=get_back_keyboard()
        )
        return STATE_START
    
    # Contact flow
    elif data == "contact":
        await query.edit_message_text(
            TEXTS["contact_start"],
            parse_mode="Markdown",
            reply_markup=get_contact_cancel_keyboard()
        )
        return STATE_CONTACT_NAME
    
    elif data == "cancel_contact":
        await query.edit_message_text(
            TEXTS["welcome"],
            parse_mode="Markdown",
            reply_markup=get_main_keyboard()
        )
        return STATE_START
    
    # Budget selection
    elif data.startswith("budget_"):
        budget = data.replace("budget_", "")
        context.user_data["budget"] = budget
        return await save_contact(update, context)
    
    # Back to main
    elif data == "back_main":
        await query.edit_message_text(
            TEXTS["welcome"],
            parse_mode="Markdown",
            reply_markup=get_main_keyboard()
        )
        return STATE_START
    
    return STATE_START

async def show_portfolio(query, context: ContextTypes.DEFAULT_TYPE, filter_type: str):
    """Show portfolio items."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{API_BASE_URL}/works") as response:
                if response.status == 200:
                    works = await response.json()
                    
                    # Filter if needed
                    if filter_type != "portfolio":
                        category = filter_type.replace("portfolio_", "")
                        works = [w for w in works if w.get("category") == category]
                    
                    # Show first 3 works
                    works = works[:3]
                    
                    if works:
                        text = TEXTS["portfolio_intro"] + "\n"
                        for work in works:
                            text += f"\n*{work['title']}*\n_{work['description']}_\n"
                        
                        await query.edit_message_text(
                            text,
                            parse_mode="Markdown",
                            reply_markup=get_portfolio_keyboard()
                        )
                    else:
                        await query.edit_message_text(
                            "📁 Работы скоро появятся! Следите за обновлениями.",
                            reply_markup=get_back_keyboard()
                        )
                else:
                    raise Exception("API error")
    except Exception as e:
        logger.error(f"Error fetching portfolio: {e}")
        await query.edit_message_text(
            TEXTS["portfolio_intro"] + "\n\n🌐 Полное портфолио доступно на сайте!",
            parse_mode="Markdown",
            reply_markup=get_portfolio_keyboard()
        )

async def receive_name(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Receive user's name."""
    name = update.message.text.strip()
    context.user_data["name"] = name
    
    await update.message.reply_text(
        TEXTS["contact_email"].format(name=name),
        parse_mode="Markdown",
        reply_markup=get_contact_cancel_keyboard()
    )
    
    return STATE_CONTACT_EMAIL

async def receive_email(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Receive user's email."""
    email = update.message.text.strip()
    
    # Basic email validation
    if "@" not in email or "." not in email:
        await update.message.reply_text(
            "⚠️ Пожалуйста, введите корректный email:",
            reply_markup=get_contact_cancel_keyboard()
        )
        return STATE_CONTACT_EMAIL
    
    context.user_data["email"] = email
    
    await update.message.reply_text(
        TEXTS["contact_message"],
        parse_mode="Markdown",
        reply_markup=get_contact_cancel_keyboard()
    )
    
    return STATE_CONTACT_MESSAGE

async def receive_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Receive user's message."""
    message = update.message.text.strip()
    context.user_data["message"] = message
    
    await update.message.reply_text(
        TEXTS["contact_budget"],
        parse_mode="Markdown",
        reply_markup=get_budget_keyboard()
    )
    
    return STATE_BUDGET

async def save_contact(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Save contact to database and notify admin."""
    query = update.callback_query
    user = update.effective_user
    user_data = context.user_data
    
    # Prepare contact data
    contact_data = {
        "name": user_data.get("name", "Unknown"),
        "email": user_data.get("email", ""),
        "service": "Consultation",
        "message": f"Budget: {user_data.get('budget', 'Not specified')}\n\n{user_data.get('message', '')}\n\nTelegram: @{user.username or 'N/A'} (ID: {user.id})"
    }
    
    # Send to API
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{API_BASE_URL}/contact",
                json=contact_data
            ) as response:
                if response.status != 200:
                    logger.error(f"Failed to save contact: {await response.text()}")
    except Exception as e:
        logger.error(f"Error saving contact: {e}")
    
    # Notify admin
    if ADMIN_CHAT_ID:
        try:
            admin_message = f"""
🔔 *Новая заявка!*

👤 *Имя:* {contact_data['name']}
📧 *Email:* {contact_data['email']}
💬 *Telegram:* @{user.username or 'N/A'}
💰 *Бюджет:* {user_data.get('budget', 'Не указан')}

📝 *Сообщение:*
{user_data.get('message', '-')}

🕐 {datetime.now().strftime('%d.%m.%Y %H:%M')}
            """
            await context.bot.send_message(
                chat_id=ADMIN_CHAT_ID,
                text=admin_message,
                parse_mode="Markdown"
            )
        except Exception as e:
            logger.error(f"Error notifying admin: {e}")
    
    # Clear user data
    context.user_data.clear()
    
    # Send success message
    await query.edit_message_text(
        TEXTS["contact_success"],
        parse_mode="Markdown",
        reply_markup=get_after_contact_keyboard()
    )
    
    return STATE_START

async def services_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Show services menu."""
    keyboard = InlineKeyboardMarkup([
        [
            InlineKeyboardButton("\U0001f3a8 Дизайн", callback_data="service_design"),
            InlineKeyboardButton("\U0001f3ac Рилсы", callback_data="service_development")
        ],
        [
            InlineKeyboardButton("\U0001f916 Telegram Боты", callback_data="service_bot"),
            InlineKeyboardButton("\U0001f4c8 Маркетинг", callback_data="service_marketing")
        ]
    ])
    
    await update.message.reply_text(
        "🛠 *Мои услуги*\n\nВыберите направление:",
        parse_mode="Markdown",
        reply_markup=keyboard
    )
    
    return STATE_START

async def portfolio_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Show portfolio."""
    await update.message.reply_text(
        TEXTS["portfolio_intro"],
        parse_mode="Markdown",
        reply_markup=get_portfolio_keyboard()
    )
    
    return STATE_VIEWING_PORTFOLIO

async def contact_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Start contact flow."""
    await update.message.reply_text(
        TEXTS["contact_start"],
        parse_mode="Markdown",
        reply_markup=get_contact_cancel_keyboard()
    )
    
    return STATE_CONTACT_NAME

async def about_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Show about info."""
    await update.message.reply_text(
        TEXTS["about"].format(website=WEBSITE_URL),
        parse_mode="Markdown",
        reply_markup=get_back_keyboard()
    )
    
    return STATE_START

async def website_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send website link."""
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🌐 Открыть сайт", url=WEBSITE_URL)]
    ])
    
    await update.message.reply_text(
        "🌐 *Мой сайт*\n\nПолное портфолио и информация об услугах:",
        parse_mode="Markdown",
        reply_markup=keyboard
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show help message."""
    await update.message.reply_text(
        TEXTS["help"],
        parse_mode="Markdown"
    )

async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handle free text messages."""
    text = update.message.text.lower()
    
    # Keywords matching
    if any(word in text for word in ["дизайн", "ui", "ux", "интерфейс"]):
        await update.message.reply_text(
            TEXTS["design_info"],
            parse_mode="Markdown",
            reply_markup=get_service_keyboard("design")
        )
        return STATE_SERVICE_SELECTED
    
    elif any(word in text for word in ["разработ", "сайт", "web", "приложение"]):
        await update.message.reply_text(
            TEXTS["development_info"],
            parse_mode="Markdown",
            reply_markup=get_service_keyboard("development")
        )
        return STATE_SERVICE_SELECTED
    
    elif any(word in text for word in ["бот", "telegram", "автоматиз"]):
        await update.message.reply_text(
            TEXTS["bot_info"],
            parse_mode="Markdown",
            reply_markup=get_service_keyboard("bot")
        )
        return STATE_SERVICE_SELECTED
    
    elif any(word in text for word in ["маркетинг", "smm", "продвижение", "реклама"]):
        await update.message.reply_text(
            TEXTS["marketing_info"],
            parse_mode="Markdown",
            reply_markup=get_service_keyboard("marketing")
        )
        return STATE_SERVICE_SELECTED
    
    elif any(word in text for word in ["цена", "стоимость", "сколько", "прайс"]):
        await update.message.reply_text(
            "💰 Стоимость зависит от сложности проекта.\n\nОставьте заявку, и я подготовлю индивидуальное предложение!",
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("📝 Оставить заявку", callback_data="contact")]
            ])
        )
        return STATE_START
    
    else:
        await update.message.reply_text(
            "Не совсем понял вас. 🤔\n\nВыберите интересующий раздел:",
            reply_markup=get_main_keyboard()
        )
        return STATE_START

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Cancel conversation."""
    context.user_data.clear()
    
    await update.message.reply_text(
        "Отменено. Возвращаемся в главное меню:",
        reply_markup=get_main_keyboard()
    )
    
    return STATE_START

def main():
    """Run the bot."""
    if BOT_TOKEN == "YOUR_BOT_TOKEN_HERE":
        logger.error("Please set TELEGRAM_BOT_TOKEN environment variable")
        return
    
    # Create application
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Conversation handler
    conv_handler = ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={
            STATE_START: [
                CallbackQueryHandler(button_callback),
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text)
            ],
            STATE_SERVICE_SELECTED: [
                CallbackQueryHandler(button_callback),
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text)
            ],
            STATE_VIEWING_PORTFOLIO: [
                CallbackQueryHandler(button_callback),
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text)
            ],
            STATE_CONTACT_NAME: [
                CallbackQueryHandler(button_callback),
                MessageHandler(filters.TEXT & ~filters.COMMAND, receive_name)
            ],
            STATE_CONTACT_EMAIL: [
                CallbackQueryHandler(button_callback),
                MessageHandler(filters.TEXT & ~filters.COMMAND, receive_email)
            ],
            STATE_CONTACT_MESSAGE: [
                CallbackQueryHandler(button_callback),
                MessageHandler(filters.TEXT & ~filters.COMMAND, receive_message)
            ],
            STATE_BUDGET: [
                CallbackQueryHandler(button_callback)
            ],
        },
        fallbacks=[
            CommandHandler("cancel", cancel),
            CommandHandler("start", start)
        ],
        allow_reentry=True
    )
    
    # Add handlers
    application.add_handler(conv_handler)
    application.add_handler(CommandHandler("services", services_command))
    application.add_handler(CommandHandler("portfolio", portfolio_command))
    application.add_handler(CommandHandler("contact", contact_command))
    application.add_handler(CommandHandler("about", about_command))
    application.add_handler(CommandHandler("website", website_command))
    application.add_handler(CommandHandler("help", help_command))
    
    # Run bot
    logger.info("Starting bot...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()

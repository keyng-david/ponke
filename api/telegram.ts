const { Telegraf } = require('telegraf');
const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const SERVER_URL = process.env.SERVER_URL || '';
const FRONTEND_URL = process.env.FRONTEND_URL || '';
const JWT_SECRET = process.env.JWT_SECRET || '';

if (!BOT_TOKEN || !SERVER_URL || !FRONTEND_URL || !JWT_SECRET) {
  throw new Error('BOT_TOKEN, SERVER_URL, FRONTEND_URL, and JWT_SECRET must be set');
}

const bot = new Telegraf(BOT_TOKEN);

function generateToken(userId) {
  const payload = { sub: userId, id: uuidv4() };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

bot.start(async (ctx) => {
  try {
    const userId = ctx.from?.id;
    const token = generateToken(userId);
    const frontendUrl = `${FRONTEND_URL}/?token=${token}`;
    const inlineKeyboard = {
      inline_keyboard: [
        [{ text: "💎 Play 💎", url: frontendUrl }],
        [{ text: "Join Community", url: "https://t.me/your_community_link" }],
        [{ text: "Follow X", url: "https://t.me/your_follow_link" }],
        [{ text: "Guide", url: "https://t.me/your_guide_link" }],
      ],
    };

    await ctx.reply(
      "🎉Hi, you are now an intern at Keyng Koin!\n💲As long as you work hard, you can earn a minimum salary of $2 daily.\n👫If you invite your friends, you can gain salary raises then. The more friends, the higher the raise!",
      {
        reply_markup: inlineKeyboard,
      }
    );
  } catch (error) {
    console.error("Error handling /start command:", error);
    ctx.reply("Sorry, something went wrong. Please try again later.");
  }
});

// Set the webhook
bot.telegram.setWebhook(`${SERVER_URL}/api/telegram`);

const app = express();

// Middleware to handle webhook requests
app.use(bot.webhookCallback('/api/telegram'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred in webhook:', err);
  res.status(500).send('Internal Server Error');
});

bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Start the server (this is handled by Vercel)
module.exports = app;
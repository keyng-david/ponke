const { Telegraf } = require('telegraf');
const express = require('express');

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const SERVER_URL = process.env.SERVER_URL || '';

if (!BOT_TOKEN || !SERVER_URL) {
  throw new Error('BOT_TOKEN and SERVER_URL must be set');
}

const bot = new Telegraf(BOT_TOKEN);

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

// Start the server (this is handled by Vercel)
module.exports = app;
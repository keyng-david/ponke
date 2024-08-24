import { Telegraf } from 'telegraf';
import express from 'express';

const BOT_TOKEN = process.env.BOT_TOKEN || ''; // Ensure this is set in your environment variables
const SERVER_URL = process.env.SERVER_URL || ''; // The public URL of your Vercel app

if (!BOT_TOKEN || !SERVER_URL) {
  throw new Error('BOT_TOKEN and SERVER_URL must be set');
}

const bot = new Telegraf(BOT_TOKEN);

// Set the webhook
bot.telegram.setWebhook(`${SERVER_URL}/api/telegram`);

// Create an express app
const app = express();

// Middleware to handle webhook requests
app.use(bot.webhookCallback('/api/telegram'));

// Start the server (on Vercel, this part is handled by the platform, no need to specify a port)
export default app;
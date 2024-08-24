const { Telegraf } = require('telegraf');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Initialize bot with your token
const bot = new Telegraf(process.env.BOT_TOKEN);

// Generate JWT Token Function
function generateToken(userId) {
  const payload = { sub: userId, id: uuidv4() };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Function to handle the start command
bot.start(async (ctx) => {
  try {
    // Assuming the user ID is available in the ctx object
    const userId = ctx.from.id;
    
    // Generate JWT token for the user
    const token = generateToken(userId);

    // Generate the frontend URL with the token
    const frontendUrl = `${process.env.FRONTEND_URL}/?token=${token}`;

    // Prepare the inline keyboard with buttons
    const inlineKeyboard = {
      inline_keyboard: [
        [{ text: "💎 Play 💎", url: frontendUrl }],
        [{ text: "Join Community", url: "https://t.me/your_community_link" }],
        [{ text: "Follow X", url: "https://t.me/your_follow_link" }],
        [{ text: "Guide", url: "https://t.me/your_guide_link" }],
      ],
    };

    // Send the welcome message with the inline keyboard
    await ctx.replyWithPhoto(
      { url: "https://drive.google.com/file/d/1bhEIxgBy-mkLcSotD9f8xkdMJcnlgB_d/view?usp=drivesdk" },
      {
        caption: "🎉Hi, you are now an intern at Keyng Koin!\n💲As long as you work hard, you can earn a minimum salary of $2 daily.\n👫If you invite your friends, you can gain salary raises then. The more friends, the higher the raise!",
        reply_markup: inlineKeyboard,
      }
    );
  } catch (error) {
    console.error("Error handling /start command:", error);
    ctx.reply("Sorry, something went wrong. Please try again later.");
  }
});

// Set up the webhook
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;
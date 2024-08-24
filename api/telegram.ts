const { Telegraf } = require('telegraf');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Initialize bot with your token
const bot = new Telegraf(process.env.BOT_TOKEN);

// JWT Token Generation
function generateToken(userId) {
  const payload = { sub: userId, id: uuidv4() };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Handle the /start command
bot.start(async (ctx) => {
  try {
    const userId = ctx.from.id;
    const token = generateToken(userId);
    const frontendUrl = `${process.env.FRONTEND_URL}/?token=${token}`;
    const inlineKeyboard = {
      inline_keyboard: [
        [{ text: "💎 Play 💎", url: frontendUrl }],
        [{ text: "Join Community", url: "https://t.me/your_community_link" }],
        [{ text: "Follow X", url: "https://t.me/your_follow_link" }],
        [{ text: "Guide", url: "https://t.me/your_guide_link" }],
      ],
    };

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

// Handle incoming updates from Telegram
const handleUpdate = async (req, res) => {
  try {
    console.log('Incoming request:', req.body);

    // Verify that the request is indeed coming from Telegram
    const authHeader = req.headers['authorization'];
    if (!authHeader || authHeader !== `Bearer ${process.env.BOT_TOKEN}`) {
      return res.status(401).send('Unauthorized');
    }

    await bot.handleUpdate(req.body, res);

    // Ensure the response is sent to Telegram
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling update:', error);
    res.status(500).send('Internal Server Error');
  }
};

export default handleUpdate;

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
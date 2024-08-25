const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async function authHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: true, message: 'Method Not Allowed' });
  }

  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: true, message: 'Unauthorized' });
  }

  const telegramId = "6503512266"; // Replace with a static ID for testing
  const { data, error } = await supabase
    .from('users')
    .select('score, available_clicks, wallet, level')
    .eq('telegram_id', telegramId)
    .single();

  if (error) {
    return res.status(500).json({ error: true, message: error.message });
  }

  return res.status(200).json({ error: false, payload: data });
};
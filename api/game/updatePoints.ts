const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { session_id, click_score } = req.body;

    if (!session_id || click_score === undefined) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    // Use a single SQL transaction to update score and available clicks
    const { data, error } = await supabase
      .rpc('increment_score', { session_id, click_score });

    if (error) {
      console.error('Error updating score:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
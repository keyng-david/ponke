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

    // Check if session_id and click_score are valid
    if (!session_id || typeof click_score !== 'number' || click_score <= 0) {
      return res.status(400).json({ error: 'Invalid or missing parameters' });
    }

    // Calling the remote procedure 'increment_score'
    const { data, error } = await supabase
      .rpc('increment_score', { session_id, click_score });

    if (error) {
      console.error('Error updating score:', error);
      if (error.details) {
        return res.status(400).json({ error: 'Invalid parameters', details: error.details });
      }
      return res.status(500).json({ error: 'Failed to update points', details: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected error occurred', details: err.message });
  }
};
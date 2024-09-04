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

    // Validate input
    if (!session_id) {
      return res.status(400).json({ error: 'Invalid or missing session_id' });
    }

    if (typeof click_score !== 'number' || click_score <= 0) {
      return res.status(400).json({ error: 'Invalid click_score' });
    }

    // Attempt to update points
    const { data, error } = await supabase.rpc('increment_score', { session_id, click_score });

    if (error) {
      console.error('Error updating score:', error);
      return res.status(500).json({ error: 'Failed to update points', details: error.message });
    }

    // Fetch the updated score and available clicks
    const { data: currentData, error: fetchError } = await supabase
      .from('users')
      .select('score, available_clicks')
      .eq('session_id', session_id)
      .single();

    if (fetchError) {
      console.error('Error fetching user data:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch user data', details: fetchError.message });
    }

    return res.status(200).json({
      message: 'Points updated successfully',
      currentScore: currentData.score,
      available_clicks: currentData.available_clicks,
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected error occurred', details: err.message });
  }
};
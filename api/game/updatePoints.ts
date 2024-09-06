const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { session_id, click_score } = req.body; // Removed available_clicks from destructuring

    // Validate input
    if (!session_id) {
      return res.status(400).json({ error: 'Invalid or missing session_id' });
    }

    if (typeof click_score !== 'number' || click_score < 0) {
      return res.status(400).json({ error: 'Invalid click_score' });
    }

    // Update the user's score directly without available_clicks
    const { error: updateError } = await supabase
      .from('users')
      .update({ score: click_score })
      .eq('session_id', session_id);

    if (updateError) {
      console.error('Error updating user data:', updateError);
      return res.status(500).json({ error: 'Failed to update user data', details: updateError.message });
    }

    return res.status(200).json({
      message: 'Points updated successfully',
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected error occurred', details: err.message });
  }
};
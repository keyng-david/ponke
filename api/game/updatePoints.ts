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

    // Validate the session_id
    if (!session_id) {
      return res.status(400).json({ error: 'Invalid or missing session_id' });
    }

    // Check if the request is to update points or fetch user data
    if (typeof click_score === 'number' && click_score > 0) {
      // Update points scenario

      // Call the remote procedure 'increment_score'
      const { data, error } = await supabase.rpc('increment_score', { session_id, click_score });

      if (error) {
        console.error('Error updating score:', error);
        if (error.details) {
          return res.status(400).json({ error: 'Invalid parameters', details: error.details });
        }
        return res.status(500).json({ error: 'Failed to update points', details: error.message });
      }

      // Fetch the updated score from the 'users' table after incrementing
      const { data: currentScoreData, error: fetchError } = await supabase
        .from('users')
        .select('score')
        .eq('session_id', session_id)
        .single();

      if (fetchError) {
        console.error('Error fetching current score:', fetchError);
        return res.status(500).json({ error: 'Failed to fetch current score', details: fetchError.message });
      }

      // Return both the update status and the current score
      return res.status(200).json({
        message: 'Points updated successfully',
        currentScore: currentScoreData.score,
      });
    } else {
      // Fetch user data scenario (initial sync)

      // Fetch the user's current score and max available clicks from the 'users' table
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('score, max_available') // Adjust column names as needed
        .eq('session_id', session_id)
        .single();

      if (fetchError) {
        console.error('Error fetching user data:', fetchError);
        return res.status(500).json({ error: 'Failed to fetch user data', details: fetchError.message });
      }

      // Return the user's score and max available clicks
      return res.status(200).json({
        currentScore: userData.score,
        maxAvailable: userData.max_available,
      });
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected error occurred', details: err.message });
  }
};
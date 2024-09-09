const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { session_id, earnedPoint } = req.body;

    // Validate input
    if (!session_id) {
      return res.status(400).json({ error: 'Invalid or missing session_id' });
    }

    if (typeof earnedPoint !== 'number' || earnedPoint < 0) {
      return res.status(400).json({ error: 'Invalid earnedPoint' });
    }

    // Call the Supabase SQL function to update the user's score
    const { error: functionError } = await supabase.rpc('scoreupdate', {
      session_id,
      earnedpoint: earnedPoint,
    });

    if (functionError) {
      console.error('Error executing ScoreUpdate function:', functionError);
      return res.status(500).json({ error: 'Failed to update user score', details: functionError.message });
    }

    // Respond with success if the score update was successful
    res.status(200).json({ success: true, message: 'Points updated successfully' });
    
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected error occurred', details: err.message });
  }
};
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { session_id, earnedPoint } = req.body; // Accept 'earnedPoint' instead of 'click_score'

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

    const subscription = supabase
      .from('users')
      .on('UPDATE', (payload) => {
        if (payload.new && payload.new.session_id === session_id) {
          // Confirm that the update was successful
          res.status(200).json({ success: true, message: 'Points updated and confirmed successfully' });
        }
      })
      .subscribe();

    // Remove the subscription after a reasonable timeout to prevent memory leaks
    setTimeout(() => {
      supabase.removeSubscription(subscription);
    }, 10000); // 10 seconds timeout

  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected error occurred', details: err.message });
  }
};
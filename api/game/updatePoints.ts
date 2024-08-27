import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Environment variables SUPABASE_URL and SUPABASE_KEY must be defined');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const updatePointsHandler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: true, message: 'Method Not Allowed' });
  }

  const { sessionId, points } = req.body;

  if (!sessionId) {
    return res.status(401).json({ error: true, message: 'Unauthorized, session ID is required' });
  }

  try {
    // Retrieve user data based on session ID
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('telegram_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData) {
      return res.status(500).json({ error: true, message: 'Session not found or database error', details: sessionError ? sessionError.message : 'Session not found' });
    }

    const telegramId = sessionData.telegram_id;

    // Query the users table using the telegram_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, score')
      .eq('telegram_id', telegramId)
      .single();

    if (userError || !userData) {
      return res.status(500).json({ error: true, message: 'User not found or database error', details: userError ? userError.message : 'User not found' });
    }

    // Update user score with the new points
    const updatedScore = userData.score + points;

    const { error: updateError } = await supabase
      .from('users')
      .update({ score: updatedScore })
      .eq('id', userData.id);

    if (updateError) {
      return res.status(500).json({ error: true, message: 'Failed to update score', details: updateError.message });
    }

    return res.status(200).json({ success: true, newScore: updatedScore });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: true, message: 'Internal server error' });
  }
};

export default updatePointsHandler;
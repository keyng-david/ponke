import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables not set');
  throw new Error('Environment variables SUPABASE_URL and SUPABASE_KEY must be defined');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const updatePointsHandler = async (req: VercelRequest, res: VercelResponse) => {
  console.log('Incoming request:', req.method, req.url);

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: true, message: 'Method Not Allowed' });
  }

  const { sessionId, points } = req.body;

  if (!sessionId || typeof points !== 'number') {
    console.log('Unauthorized access attempt or invalid input:', { sessionId, points });
    return res.status(400).json({ error: true, message: 'Bad Request: sessionId and valid points are required' });
  }

  console.log('Fetching data for session_id:', sessionId);

  try {
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('id, score')
      .eq('session_id', sessionId)
      .single();

    if (fetchError || !userData) {
      console.error('Database error:', fetchError ? fetchError.message : 'User not found');
      return res.status(500).json({ error: true, message: 'Database error', details: fetchError ? fetchError.message : 'User not found' });
    }

    console.log('User data retrieved:', userData);

    const updatedScore = userData.score + points;

    const { error: updateError } = await supabase
      .from('users')
      .update({ score: updatedScore })
      .eq('id', userData.id);

    if (updateError) {
      console.error('Failed to update score:', updateError.message);
      return res.status(500).json({ error: true, message: 'Failed to update score', details: updateError.message });
    }

    console.log('Score updated successfully to:', updatedScore);
    return res.status(200).json({ success: true, newScore: updatedScore });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: true, message: 'Internal server error' });
  }
};

export default updatePointsHandler;
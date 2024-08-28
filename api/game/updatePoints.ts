import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Environment variables SUPABASE_URL and SUPABASE_KEY must be defined');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const updatePointsHandler = async (req: VercelRequest, res: VercelResponse) => {
  console.log('Incoming request:', req.method, req.url); // Log request method and URL

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method); // Log the method if it's not POST
    return res.status(405).json({ error: true, message: 'Method Not Allowed' });
  }

  const { sessionId, totalPoints } = req.body; // Expecting totalPoints from the request body

  if (!sessionId) {
    console.log('Unauthorized access attempt, missing session ID in body'); // Log unauthorized attempts
    return res.status(401).json({ error: true, message: 'Unauthorized, session ID is required' });
  }

  console.log('Fetching data for session_id:', sessionId); // Log the session ID being used in the query

  try {
    // Query the users table using the session_id
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, score')
      .eq('session_id', sessionId)
      .single();

    if (error || !userData) {
      console.error('Database error:', error ? error.message : 'User not found'); // Log detailed database error or not found message
      return res.status(500).json({ error: true, message: 'Database error', details: error ? error.message : 'User not found' });
    }

    console.log('User data retrieved:', userData); // Log the retrieved user data

    // Update the user's score
    const updatedScore = userData.score + totalPoints; // Add the total points to the current score

    const { error: updateError } = await supabase
      .from('users')
      .update({ score: updatedScore })
      .eq('id', userData.id);

    if (updateError) {
      console.error('Failed to update score:', updateError.message); // Log update error
      return res.status(500).json({ error: true, message: 'Failed to update score', details: updateError.message });
    }

    console.log('Score updated successfully to:', updatedScore); // Log successful update
    return res.status(200).json({ success: true, newScore: updatedScore });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: true, message: 'Internal server error' });
  }
};

export default updatePointsHandler;
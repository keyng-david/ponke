const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const jwtSecret = process.env.JWT_SECRET;

if (!supabaseUrl || !supabaseKey || !jwtSecret) {
  throw new Error('Environment variables SUPABASE_URL, SUPABASE_KEY, and JWT_SECRET must be defined');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async function authHandler(req, res) {
  console.log('Incoming request:', req.method, req.url);  // Log request method and URL

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);  // Log the method if it's not POST
    return res.status(405).json({ error: true, message: 'Method Not Allowed' });
  }

  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    console.log('Unauthorized access attempt, missing or invalid Authorization header');  // Log unauthorized attempts
    return res.status(401).json({ error: true, message: 'Unauthorized' });
  }

  const token = authorization.split(' ')[1];
  let decoded;

  try {
    decoded = jwt.verify(token, jwtSecret);
    console.log('Decoded JWT:', decoded);  // Log the decoded JWT payload
  } catch (err) {
    console.error('JWT Verification error:', err.message);  // Log JWT verification errors
    return res.status(401).json({ error: true, message: 'Invalid token' });
  }

  const telegramId = decoded.id;
  console.log('Fetching data for telegram_id:', telegramId);  // Log the telegram ID being used in the query

  const { data: userData, error } = await supabase
    .from('users')
    .select('score, available_clicks, wallet, level')
    .eq('telegram_id', telegramId)
    .single();

  if (error || !userData) {
    console.error('Database error:', error ? error.message : 'User not found');  // Log detailed database error or not found message
    console.error('Full error details:', error);  // Log full error object if available
    return res.status(500).json({ error: true, message: 'Database error', details: error ? error.message : 'User not found' });
  }

  console.log('User data retrieved:', userData);  // Log the retrieved user data
  return res.status(200).json({ error: false, payload: userData });
};
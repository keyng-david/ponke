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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: true, message: 'Method Not Allowed' });
  }

  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: true, message: 'Unauthorized' });
  }

  const token = authorization.split(' ')[1];
  let decoded;

  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch (err) {
    return res.status(401).json({ error: true, message: 'Invalid token' });
  }

  const userId = decoded.id;

  const { data: userData, error } = await supabase
    .from('users')
    .select('score, available_clicks, wallet, level')
    .eq('user_id', userId)
    .single();  // Use single() to fetch a single record, assuming user_id is unique

  if (error || !userData) {
    return res.status(500).json({ error: true, message: 'Database error', details: error ? error.message : 'User not found' });
  }

  return res.status(200).json({ error: false, payload: userData });
};
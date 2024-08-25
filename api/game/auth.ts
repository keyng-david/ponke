import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const jwtSecret = process.env.JWT_SECRET;

if (!supabaseUrl || !supabaseKey || !jwtSecret) {
  throw new Error('Environment variables SUPABASE_URL, SUPABASE_KEY, and JWT_SECRET must be defined');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function authHandler(req: any, res: any) {
  const { username, password } = req.body;

  const { data: user, error } = await supabase.from('users').select('*').eq('username', username).single();

  if (error || !user || user.password !== password) {
    return res.status(401).json({ error: true, message: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, username: user.username },
    jwtSecret,
    { expiresIn: '1h' }
  );

  return res.status(200).json({ error: false, token });
}
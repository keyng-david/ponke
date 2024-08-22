import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET!;

export const generateToken = async (user_id: string) => {
  const token = jwt.sign(
    {
      user_id,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  return token;
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { user_id: string };
    return decoded.user_id;
  } catch (error) {
    throw new Error('Invalid token');
  }
};
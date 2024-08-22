import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET!;

export const login = async (telegramId: string) => {
  // Check if the user exists in the database
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (error || !data) {
    throw new Error('User not found');
  }

  // Create a JWT token for the user
  const token = jwt.sign(
    {
      user_id: data.id,
      telegram_id: data.telegram_id,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { token };
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};
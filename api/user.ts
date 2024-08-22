import { createClient } from '@supabase/supabase-js';
import { verifyToken } from './auth';


const supabaseUrl = process.env.SUPABASE_URL!;

const supabaseKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);


export const getUserInfo = async (token: string) => {
  const userId = verifyToken(token);

  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, created_at')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error('Failed to retrieve user information');
  }

  return { error: false, payload: data };
};

export const updateUserProfile = async (token: string, userInfo: { username?: string, email?: string }) => {
  const userId = verifyToken(token);

  const { data, error } = await supabase
    .from('users')
    .update(userInfo)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update user profile');
  }

  return { error: false, payload: data };
};
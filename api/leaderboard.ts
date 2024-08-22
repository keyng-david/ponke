import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export const getLeaderboard = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('username, score')
    .order('score', { ascending: false })
    .limit(10);

  if (error) {
    throw new Error('Failed to retrieve leaderboard');
  }

  return { error: false, payload: { leaders: data } };
};
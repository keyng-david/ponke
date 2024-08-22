import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export const handleWebhook = async (event: any) => {
  if (event.type === 'game_update') {
    const { gameId, status } = event.data;

    const { error } = await supabase
      .from('games')
      .update({ status })
      .eq('id', gameId);

    if (error) {
      throw new Error('Failed to update game status via webhook');
    }
  }
  return { error: false, payload: { success: true } };
};
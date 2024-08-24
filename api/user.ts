const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY must be set');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Create or fetch a user based on their Telegram ID.
 * @param {number} telegramId - The user's Telegram ID.
 * @returns {Promise<{ error?: string, data?: any }>} - The user data or an error message.
 */
module.exports.createUserIfNotExists = async function (telegramId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    // If error is something other than user not found
    return { error: fetchError.message };
  }

  if (existingUser) {
    // If the user already exists, return the existing data
    return { data: existingUser };
  }

  // If user doesn't exist, create a new record
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({
      telegram_id: telegramId,
      score: 0, // default value
      level: 0, // default value
      wallet: '', // default value
      available_clicks: 500, // default value as per model/index
    })
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  return { data: newUser };
}
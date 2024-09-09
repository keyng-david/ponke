const { createClient } = require('@supabase/supabase-js');
const clickerModel = require('@/features/clicker/model');


const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to subscribe to updates
const subscribeToUpdates = (session_id) => {
  const subscription = supabase
    .from('users')
    .on('UPDATE', (payload) => {
      if (payload.new && payload.new.session_id === session_id) {
        // Update the $value and $available states
        clickerModel.$value.setState(payload.new.score);
        clickerModel.$available.setState(payload.new.available_clicks);
        console.log('Points updated and confirmed successfully');
      }
    })
    .subscribe();

  // Return a cleanup function to remove the subscription when not needed
  return () => {
    supabase.removeSubscription(subscription);
  };
};

// Export the function using module.exports
module.exports = { subscribeToUpdates };
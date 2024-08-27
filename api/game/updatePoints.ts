const { NextApiRequest, NextApiResponse } = require ('next');
const { createClient } = require ('@supabase/supabase-js');

// Initialize Supabase client with credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Environment variables SUPABASE_URL and SUPABASE_KEY must be defined');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Allow only POST method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { telegram_id, points } = req.body;

    // Validate request body
    if (!telegram_id || typeof points !== 'number') {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    // Update the user's score in the database
    const { data, error } = await supabase
        .from('users')
        .update({ score: points })
        .eq('telegram_id', telegram_id);

    // Handle potential database errors
    if (error) {
        return res.status(500).json({ error: error.message });
    }

    // Return success response
    return res.status(200).json({ success: true, data });
}
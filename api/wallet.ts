import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    const { method } = req;

    switch (method) {
        case 'GET':
            if (req.url.endsWith('/generatePayload')) {
                const payload = uuidv4(); // Unique payload generation
                res.status(200).json({ error: false, payload: { payload } });
            }
            break;

        case 'POST':
            if (req.url.endsWith('/checkProof')) {
                const { proof } = req.body;

                // Add logic to validate the proof here
                const isValid = true; // Simplified for this example

                if (isValid) {
                    res.status(200).json({ error: false, payload: { message: 'Proof valid' } });
                } else {
                    res.status(400).json({ error: true, payload: null });
                }
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
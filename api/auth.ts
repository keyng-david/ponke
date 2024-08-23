import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const jwtSecret = process.env.JWT_SECRET;

export default async function handler(req, res) {
    const { method } = req;

    switch (method) {
        case 'POST':
            const { username, password } = req.body;

            // Validate the user's credentials
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .single();

            if (error || !user || user.password !== password) {
                res.status(401).json({ error: true, message: 'Invalid credentials' });
            } else {
                // Generate JWT token
                const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '1h' });
                res.status(200).json({ error: false, token });
            }
            break;

        case 'GET':
            const { authorization } = req.headers;

            if (!authorization || !authorization.startsWith('Bearer ')) {
                return res.status(401).json({ error: true, message: 'Unauthorized' });
            }

            const token = authorization.split(' ')[1];

            try {
                const decoded = jwt.verify(token, jwtSecret);
                res.status(200).json({ error: false, user: decoded });
            } catch (err) {
                res.status(401).json({ error: true, message: 'Invalid token' });
            }
            break;

        default:
            res.setHeader('Allow', ['POST', 'GET']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
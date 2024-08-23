import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken'; // Importing jsonwebtoken

const supabaseUrl: string = process.env.SUPABASE_URL || ''; // Ensure type is string
const supabaseKey: string = process.env.SUPABASE_KEY || ''; // Ensure type is string
const supabase = createClient(supabaseUrl, supabaseKey);
const jwtSecret: string = process.env.JWT_SECRET || ''; // Ensure type is string

export default async function handler(req: any, res: any) { // Explicitly type req and res as 'any'
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
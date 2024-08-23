import { createClient } from '@supabase/supabase-js';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Ensure these environment variables are defined
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const jwtSecret = process.env.JWT_SECRET;

if (!supabaseUrl || !supabaseKey || !jwtSecret) {
    throw new Error('Environment variables SUPABASE_URL, SUPABASE_KEY, and JWT_SECRET must be defined');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
    const { method } = req;

    // Validate JWT token
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: true, message: 'Unauthorized' });
    }

    const token = authorization.split(' ')[1];
    let decoded: string | JwtPayload;

    try {
        // Use non-null assertion to assure TypeScript that jwtSecret is defined
        decoded = jwt.verify(token, jwtSecret!) as JwtPayload;
    } catch (err) {
        return res.status(401).json({ error: true, message: 'Invalid token' });
    }

    // Type guard to ensure `decoded` is of type `JwtPayload` and has an `id`
    let userId: string | undefined;

    if (typeof decoded !== 'string' && 'id' in decoded) {
        userId = decoded.id as string;
    } else {
        return res.status(401).json({ error: true, message: 'Invalid token payload' });
    }

    switch (method) {
        case 'GET':
            if (req.url.endsWith('/tasks')) {
                const { data: tasks, error } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('user_id', userId);

                if (error) {
                    res.status(500).json({ error: true, payload: null });
                } else {
                    res.status(200).json({ error: false, payload: { tasks } });
                }
            } else if (req.url.endsWith('/friends')) {
                const { data: friendsData, error } = await supabase
                    .from('friends')
                    .select('*')
                    .eq('user_id', userId);

                if (error) {
                    res.status(500).json({ error: true, payload: null });
                } else {
                    res.status(200).json({ error: false, payload: friendsData });
                }
            } else if (req.url.endsWith('/leaders')) {
                const { data: leaders, error } = await supabase
                    .from('leaders')
                    .select('*')
                    .order('score', { ascending: false })
                    .limit(10);

                if (error) {
                    res.status(500).json({ error: true, payload: null });
                } else {
                    res.status(200).json({ error: false, payload: { leaders } });
                }
            }
            break;

        case 'POST':
            if (req.url.endsWith('/completeTask')) {
                const { id } = req.body;

                const { data: task, error } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('id', id)
                    .eq('user_id', userId)
                    .single();

                if (error || !task) {
                    res.status(500).json({ error: true, payload: null });
                } else {
                    // Implement task completion logic here
                    res.status(200).json({ error: false, payload: { message: 'Task completed' } });
                }
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
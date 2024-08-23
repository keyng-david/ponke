import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const jwtSecret = process.env.JWT_SECRET;

export default async function handler(req, res) {
    const { method } = req;

    // Validate JWT token
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: true, message: 'Unauthorized' });
    }

    const token = authorization.split(' ')[1];
    let decoded;

    try {
        decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
        return res.status(401).json({ error: true, message: 'Invalid token' });
    }

    const userId = decoded.id;

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
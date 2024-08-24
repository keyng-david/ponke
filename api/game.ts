import { createClient } from '@supabase/supabase-js';
import jwt, { JwtPayload } from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const jwtSecret = process.env.JWT_SECRET;

if (!supabaseUrl || !supabaseKey || !jwtSecret) {
  throw new Error('Environment variables SUPABASE_URL, SUPABASE_KEY, and JWT_SECRET must be defined');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  const { method, url } = req;

  // Validate JWT token
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: true, message: 'Unauthorized' });
  }

  const token = authorization.split(' ')[1];
  let decoded: string | JwtPayload;

  try {
    decoded = jwt.verify(token, jwtSecret!) as JwtPayload;
  } catch (err) {
    return res.status(401).json({ error: true, message: 'Invalid token' });
  }

  let userId: string | undefined;

  if (typeof decoded !== 'string' && 'id' in decoded) {
    userId = decoded.id as string;
  } else {
    return res.status(401).json({ error: true, message: 'Invalid token payload' });
  }

  try {
    switch (method) {
      case 'GET':
        if (url.endsWith('/tasks')) {
          const { data: tasks, error } = await supabase.from('tasks').select('*').eq('user_id', userId);
          if (error) {
            return res.status(500).json({ error: true, message: 'Database error', details: error.message });
          }
          return res.status(200).json({ error: false, payload: { tasks } });
        } else if (url.endsWith('/friends')) {
          const { data: friendsData, error } = await supabase.from('friends').select('*').eq('user_id', userId);
          if (error) {
            return res.status(500).json({ error: true, message: 'Database error', details: error.message });
          }
          return res.status(200).json({ error: false, payload: friendsData });
        } else if (url.endsWith('/leaders')) {
          const { data: leaders, error } = await supabase
            .from('leaders')
            .select('*')
            .order('score', { ascending: false })
            .limit(10);
          if (error) {
            return res.status(500).json({ error: true, message: 'Database error', details: error.message });
          }
          return res.status(200).json({ error: false, payload: { leaders } });
        }
        break;

      case 'POST':
        if (url.endsWith('/auth')) {
          const { username, password } = req.body;
          const { data: user, error } = await supabase.from('users').select('*').eq('username', username).single();

          if (error || !user || user.password !== password) {
            return res.status(401).json({ error: true, message: 'Invalid credentials' });
          }

          // Generate JWT token
          const token = jwt.sign(
            { id: user.id, username: user.username },
            jwtSecret!,
            { expiresIn: '1h' }
          );
          return res.status(200).json({ error: false, token });
        } else if (url.endsWith('/completeTask')) {
          const { id } = req.body;
          const { data: task, error } = await supabase.from('tasks').select('*').eq('id', id).eq('user_id', userId).single();

          if (error || !task) {
            return res.status(500).json({ error: true, message: 'Task not found', details: error.message });
          }
          
          // Task completion logic
          // Assuming there's a `completed` field in the task and we set it to true
          const { data: updatedTask, error: updateError } = await supabase
            .from('tasks')
            .update({ completed: true })
            .eq('id', id)
            .eq('user_id', userId);

          if (updateError) {
            return res.status(500).json({ error: true, message: 'Failed to complete task', details: updateError.message });
          }

          return res.status(200).json({ error: false, payload: { message: 'Task completed' } });
        }
        break;

      default:
        return res.status(405).json({ error: true, message: 'Method not allowed' });
    }
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Server error', details: error.message });
  }
}
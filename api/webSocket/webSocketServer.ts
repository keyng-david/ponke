import { createClient } from '@supabase/supabase-js';
import { Server } from 'socket.io';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const io = new Server(8080); // Create a new Socket.IO server on port 8080

io.on('connection', (socket) => {
    console.log('Client connected');

    // Realtime subscription
    const channel = supabase.channel('public:users');

    channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
            console.log('Change received:', payload);
            // Forward this change to all connected clients
            socket.emit('user_update', { type: 'user_update', data: payload });
        }
    );

    channel.subscribe();

    socket.on('message', async (message: string) => {
        try {
            const { session_id } = JSON.parse(message);
            if (session_id) {
                // Validate the session_id with the database
                const { data: user, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('session_id', session_id)
                    .single();

                if (error || !user) {
                    socket.emit('error', { error: 'Invalid session_id' });
                } else {
                    socket.emit('success', { success: true });
                }
            }
        } catch (err) {
            console.error('Error processing message:', err);
            socket.emit('error', { error: 'Server error' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        channel.unsubscribe();
    });
});
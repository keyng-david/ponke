const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const WebSocket = require('ws');
const http = require('http'); // Required to create an HTTP server

const port = process.env.PORT || 8080;

// Create HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket server is running\n'); // HTTP route for Heroku's checks
});

const wss = new WebSocket.Server({ server }); // Use the HTTP server for WebSocket

wss.on('connection', (socket) => {
    console.log('Client connected');

    // Realtime subscription
    const channel = supabase
        .channel('public:users')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
            console.log('Change received:', payload);
            // Forward this change to all connected clients
            socket.send(JSON.stringify({ type: 'user_update', data: payload }));
        })
        .subscribe();

    socket.on('message', async (message) => {
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
                    socket.send(JSON.stringify({ error: 'Invalid session_id' }));
                } else {
                    socket.send(JSON.stringify({ success: true }));
                }
            }
        } catch (err) {
            console.error('Error processing message:', err);
            socket.send(JSON.stringify({ error: 'Server error' }));
        }
    });

    socket.on('close', () => {
        console.log('Client disconnected');
        supabase.removeChannel(channel); // Cleanup on disconnect
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
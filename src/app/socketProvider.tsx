import { clickerModel } from "@/features/clicker/model";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useStore } from "effector-react";
import { $sessionId } from "@/shared/model/session";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export const SocketContext = createContext<{
    accumulatePoints: (points: number) => void;
    debounceSendPoints: () => void;
}>({
    accumulatePoints: () => {},
    debounceSendPoints: () => {}
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = React.memo<React.PropsWithChildren>(({ children }) => {
    const sessionId = useStore($sessionId);
    const [earnedPoint, setEarnedPoint] = useState(0);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

    // Function to accumulate points locally
    const accumulatePoints = (points: number) => {
        setEarnedPoint(prev => prev + points);
    };

    // Function to send points to the backend
    const sendPointUpdate = async () => {
        if (earnedPoint > 0) {
            try {
                const response = await fetch('/api/game/updatePoint', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        session_id: sessionId,
                        earnPoint: earnedPoint
                    })
                });

                const result = await response.json();
                if (result.success) {
                    // Clear earned points only if update was successful
                    setEarnedPoint(0);
                }
            } catch (error) {
                console.error("Error updating points:", error);
                // Retry logic can be implemented here
            }
        }
    };

    // Debounce mechanism to trigger batch updates
    const debounceSendPoints = () => {
        if (debounceTimeout) clearTimeout(debounceTimeout);
        const newTimeout = setTimeout(() => {
            sendPointUpdate();
        }, 3000); // 3 seconds debounce
        setDebounceTimeout(newTimeout);
    };

    // Supabase real-time listener for user points update
    useEffect(() => {
        const channel = supabase
            .channel('public:users')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'users',
                    filter: `id=eq.${sessionId}`, // Filter based on user session_id
                    columns: ['score', 'available_clicks'], // Listen to updates on score and available_clicks
                },
                (payload) => {
                    // Handle the real-time update data here
                    const { new: updatedData } = payload;
                    clickerModel.clicked({
                        score: updatedData.score,
                        available_clicks: updatedData.available_clicks,
                        click_score: CLICK_STEP,
                    });
                    // Clear earnedPoint state to prevent resending data
                    setEarnedPoint(0);
                }
            )
            .subscribe();

        // Cleanup on component unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    return (
        <SocketContext.Provider value={{ accumulatePoints, debounceSendPoints }}>
            {children}
        </SocketContext.Provider>
    );
});
import { clickerModel } from "@/features/clicker/model";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useStore } from "effector-react";
import { $sessionId } from "@/shared/model/session";
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
        const subscription = supabase
            .from('users') // Listen to the 'users' table
            .on('UPDATE', (payload) => {  // Listen for UPDATE events
                if (payload.new && payload.new.session_id === sessionId) { // Check if it matches the sessionId
                    const updatedData = payload.new;
                    clickerModel.clicked({
                        score: updatedData.score,
                        available_clicks: updatedData.available_clicks,
                        click_score: CLICK_STEP,
                    });
                    // Clear earnedPoint state to prevent resending data
                    setEarnedPoint(0);
                }
            })
            .subscribe();

        // Cleanup on component unmount
        return () => {
            supabase.removeSubscription(subscription);
        };
    }, [sessionId]);

    return (
        <SocketContext.Provider value={{ accumulatePoints, debounceSendPoints }}>
            {children}
        </SocketContext.Provider>
    );
});
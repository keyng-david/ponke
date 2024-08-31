import { useState, useEffect } from 'react';
import { createEvent, createStore, sample } from "effector";
import { useUnit } from "effector-react";
import { useSocket } from "@/app/socketProvider";

export const MAX_AVAILABLE = 500;
export const CLICK_STEP = 1;

const valueInited = createEvent<number>();
const availableInited = createEvent<number>();
const clicked = createEvent<{
    score: number,
    click_score: number,
    available_clicks: number,
}>();
const availableUpdated = createEvent<number>();
const errorUpdated = createEvent<boolean>();

const $isMultiAccount = createStore(false);
const $value = createStore(0);
const $available = createStore(MAX_AVAILABLE);

const $canBeClicked = $available.map(state => state >= CLICK_STEP);

sample({
    clock: availableUpdated,
    target: $available,
});

sample({
    clock: clicked,
    fn: ({ score }) => score,
    target: $value,
});

sample({
    clock: clicked,
    fn: ({ available_clicks }) => available_clicks,
    target: $available,
});

sample({
    clock: valueInited,
    target: $value,
});

sample({
    clock: availableInited,
    target: $available,
});

sample({
    clock: errorUpdated,
    target: $isMultiAccount,
});

const useCanBeClicked = () => useUnit($canBeClicked);

const useClicker = () => {
    const [clickBuffer, setClickBuffer] = useState(0);

    // Extract session ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");

    async function sendPointsUpdate(score: number) {
        if (!sessionId) {
            console.error('No session ID available');
            return;
        }

        console.log('Sending request:', { session_id: sessionId, click_score: score });
        try {
            const response = await fetch('/api/game/updatePoints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, click_score: score }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Failed to update points:', data.error || 'Unknown error');
                return; // Early return on error
            }

            console.log('Points updated:', data);
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error updating points:', error.message);
            } else {
                console.error('Error updating points:', error);
            }
        }
    }

    function onClick() {
        setClickBuffer((prev) => {
            const newBuffer = prev + CLICK_STEP;
            if (newBuffer >= 10) {
                sendPointsUpdate(newBuffer); // Send a batch update every 10 clicks
                return 0;
            }
            return newBuffer;
        });
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (clickBuffer > 0) {
                sendPointsUpdate(clickBuffer);
                setClickBuffer(0);
            }
        }, 1000); // Send updates every second if clicks are buffered

        return () => clearInterval(interval);
    }, [clickBuffer]);

    return {
        value: useUnit($value),
        available: useUnit($available),
        canBeClicked: useUnit($canBeClicked),
        isMultiError: useUnit($isMultiAccount),
        onClick,
    };
};

export const clickerModel = {
    valueInited,
    availableInited,
    availableUpdated,
    clicked,
    errorUpdated,
    useCanBeClicked,
    useClicker,
};
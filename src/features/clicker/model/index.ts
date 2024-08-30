import axios from 'axios';
import { createEvent, createStore, sample } from "effector";
import { useUnit } from "effector-react";
import { useSocket } from "@/app/socketProvider";
import { useAuth } from "@/features/auth/useAuth";
import { useSessionId } from "@/shared/model/session";
import { useEffect } from 'react'; // Make sure to import useEffect for the initializer hook

export const MAX_AVAILABLE = 500;
export const CLICK_STEP = 1;

const DEBOUNCE_TIME = 1000; // Debounce time for batching clicks (milliseconds)

const valueInited = createEvent<number>();
const availableInited = createEvent<number>();
const clicked = createEvent<{
    score: number,
    click_score: number,
    available_clicks: number,
}>();

const batchClicks = createEvent<number>();  
const availableUpdated = createEvent<number>();
const errorUpdated = createEvent<boolean>();

const $isMultiAccount = createStore(false);
const $value = createStore(0);
const $available = createStore(MAX_AVAILABLE);
const $clickCount = createStore(0);  

const $canBeClicked = $available.map(state => state >= CLICK_STEP);

let localClicks = 0;

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
    clock: batchClicks,
    target: $clickCount,
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

type UseClickerReturnType = {
    value: number;
    available: number;
    canBeClicked: boolean;
    isMultiError: boolean;
    onClick: () => void;
};

const useClicker = (): UseClickerReturnType => {
    const { sendMessage } = useSocket();
    const { initialize } = useAuth();
    const { sessionId } = useSessionId();

    const value = useUnit($value);
    const available = useUnit($available);
    const canBeClicked = useUnit($canBeClicked);
    const isMultiError = useUnit($isMultiAccount);

    const sendBatchedClicks = async () => {
        if (localClicks > 0 && sessionId) {
            try {
                const response = await axios.post('/api/game/updatePoints', {
                    sessionId,
                    points: localClicks,
                });

                if (response.data.success) {
                    console.log('Points updated successfully');
                    localClicks = 0;
                } else {
                    console.error('Failed to update points:', response.data.message);
                }
            } catch (error) {
                console.error('Failed to update points:', error);
            }
        }
    };

    const debouncedSend = debounce(sendBatchedClicks, DEBOUNCE_TIME);

    const onClick = () => {
        sendMessage('click');
        localClicks += CLICK_STEP; 
        valueInited(value + CLICK_STEP); // Update UI immediately
        availableInited(available - CLICK_STEP);

        debouncedSend(); 
    };

    return {
        value,
        available,
        canBeClicked,
        isMultiError,
        onClick,
    };
};

function debounce(func: () => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(func, wait);
    };
}

const initializeClicker = (initialValue: number, initialAvailable: number) => {
    valueInited(initialValue);
    availableInited(initialAvailable);
};

const updateAvailableClicks = (clicks: number) => {
    availableUpdated(clicks);
};

// The hook to initialize the clicker and set up socket event listeners
const useClickerInitializer = () => {
    const { sessionId } = useSessionId();
    const { initialize } = useAuth();
    const { sendMessage } = useSocket();

    useEffect(() => {
        initialize();

        // Example to handle incoming socket messages
        sendMessage('initialize-clicker', { sessionId });

        // Socket event listener for server updates
        const handleServerUpdate = (data: { score: number; available_clicks: number; click_score: number }) => {
            clicked(data);
        };

        // Example of socket event listening
        // Replace with your socket listening setup
        // socket.on('clicker-update', handleServerUpdate);

        // Cleanup on unmount
        return () => {
            // socket.off('clicker-update', handleServerUpdate);
        };
    }, [initialize, sendMessage, sessionId]);
};

// Correct the exports to ensure all necessary functions are available
export const clickerModel = {
    useClicker,
    initializeClicker,
    updateAvailableClicks,
    useClickerInitializer,
    useCanBeClicked,
    clicked,
};
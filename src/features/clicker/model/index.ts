import axios from 'axios';
import { createEvent, createStore, sample } from "effector";
import { useUnit } from "effector-react";
import { useSocket } from "@/app/socketProvider";
import { useAuth } from "@/features/auth/useAuth";
import { useSessionId } from "@/shared/model/session";

export const MAX_AVAILABLE = 500;
export const CLICK_STEP = 1;

// Debounce time for batching clicks (milliseconds)
const DEBOUNCE_TIME = 1000;

const valueInited = createEvent<number>();
const availableInited = createEvent<number>();

const clicked = createEvent<{
    score: number,
    click_score: number,
    available_clicks: number,
}>();

const batchClicks = createEvent<number>();  // New event for batching clicks
const availableUpdated = createEvent<number>();
const errorUpdated = createEvent<boolean>();

const $isMultiAccount = createStore(false);
const $value = createStore(0);
const $available = createStore(MAX_AVAILABLE);
const $clickCount = createStore(0);  // Store to keep track of batched clicks

const $canBeClicked = $available.map(state => state >= CLICK_STEP);

// Store to keep track of local clicks before batch sending
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
    const clickCount = useUnit($clickCount);

    // Function to send batched clicks to the server
    const sendBatchedClicks = async () => {
        if (localClicks > 0 && sessionId) {
            try {
                const response = await axios.post('/api/game/updatePoints', {
                    sessionId,
                    points: localClicks,
                });

                if (response.data.success) {
                    console.log('Points updated successfully');
                    // Reset local clicks after successful update
                    localClicks = 0;
                } else {
                    console.error('Failed to update points:', response.data.message);
                }
            } catch (error) {
                console.error('Failed to update points:', error);
            }
        }
    };

    // Debounced function to send clicks
    const debouncedSend = debounce(sendBatchedClicks, DEBOUNCE_TIME);

    const onClick = () => {
        if (canBeClicked) {
            sendMessage('click');
            localClicks += CLICK_STEP; // Increment local clicks
            batchClicks(clickCount + 1); // Increment the batched click count

            // Update local score and available immediately for a responsive UI
            valueInited(value + CLICK_STEP); 
            availableInited(available - CLICK_STEP);

            debouncedSend(); // Trigger the debounced function to send clicks
        }
    };

    return {
        value,
        available,
        canBeClicked,
        isMultiError,
        onClick,
    };
};

// Utility function for debouncing
function debounce(func: () => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(func, wait);
    };
}

export const clickerModel = {
    $value,
    $available,
    $clickCount,
    $canBeClicked,
    $isMultiAccount,
    valueInited,
    availableInited,
    availableUpdated,
    clicked,
    batchClicks,
    errorUpdated,
    useCanBeClicked,
    useClicker,
};
import axios from 'axios';
import { createEvent, createStore, sample } from "effector";
import { useUnit } from "effector-react";
import { useSocket } from "@/app/socketProvider";
import { useAuth } from "@/features/auth/useAuth";
import { useSessionId } from "@/shared/model/session"; // Import the session management

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

type UseClickerReturnType = {
    value: number;
    available: number;
    canBeClicked: boolean;
    isMultiError: boolean;
    onClick: () => Promise<void>;
};

const useClicker = (): UseClickerReturnType => {
    const { sendMessage } = useSocket();
    const { initialize } = useAuth(); // Get the initialize function from useAuth
    const sessionIdStore = useSessionId(); // Use the session management to get the session ID

    const value = useUnit($value);
    const available = useUnit($available);
    const canBeClicked = useUnit($canBeClicked);
    const isMultiError = useUnit($isMultiAccount);

    const onClick = async () => {
        sendMessage('click');

        // Ensure session ID is initialized before making API calls
        const sessionId = sessionIdStore.get();

        if (!sessionId) {
            console.error('Session ID not available');
            await initialize(); // Attempt to initialize the session if not already done
            return;
        }

        try {
            const response = await axios.post('/api/game/updatePoints', {
                sessionId,  // Send session ID instead of telegram ID
                points: value,
            });

            if (response.data.success) {
                console.log('Points updated successfully');
            } else {
                console.error('Failed to update points:', response.data.message);
            }
        } catch (error) {
            console.error('Failed to update points:', error);
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

export const clickerModel = {
    $value,
    $available,
    $canBeClicked,
    $isMultiAccount,
    valueInited,
    availableInited,
    availableUpdated,
    clicked,
    errorUpdated,
    useCanBeClicked,
    useClicker,
};
import { createEvent, createStore, sample } from "effector";
import { throttle } from "lodash";
import { useSocket } from "@/app/socketProvider";
import { useUnit } from "effector-react";

export const MAX_AVAILABLE = 500;
export const CLICK_STEP = 1;

const valueInited = createEvent<number>();
const availableInited = createEvent<number>();

// Define clicked event that stores score and other relevant values
const clicked = createEvent<{
    score: number,
    click_score: number,
    available_clicks: number,
}>();
const availableUpdated = createEvent<number>();
const errorUpdated = createEvent<boolean>();

// Event for updating points
const sendPointsUpdate = createEvent<number>();

const $isMultiAccount = createStore(false);
const $value = createStore(0);
const $available = createStore(MAX_AVAILABLE);
const $canBeClicked = $available.map(state => state >= CLICK_STEP);

// Throttle logic to ensure the score is sent at intervals
const throttledSendPointsUpdate = throttle(async (score: number) => {
    try {
        await fetch("/api/game/updatePoints", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionStorage.getItem("sessionId"), click_score: score }),
        });
    } catch (error) {
        console.error("Error updating points:", error);
    }
}, 2000);

// Trigger the throttled function when the score is updated
sendPointsUpdate.watch(throttledSendPointsUpdate);

// Sample the clicked event to update score
sample({
    clock: clicked,
    fn: ({ score }) => score,
    target: $value,
});

// Sample the available clicks and update the store
sample({
    clock: clicked,
    fn: ({ available_clicks }) => available_clicks,
    target: $available,
});

// Initialize stores
sample({
    clock: valueInited,
    target: $value,
});

sample({
    clock: availableInited,
    target: $available,
});

// Handle errors if any
sample({
    clock: errorUpdated,
    target: $isMultiAccount,
});

// Export hooks for use in components
const useCanBeClicked = () => useUnit($canBeClicked);

const useClicker = () => {
    const onClick = () => {
        sendMessage("click");
    };

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
    sendPointsUpdate,
    errorUpdated,
    useCanBeClicked,
    useClicker,
};

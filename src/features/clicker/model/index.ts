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

const $earnedPoint = createStore(0); // New store for accumulated points

const $canBeClicked = $available.map(state => state >= CLICK_STEP);

sample({
    clock: availableUpdated,
    target: $available
});

sample({
    clock: clicked,
    fn: ({ score }) => score,
    target: $value,
});

sample({
    clock: clicked,
    fn: ({ available_clicks }) => available_clicks,
    target: $available
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
    target: $isMultiAccount
});

const useCanBeClicked = () => useUnit($canBeClicked);

const useClicker = () => {
    const { accumulatePoints, debounceSendPoints } = useSocket();

    function onClick() {
        // Accumulate points locally instead of sending a message
        accumulatePoints(CLICK_STEP);
        debounceSendPoints();  // Debounced sending of accumulated points
    }

    return {
        value: useUnit($value),
        available: useUnit($available),
        canBeClicked: useUnit($canBeClicked),
        isMultiError: useUnit($isMultiAccount),

        onClick,
    };
}

export const clickerModel = {
    valueInited,
    availableInited,

    availableUpdated,
    clicked,
    errorUpdated,

    useCanBeClicked,
    useClicker,
    $value,
    $available,
    $earnedPoint,  // Expose new store
};
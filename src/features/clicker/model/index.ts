import { createEvent, createStore, sample } from "effector";
import {useUnit} from "effector-react";
import { useSocket } from "@/app/socketProvider";
import {useAuth} from "@/features/auth";
import axios from 'axios';

export const MAX_AVAILABLE = 500
export const CLICK_STEP = 1

const valueInited = createEvent<number>()
const availableInited = createEvent<number>()

const clicked = createEvent<{
    score: number,
    click_score: number,
    available_clicks: number,
}>()
const availableUpdated = createEvent<number>()
const errorUpdated = createEvent<boolean>()

const $isMultiAccount = createStore(false)
const $value = createStore(0)
const $available = createStore(MAX_AVAILABLE)

const $canBeClicked = $available.map(state => state >= CLICK_STEP)

sample({
    clock: availableUpdated,
    target: $available
})

sample({
    clock: clicked,
    fn: ({ score }) => score,
    target: $value,
})

sample({
    clock: clicked,
    fn: ({ available_clicks }) => available_clicks,
    target: $available
})

sample({
    clock: valueInited,
    target: $value,
})

sample({
    clock: availableInited,
    target: $available,
})

sample({
    clock: errorUpdated,
    target: $isMultiAccount
})

const useCanBeClicked = () => useUnit($canBeClicked)

const useClicker = () => {
    const { sendMessage } = useSocket()
    const { telegram_id } = useAuth(); // Assuming useAuth provides the authenticated user's data

    function onClick() {
        sendMessage('click')

        axios.post('/api/game/updatePoints', {
            telegram_id,  // Dynamically retrieve the telegram_id
            points: $value.getState(), // Use the correct state management logic
        }).then(response => {
            if (response.data.success) {
                console.log('Points updated successfully');
            }
        }).catch(error => {
            console.error('Failed to update points:', error);
        });
    }

    return {
        value: useUnit($value),
        available: useUnit($available),
        canBeClicked: useUnit($canBeClicked),
        isMultiError: useUnit($isMultiAccount),

        onClick,
    }
}

export const clickerModel = {
    valueInited,
    availableInited,

    availableUpdated,
    clicked,
    errorUpdated,

    useCanBeClicked,
    useClicker,
}
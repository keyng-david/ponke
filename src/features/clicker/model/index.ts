import { createEvent, createStore, sample } from "effector";
import {useUnit} from "effector-react";
import {useSocket} from "@/shared/lib/hooks/useSocket";
import {useEffect} from "react";
import {socketResponseToJSON} from "@/shared/lib/utils/socketResponseToJSON";

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

const useCanBeClicked = () => useUnit($canBeClicked)

const useClicker = () => {
    const { sendMessage, lastMessage } = useSocket()

    function onClick() {
        sendMessage('click')
    }

    useEffect(() => {
        console.log(lastMessage?.data)

        if (lastMessage && typeof lastMessage.data === 'string' && lastMessage?.data.includes('click_response')) {
            const data = socketResponseToJSON<{
                score: number,
                click_score: number,
                available_clicks: number
            }>(lastMessage.data)

            console.log(data)

            clicked(data)
        }
        if (lastMessage && typeof lastMessage.data === 'string' && lastMessage?.data.includes('availableClicks')) {
            const data = socketResponseToJSON<{
                available_clicks: number,
            }>(lastMessage.data)

            console.log(data)

            availableUpdated(data.available_clicks)
        }
    }, [lastMessage]);

    return {
        value: useUnit($value),
        available: useUnit($available),
        canBeClicked: useUnit($canBeClicked),

        onClick,
    }
}

export const clickerModel = {
    valueInited,
    availableInited,
    useCanBeClicked,
    useClicker,
}
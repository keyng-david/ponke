import { createRequest } from "@/shared/lib/api/createRequest";
import { attach, createEffect, createEvent, createStore, sample } from "effector";
import {useUnit} from "effector-react";
import {Simulate} from "react-dom/test-utils";
import click = Simulate.click;
import {useSocket} from "@/shared/lib/hooks/useSocket";
import {useEffect} from "react";
import {type} from "@testing-library/user-event/dist/type";

export const MAX_AVAILABLE = 500
export const CLICK_STEP = 1

let DELAY_TIMEOUT: NodeJS.Timeout

async function delay() {
    return new Promise(resolve => {
        clearTimeout(DELAY_TIMEOUT)
        DELAY_TIMEOUT = setTimeout(() => {
            resolve(null)
            clearTimeout(DELAY_TIMEOUT)
        }, 2000)
    })
}

// const updateValueFx = createEffect(async () => {
//     return await createRequest<{
//         score: number,
//         click_score: number
//     }>({
//         url: 'game/click',
//         method: 'POST',
//     })
// })

const $clickValue = createStore(1)
const updateAvailableFx = createEffect(async (v: number) => {
    await delay()

    return v
})
const attachUpdateAvailableFx = attach({
    source: $clickValue,
    effect: updateAvailableFx,
})

const valueInited = createEvent<number>()

const clicked = createEvent<{
    score: number,
    click_score: number
}>()
const availableUpdated = createEvent<number>()

const $value = createStore(0)
const $available = createStore(MAX_AVAILABLE)

const $canBeClicked = $available.map(state => state >= CLICK_STEP)
const $isNotMax = $available.map(state => state < MAX_AVAILABLE)

sample({
    clock: attachUpdateAvailableFx.doneData,
    filter: $isNotMax,
    target: [availableUpdated, attachUpdateAvailableFx]
})

sample({
    source: $available,
    clock: availableUpdated,
    fn: (v, u) => v + u,
    target: $available
})

sample({
    clock: clicked,
    fn: ({ score }) => score,
    target: $value,
})

sample({
    source: $available,
    clock: clicked,
    fn: (available, { click_score }) => available - click_score,
    target: $available
})

sample({
    clock: valueInited,
    target: $value,
})

attachUpdateAvailableFx().then()

const useCanBeClicked = () => useUnit($canBeClicked)

const useClicker = () => {
    const { sendMessage, lastMessage } = useSocket()

    function onClick() {
        sendMessage('click')
    }

    useEffect(() => {
        if (lastMessage && typeof lastMessage.data === 'string' && lastMessage?.data.includes('click_response')) {
            const splitIndex = (lastMessage.data as string).indexOf(':')
            const stringify = lastMessage.data.slice(splitIndex + 1, lastMessage.data.length - 1)
            const data = JSON.parse(stringify)
            clicked(data)
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
    useCanBeClicked,
    useClicker,
}
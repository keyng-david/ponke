import { createRequest } from "@/shared/lib/api/createRequest";
import { attach, createEffect, createEvent, createStore, sample } from "effector";
import {useUnit} from "effector-react";

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

const updateValueFx = createEffect(async () => {
    return await createRequest<{
        score: number,
        click_score: number
    }>({
        url: 'game/click',
        method: 'POST',
    })
})

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

const clicked = createEvent()
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
    target: updateValueFx,
})

sample({
    clock: updateValueFx.doneData,
    fn: ({ payload }) => payload!.score,
    target: $value
})

sample({
    source: $available,
    clock: updateValueFx.doneData,
    fn: (available, { payload }) =>available - payload!.click_score,
    target: $available
})

sample({
    clock: updateValueFx.doneData,
    fn: ({ payload }) => payload!.click_score,
    target: $clickValue
})

sample({
    clock: valueInited,
    target: $value,
})

attachUpdateAvailableFx().then()

const useCanBeClicked = () => useUnit($canBeClicked)
const useClickerState = () => ({
    value: useUnit($value),
    available: useUnit($available),
    canBeClicked: useUnit($canBeClicked)
})

export const clickerModel = {
    clicked,
    valueInited,
    useCanBeClicked,
    useClickerState,
}
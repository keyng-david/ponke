import { createEffect, createEvent, createStore, sample } from "effector";
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

const updateAvailableFx = createEffect(async () => {
    await delay()

    return 1
})

const clicked = createEvent()
const availableUpdated = createEvent<number>()

const $value = createStore(1000)
const $available = createStore(MAX_AVAILABLE)

const $canBeClicked = $available.map(state => state >= CLICK_STEP)
const $isNotMax = $available.map(state => state < MAX_AVAILABLE)

sample({
    clock: updateAvailableFx.doneData,
    filter: $isNotMax,
    target: [availableUpdated, updateAvailableFx]
})

sample({
    source: $available,
    clock: availableUpdated,
    fn: (v, u) => v + u,
    target: $available
})

sample({
    source: $value,
    clock: clicked,
    fn: v => v + CLICK_STEP,
    target: $value
})

sample({
    source: $available,
    clock: clicked,
    fn: v => v - CLICK_STEP,
    target: $available
})

updateAvailableFx().then()

const useCanBeClicked = () => useUnit($canBeClicked)
const useClickerState = () => ({
    value: useUnit($value),
    available: useUnit($available),
    canBeClicked: useUnit($canBeClicked)
})

export const clickerModel = {
    clicked,
    useCanBeClicked,
    useClickerState,
}
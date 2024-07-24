import { createEffect, createEvent, createStore, sample } from "effector";
import {useUnit} from "effector-react";

async function delay() {
    return new Promise(resolve => {
        const timeout = setTimeout(() => {
            resolve(null)
            clearTimeout(timeout)
        }, 2000)
    })
}

const updateAvailableFx = createEffect(async () => {
    await delay()

    return 10
})

const clicked = createEvent()
const availableUpdated = createEvent<number>()

const $value = createStore(1000)
const $available = createStore(5000)

const $canBeClicked = $available.map(state => state >= 10)
const $isNotMax = $available.map(state => state < 5000)

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
    fn: v => v + 10,
    target: $value
})

sample({
    source: $available,
    clock: clicked,
    fn: v => v - 10,
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
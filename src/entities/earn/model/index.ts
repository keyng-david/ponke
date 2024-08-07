import { createFetch } from '@/shared/lib/effector/createGateHook'
import { EarnData, EarnItem } from './types'
import { EarnApi, earnApi } from '@/shared/api/earn'
import { createEvent, createStore, sample } from 'effector'

const [ FetchGate, fetchFx, useFetchGate ] = createFetch<EarnApi['getData']>(earnApi.getData)

const taskSelected = createEvent<EarnItem>()
const taskClosed = createEvent()

const $activeTask = createStore<EarnItem | null>(null)
const $data = createStore<EarnData>({
    collabs: 0,
    list: [],
})

sample({
    clock: FetchGate.open,
    target: fetchFx,
})

sample({
    clock: fetchFx.doneData,
    target: $data,
})

sample({
    clock: taskSelected,
    target: $activeTask,
})

sample({
    clock: taskClosed,
    fn: () => null,
    target: $activeTask
})

export const earnModel = {
    $data,
    $activeTask,

    taskSelected,
    taskClosed,

    useFetchGate,
}
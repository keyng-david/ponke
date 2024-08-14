import { createFetch } from '@/shared/lib/effector/createGateHook'
import { EarnItem } from './types'
import { EarnApi, earnApi } from '@/shared/api/earn'
import { createEvent, createStore, sample, createEffect } from 'effector'
import { GetEarnDataResponse, GetEarnDataResponseItem } from '@/shared/api/earn/types'

const [ FetchGate, fetchFx, useFetchGate ] = createFetch<EarnApi['getData']>(earnApi.getData)

const secondLeftedFx = createEffect(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))

    return 60
})

const taskSelected = createEvent<EarnItem>()
const taskClosed = createEvent()

const timeUpdated = createEvent<EarnItem>()

const $activeTask = createStore<EarnItem | null>(null)
const $list = createStore<EarnItem[]>([])
const $collabs = $list.map(item => item.length)

secondLeftedFx().then()

sample({
    source: $activeTask,
    clock: secondLeftedFx.doneData,
    filter: activeItem => !!activeItem,
    fn: activeTask => ({
        ...activeTask!,
        time: activeTask!.time - 1000,
    }),
    target: [$activeTask, timeUpdated, secondLeftedFx],
})

sample({
    source: $activeTask,
    clock: secondLeftedFx.doneData,
    filter: activeItem => !activeItem,
    target: secondLeftedFx,
})

sample({
    source: $list,
    clock: timeUpdated,
    fn: (list, updated) => list.map(item => item.id === updated.id ? updated : item),
    target: $list,
})

sample({
    clock: FetchGate.open,
    target: fetchFx,
})

sample({
    clock: fetchFx.doneData,
    fn: toDomain,
    target: $list,
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
    $list,
    $activeTask,
    $collabs,

    taskSelected,
    taskClosed,

    useFetchGate,
}

function toDomain(data: GetEarnDataResponse): EarnItem[] {
    function getAmount(item: GetEarnDataResponseItem) {
        const level = data.payload!.user_level as 1 | 2 | 3

        const sum = level && item[`reward${level}`] ? item[`reward${level}`] : item.reward

        return `${sum} ${item.reward_symbol}`
    }

    if (data.payload) {
        return data.payload.tasks.map(item => ({
            id: item.id,
            avatar: item.image_link,
            name: item.name,
            amount: getAmount(item),
            description: item.description,
            time: item.end_time,
            tasks: item.task_list,
            link: item.link,
            participants: item.total_clicks,
        }))
    }

    return []
}
import { createFetch } from '@/shared/lib/effector/createGateHook'
import { EarnItem } from './types'
import { EarnApi, earnApi } from '@/shared/api/earn'
import { createEvent, createStore, sample } from 'effector'
import { GetEarnDataResponse, GetEarnDataResponseItem } from '@/shared/api/earn/types'

const [ FetchGate, fetchFx, useFetchGate ] = createFetch<EarnApi['getData']>(earnApi.getData)

const taskSelected = createEvent<EarnItem>()
const taskClosed = createEvent()

const $activeTask = createStore<EarnItem | null>(null)
const $list = createStore<EarnItem[]>([])
const $collabs = $list.map(item => item.length)

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
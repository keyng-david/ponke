import { combine, createStore, sample } from "effector";

import { LeaderData } from './types'
import { LeadersApi, leadersApi } from "@/shared/api/leaders";
import { createFetch } from "@/shared/lib/effector/createGateHook";

const [ FetchGate, fetchFx, useFetchGate ] = createFetch<LeadersApi['getList']>(leadersApi.getList)

const $data = createStore<LeaderData[]>([{
    position: 1,
    name: '',
    score: 1,
}])
const $firstPosition = combine($data, list => list[0])
const $list = combine($data, list => list.slice(1))

sample({
    clock: FetchGate.open,
    target: fetchFx,
})

sample({
    clock: fetchFx.doneData,
    fn: ({ data }) => data.sort((a, b) => a.position > b.position ? 1 : -1),
    target: $data,
})

export const leadersModel = {
    $list,
    $firstPosition,
    useFetchGate,
}
import { combine, createStore, sample } from "effector";

import { LeaderData } from './types'
import { LeadersApi, leadersApi } from "@/shared/api/leaders";
import { createFetch } from "@/shared/lib/effector/createGateHook";
import {ResponseDefault} from "@/shared/lib/api/createRequest";
import {GetLeaderListResponse} from "@/shared/api/leaders/types";

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
    fn: leadersToDomain,
    target: $data,
})

export const leadersModel = {
    $list,
    $firstPosition,
    useFetchGate,
}

function leadersToDomain(data: ResponseDefault<GetLeaderListResponse>): LeaderData[] {
    if (data.payload) {
        return data.payload.leaders.map((item, key) => ({
            position: key + 1,
            name: item.username,
            score: item.score,
        }))
    }

    return []
}
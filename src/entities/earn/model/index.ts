import { createFetch } from '@/shared/lib/effector/createGateHook'
import { EarnData } from './types'
import { EarnApi, earnApi } from '@/shared/api/earn'
import { createStore, sample } from 'effector'

const [ FetchGate, fetchFx, useFetchGate ] = createFetch<EarnApi['getData']>(earnApi.getData)

const $data = createStore<EarnData>({
    collabs: 0,
    points: 0,
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

export const earnModel = {
    $data,
    useFetchGate,
}
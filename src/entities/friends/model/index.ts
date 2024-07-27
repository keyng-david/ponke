import { FriendsApi, friendsApi } from "@/shared/api/friends";
import { createFetch } from "@/shared/lib/effector/createGateHook";
import { createStore, sample } from "effector";

import { FriendsData } from './types'

const [ FetchGate, fetchFx, useFetchGate ] = createFetch<FriendsApi['getFriends']>(friendsApi.getFriends)

const $data = createStore<FriendsData>({
    points: 0,
    friends: 0,
    tg: 0,
    premium: 0
})

sample({
    clock: FetchGate.open,
    target: fetchFx,
})

sample({
    clock: fetchFx.doneData,
    fn: ({ data }) => data,
    target: $data,
})

export const friendsModel = {
    $data,
    useFetchGate,
}

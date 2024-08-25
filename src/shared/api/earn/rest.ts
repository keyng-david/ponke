import { EarnApi } from './types'
import {createRequest} from "@/shared/lib/api/createRequest";

export const earnApi: EarnApi = {
    getData: async () => await createRequest({
        endpoint: 'game/tasks',
        method: 'GET',
    }),
    taskJoined: async data => await createRequest({
        endpoint: 'game/completeTask',
        method: "POST",
        data,
    })
}
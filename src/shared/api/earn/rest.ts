import { EarnApi } from './types'
import {createRequest} from "@/shared/lib/api/createRequest";

export const earnApi: EarnApi = {
    getData: async () => await createRequest({
        endpoint: 'game/tasks',
        method: 'GET',
    }),
    taskJoined: async body => await createRequest({
        endpoint: 'game/completeTask',
        method: "POST",
        body,
        onError: undefined // or provide a function
    })
}
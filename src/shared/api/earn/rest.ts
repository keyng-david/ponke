import { EarnApi } from './types'
import {createRequest} from "@/shared/lib/api/createRequest";

export const earnApi: EarnApi = {
    getData: async () => await createRequest({
        url: 'game/tasks',
        method: 'GET',
    })
}
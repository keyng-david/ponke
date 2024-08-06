import {LeadersApi} from "@/shared/api/leaders/types";
import {createRequest} from "@/shared/lib/api/createRequest";

export const leadersApi: LeadersApi = {
    getList: async () => await createRequest({
        url: 'game/leaders',
        method: 'GET',
    })
}
import { LeadersApi } from './types'

export const leadersApi: LeadersApi = {
    async getList() {
        await new Promise(resolve => setTimeout(resolve, 2000))

        return {
            data: new Array(20).fill(1).map((_, key) => ({
                position: key,
                name: `username ${key}`,
                score: 100_000_000 - key * 1000,
            }))
        }
    },
}
import { EarnApi } from './types'

export const earnApi: EarnApi = {
    async getData() {
        await new Promise(resolve => setTimeout(resolve, 2000))

        return {
            collabs: 4,
            points: 20050,
            list: new Array(10).fill(1).map((_, key) => ({
                name: `name ${key}`,
                amount: 150_000,
                description: 'Addickted is the greatest meme coin on ton blockchain! Hold your dick! Don’t be a pussy! Buy Dick! Grow your dick!',
                tasks: new Array(5).fill(1).map((_, index) => ({
                    name: `task ${index}`,
                    isDone: index % 2 == 0,
                }))
            }))
        }
    }
}
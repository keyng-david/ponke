type GetEarnDataResponse = {
    collabs: number,
    points: number
    list: {
        name: string
        amount: number
        description: string
        tasks: {
            name: string
            isDone: boolean
        }[]
    }[]
}

export type EarnApi = {
    getData: () => Promise<GetEarnDataResponse>
}
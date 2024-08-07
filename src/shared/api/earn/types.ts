type GetEarnDataResponse = {
    collabs: number,
    list: {
        name: string
        amount: number
        time: number
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
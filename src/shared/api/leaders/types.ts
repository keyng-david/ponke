export type GetLeaderListResponse = {
    data: {
        position: number
        name: string
        score: number
    }[]
}

export type LeadersApi = {
    getList: () => Promise<GetLeaderListResponse>
}
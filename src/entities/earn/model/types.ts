export type EarnData = {
    collabs: number
    points: number
    list: EarnItem[]
}

export type EarnItem = {
    name: string
    amount: number
    description: string
    tasks: {
        name: string
        isDone: boolean
    }[]
}
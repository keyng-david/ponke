export type EarnData = {
    collabs: number
    list: EarnItem[]
}

export type EarnItem = {
    name: string
    amount: number
    time: number
    description: string
    tasks: EarnItemTask[]
}

export type EarnItemTask = {
    name: string
    isDone: boolean
}
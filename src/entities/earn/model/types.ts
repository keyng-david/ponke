export type EarnData = {
    collabs: number
    list: EarnItem[]
}

export type EarnItem = {
    avatar: string
    name: string
    amount: string
    description: string
    time: number
    tasks: string[]
    link: string
    participants: number
}
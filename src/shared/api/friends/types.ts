export type GetFriendsResponse = {
    data: {
        points: number
        friends: number
        tg: number
        premium: number
    }
}

export type FriendsApi = {
    getFriends: () => Promise<GetFriendsResponse>
}
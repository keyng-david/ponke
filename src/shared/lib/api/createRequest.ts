export type SuccessResponse<T> = {
    error: false,
    payload: T
}

export type FailureResponse = {
    error: true,
    payload: null
}

export type ResponseDefault<T> = SuccessResponse<T> | FailureResponse

export async function createRequest<T>(data: {
    url: string
    method: 'POST' | 'GET' | 'PUT' | 'DELETE',
    data?: Record<string, unknown>,
}): Promise<ResponseDefault<T>> {
    try {
        const token = await localStorage.getItem('jwt-token')

        const url = `https://api.toptubereviews.buzz/${data.url}`

        const response = await fetch(
            url,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                method: data.method,
                ...(data.data && {
                    body: JSON.stringify(data.data)
                })
            }
        )

        const payload = await response.json() as T

        if (response.ok) {
            return {
                error: false,
                payload,
            }
        }

        return {
            error: true,
            payload: null
        }
    } catch (e) {
        return {
            error: true,
            payload: null
        }
    }
}
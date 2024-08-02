export const useAccessToken = () => {
    async function get() {
        return localStorage.getItem('access-token') ?? null
    }

    async function set(v: string) {
        localStorage.setItem('access-token', v)
    }

    function remove() {
        localStorage.removeItem('access-token')
    }

    return {
        get,
        set,
        remove
    }
}
type TelegramWindow = {
    Telegram: {
        WebApp: {
            expand: () => void
            ready: () => void
        }
    }
}

export const useTelegram = () => {
    const tg = (window as unknown as TelegramWindow)

    function expand() {
        try {
            tg.Telegram.WebApp.ready()
            tg.Telegram.WebApp.expand()
        } catch (e) {
            console.log(e)
        }
    }

    return {
        expand
    }
}
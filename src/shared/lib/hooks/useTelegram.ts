type TelegramWindow = {
    Telegram: {
        WebApp: {
            expand: () => void
        }
    }
}

export const useTelegram = () => {
    const tg = (window as unknown as TelegramWindow)

    function expand() {
        try {
            tg.Telegram.WebApp.expand()
        } catch (e) {
            console.log(e)
        }
    }

    return {
        expand
    }
}
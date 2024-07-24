type TelegramWindow = {
    Telegram: {
        WebApp: {
            expand: () => void
            ready: () => void
            HapticFeedback: {
                impactOccurred: (v: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
            }
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

    function haptic() {
        try {
            tg.Telegram.WebApp.HapticFeedback.impactOccurred('light')
        } catch (e) {
            console.log(e)
        }
    }

    return {
        expand,
        haptic,
    }
}
import {useMemo} from "react";

type TelegramWindow = {
    Telegram: {
        WebApp: {
            expand: () => void
            ready: () => void
            openTelegramLink: (data: string) => void
            HapticFeedback: {
                impactOccurred: (v: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
            }
        },
        authData: {
            user?: {
                id: string
            }
        }
    }
}

export const useTelegram = () => {
    const tg = (window as unknown as TelegramWindow)

    function sendInviteLink() {
        try {
            tg.Telegram.WebApp.openTelegramLink(
                `https://t.me/share/url?url=https://t.me/ponketon_bot?start=${tg.Telegram?.authData?.user?.id || 0}&text=`
            )
        } catch (e) {
            alert(e)
        }
    }

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
        sendInviteLink,
    }
}
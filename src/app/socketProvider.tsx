import { clickerModel } from "@/features/clicker/model";
import { socketResponseToJSON } from "@/shared/lib/utils/socketResponseToJSON";
import React, { createContext, useContext, useEffect } from "react";
import useWebSocket, { SendMessage } from "react-use-websocket";

export const SoketContext = createContext<{
    sendMessage: SendMessage
}>({
    sendMessage: () => 0
})

export const useSocket = () => {
    const socket = useContext(SoketContext)

    return socket
}

export const SocketProvider = React.memo<React.PropsWithChildren>(({ children }) => {
    const { sendMessage, lastMessage } = useWebSocket(
        'wss://socket.toptubereviews.buzz',
        {
            shouldReconnect: () => true,
            reconnectInterval: 0,
            onOpen: () => {
                console.log('on open')
                const token = localStorage.getItem('jwt-token')
                sendMessage(`handshake:{"jwt_token":"${token}"}`)
            },
        }
    )

    useEffect(() => {
        console.log(lastMessage?.data)

        if (lastMessage && typeof lastMessage.data === 'string' && lastMessage?.data.includes('click_response')) {
            const data = socketResponseToJSON<{
                score: number,
                click_score: number,
                available_clicks: number
            }>(lastMessage.data)

            clickerModel.clicked(data)
        }
        if (lastMessage && typeof lastMessage.data === 'string' && lastMessage?.data.includes('availableClicks')) {
            const data = socketResponseToJSON<{
                available_clicks: number,
            }>(lastMessage.data)

            clickerModel.availableUpdated(data.available_clicks)
        }
        if (lastMessage && typeof lastMessage.data === 'string' && lastMessage?.data.includes('CODE')) {
            clickerModel.errorUpdated(lastMessage.data.includes('1001'))
        }
    }, [lastMessage]);

    return <SoketContext.Provider value={{ sendMessage }}>
        {children}
    </SoketContext.Provider>
})
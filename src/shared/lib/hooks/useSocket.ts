import { useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

let isFirstConnection = false

export const useSocket = () => {
    const { sendMessage, lastMessage, readyState } = useWebSocket(
        'wss://socket.toptubereviews.buzz',
        {
            shouldReconnect: () => true,
            reconnectInterval: 0,
            onOpen: () => {
                if (!isFirstConnection) {
                    const token = localStorage.getItem('jwt-token')
                    sendMessage(`handshake:{"jwt_token":"${token}"}`)
                    isFirstConnection = true
                }
            },
            onClose: () => {
                isFirstConnection = false
            }
        }
    )

    return {
        lastMessage,

        sendMessage,
    }
}
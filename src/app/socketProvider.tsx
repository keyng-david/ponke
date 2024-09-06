import { clickerModel } from "@/features/clicker/model";
import { socketResponseToJSON } from "@/shared/lib/utils/socketResponseToJSON";
import React, { createContext, useContext, useEffect } from "react";
import useWebSocket, { SendMessage } from "react-use-websocket";
import { useStore } from "effector-react";
import { $sessionId } from "@/shared/model/session";

export const SoketContext = createContext<{
    sendMessage: SendMessage
}>({
    sendMessage: () => 0
});

export const useSocket = () => {
    const socket = useContext(SoketContext);
    return socket;
};

export const SocketProvider = React.memo<React.PropsWithChildren>(({ children }) => {
    const sessionId = useStore($sessionId); // Use the sessionId from the Effector store
    const { sendMessage, lastMessage } = useWebSocket(
        'https://ponke-alpha.vercel.app/api/game/websocketServer',
        {
            shouldReconnect: () => true,
            reconnectInterval: 0,
            onOpen: () => {
                console.log('on open');
                if (sessionId) { // Now we can safely use sessionId here
                    sendMessage(`handshake:{"session_id":"${sessionId}"}`);
                }
            },
        }
    );

    useEffect(() => {
        console.log(lastMessage?.data);

        if (lastMessage && typeof lastMessage.data === 'string') {
            if (lastMessage.data.includes('click_response')) {
                const data = socketResponseToJSON<{
                    score: number,
                    click_score: number,
                    available_clicks: number
                }>(lastMessage.data);

                clickerModel.clicked(data);
            }
            if (lastMessage.data.includes('availableClicks')) {
                const data = socketResponseToJSON<{
                    available_clicks: number,
                }>(lastMessage.data);

                clickerModel.availableUpdated(data.available_clicks);
            }
            if (lastMessage.data.includes('CODE')) {
                clickerModel.errorUpdated(lastMessage.data.includes('1001'));
            }
            if (lastMessage.data.includes('user_update')) {
                const update = socketResponseToJSON<{ type: string, data: any }>(lastMessage.data);
                // Handle user updates here
            }
        }
    }, [lastMessage]);

    return (
        <SoketContext.Provider value={{ sendMessage }}>
            {children}
        </SoketContext.Provider>
    );
});
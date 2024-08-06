import {useCallback, useRef} from "react";
import {useNavigate} from "react-router-dom";

import { clickerModel } from '../clicker/model'

import {useJWTToken} from "@/shared/model/jwt";
import { createRequest } from "@/shared/lib/api/createRequest";
import {useSocket} from "@/shared/lib/hooks/useSocket";

export const useAuth = () => {
    const isInit = useRef(false)
    const navigate = useNavigate()

    const jwtTokenStore = useJWTToken()
    const soket = useSocket()

    const initialize = useCallback(async () => {
        try {
            if (!isInit.current) {
                jwtTokenStore.remove()

                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token') as string;

                // const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjMwMzAwNzUxIiwiZXhwIjoxNzIzNDgzNzk5LCJpc3MiOiJQb25rZSBBdXRoIn0.YzmAl7q6OBgXO_9HKVDy1rNPb9NU4UCbIvfTX8NWda8'
                jwtTokenStore.set(token)
                
                const response = await createRequest<{
                    score: number
                }>({
                    url: 'game/auth',
                    method: 'POST',
                })

                if (!response.error) {
                    // soket.init(token)
                    clickerModel.valueInited(response.payload.score)
                    navigate('/main')
                    isInit.current = true
                } else {
                    jwtTokenStore.remove()
                }
            }
        } catch (e) {
            jwtTokenStore.remove()
            console.log(e)
        }
    }, [jwtTokenStore, navigate])

    return {
        initialize,
    }
}
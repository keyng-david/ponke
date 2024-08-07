import {useCallback, useRef} from "react";
import {useNavigate} from "react-router-dom";

import { clickerModel } from '../clicker/model'

import {useJWTToken} from "@/shared/model/jwt";
import { createRequest } from "@/shared/lib/api/createRequest";

export const useAuth = () => {
    const isInit = useRef(false)
    const navigate = useNavigate()

    const jwtTokenStore = useJWTToken()

    const initialize = useCallback(async () => {
        try {
            if (!isInit.current) {
                // const urlParams = new URLSearchParams(window.location.search);
                // const token = urlParams.get('token');

                const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjMwMzAwNzUxIiwiZXhwIjoxNzIzNDgzNzk5LCJpc3MiOiJQb25rZSBBdXRoIn0.YzmAl7q6OBgXO_9HKVDy1rNPb9NU4UCbIvfTX8NWda8'
                if (token) {
                    jwtTokenStore.set(token)
                }

                const response = await createRequest<{
                    score: number
                    available_clicks: number,
                }>({
                    url: 'game/auth',
                    method: 'POST',
                })

                if (!response.error) {
                    // soket.init(token)
                    clickerModel.valueInited(response.payload.score)
                    clickerModel.availableInited(response.payload.available_clicks)
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
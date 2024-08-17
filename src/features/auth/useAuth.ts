import {useCallback} from "react";
import {useNavigate} from "react-router-dom";

import { clickerModel } from '../clicker/model'

import {useJWTToken} from "@/shared/model/jwt";
import { createRequest } from "@/shared/lib/api/createRequest";
import {createEvent, createStore} from "effector";
import {useUnit} from "effector-react";
import {walletModel} from "@/shared/model/wallet";

const setIsAuth = createEvent<boolean>()

const $isAuth = createStore(false)
    .on(setIsAuth, () => true)

export const useAuth = () => {
    const navigate = useNavigate()

    const isAuth = useUnit($isAuth)

    const jwtTokenStore = useJWTToken()
    const wallet = walletModel.useWalletModel()

    const initialize = useCallback(async () => {
        try {
            if (!isAuth) {
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');
                
                // const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjMwMzAwNzUxIiwiZXhwIjoxNzIzNDgzNzk5LCJpc3MiOiJQb25rZSBBdXRoIn0.YzmAl7q6OBgXO_9HKVDy1rNPb9NU4UCbIvfTX8NWda8'
                if (token) {
                    jwtTokenStore.set(token)
                }

                const response = await createRequest<{
                    score: number
                    available_clicks: number,
                    wallet: string
                }>({
                    url: 'game/auth',
                    method: 'POST',
                })

                if (!response.error) {
                    clickerModel.valueInited(response.payload.score)
                    clickerModel.availableInited(response.payload.available_clicks)
                    wallet.updateWallet(response.payload.wallet)
                    navigate('/main')
                    setIsAuth(true)
                } else {
                    jwtTokenStore.remove()
                }
            }
        } catch (e) {
            jwtTokenStore.remove()
            console.log(e)
        }
    }, [jwtTokenStore, navigate, isAuth])

    return {
        initialize,
    }
}
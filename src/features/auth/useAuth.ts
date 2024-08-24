import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clickerModel } from '../clicker/model';
import { useJWTToken } from "@/shared/model/jwt";
import { createRequest } from "@/shared/lib/api/createRequest";
import { createEvent, createStore } from "effector";
import { useUnit } from "effector-react";
import { walletModel } from "@/shared/model/wallet";
import { randModel } from "@/shared/model/rang";

const setIsAuth = createEvent<boolean>();

const $isAuth = createStore(false).on(setIsAuth, () => true);

export const useAuth = () => {
    const navigate = useNavigate();
    const isAuth = useUnit($isAuth);
    const jwtTokenStore = useJWTToken();
    const wallet = walletModel.useWalletModel();
    const rangModel = randModel.useRang();
    const [error, setError] = useState<string | null>(null); // New state for storing error

    const initialize = useCallback(async () => {
        try {
            if (!isAuth) {
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token')

                if (token) {
                    jwtTokenStore.set(token);
                } else {
                    setError("No token found");
                    return;
                }

                const response = await createRequest<{
                    score: number;
                    available_clicks: number;
                    wallet: string;
                    level: number;
                }>({
                    url: 'game/auth',
                    method: 'POST',
                });

                if (!response.error) {
                    clickerModel.valueInited(response.payload.score);
                    clickerModel.availableInited(response.payload.available_clicks);
                    wallet.updateWallet(response.payload.wallet);
                    rangModel.update(response.payload.level);
                    navigate('/main');
                    setIsAuth(true);
                } else {
                    setError("Authentication failed. Please try again.");
                    jwtTokenStore.remove();
                }
            }
        } catch (e) {
            setError(`Error during authentication: ${e.message || e}`);
            jwtTokenStore.remove();
        }
    }, [isAuth, jwtTokenStore, wallet, rangModel, navigate]);

    return {
        initialize,
        error, // Return error state
    };
};
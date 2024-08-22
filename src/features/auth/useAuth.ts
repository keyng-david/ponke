import {useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {clickerModel} from '../clicker/model';
import {useJWTToken} from "@/shared/model/jwt";
import {createRequest} from "@/shared/lib/api/createRequest";
import {createEvent, createStore} from "effector";
import {useUnit} from "effector-react";
import {walletModel} from "@/shared/model/wallet";
import {randModel} from "@/shared/model/rang";

const setIsAuth = createEvent<boolean>();

const $isAuth = createStore(false).on(setIsAuth, () => true);

export const useAuth = () => {
    const navigate = useNavigate();
    const isAuth = useUnit($isAuth);
    const jwtTokenStore = useJWTToken();
    const wallet = walletModel.useWalletModel();
    const rangModel = randModel.useRang();

    const initialize = useCallback(async () => {
        try {
            if (!isAuth) {
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token') || process.env.JWT_TOKEN;

                if (token) {
                    jwtTokenStore.set(token);
                } else {
                    console.log("No token found");
                    return;
                }

                console.log("Token:", token); // Debugging token value

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
                    console.log("Auth success, navigating to main");
                    clickerModel.valueInited(response.payload.score);
                    clickerModel.availableInited(response.payload.available_clicks);
                    wallet.updateWallet(response.payload.wallet);
                    rangModel.update(response.payload.level);
                    navigate('/main');
                    setIsAuth(true);
                } else {
                    console.log("Auth failed, removing token");
                    jwtTokenStore.remove();
                }
            }
        } catch (e) {
            jwtTokenStore.remove();
            console.log("Error during auth:", e);
        }
    }, [isAuth, jwtTokenStore, wallet, rangModel, navigate]);

    return {
        initialize,
    };
};
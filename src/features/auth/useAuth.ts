import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { clickerModel } from "../clicker/model";
import { useJWTToken } from "@/shared/model/jwt";
import { createRequest } from "@/shared/lib/api/createRequest";
import { createEvent, createStore } from "effector";
import { useUnit } from "effector-react";
import { walletModel } from "@/shared/model/wallet";
import { randModel } from "@/shared/model/rang";
import { useErrorHandler } from "@/shared/lib/hooks/useErrorHandler";

const setIsAuth = createEvent<boolean>();

const $isAuth = createStore(false).on(setIsAuth, () => true);

export const useAuth = () => {
  const navigate = useNavigate();
  const isAuth = useUnit($isAuth);
  const jwtTokenStore = useJWTToken();
  const wallet = walletModel.useWalletModel();
  const rangModel = randModel.useRang();
  const { setError } = useErrorHandler();

  const initialize = useCallback(async () => {
    try {
      if (!isAuth) {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

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
          url: "game/auth",
          method: "POST",
        });

        if (!response.error) {
          clickerModel.valueInited(response.payload.score);
          clickerModel.availableInited(response.payload.available_clicks);
          wallet.updateWallet(response.payload.wallet);
          rangModel.update(response.payload.level);
          navigate("/main");
          setIsAuth(true);
        } else {
          jwtTokenStore.remove();
          setError("Authentication failed, invalid response");
        }
      }
    } catch (e) {
      jwtTokenStore.remove();
      if (e instanceof Error) {
  setError(`Error during authentication: ${e.message}`);
} else {
  setError(`Error during authentication: ${String(e)}`);
}
    }
  }, [isAuth, jwtTokenStore, wallet, rangModel, navigate, setError]);

  return {
    initialize,
  };
};
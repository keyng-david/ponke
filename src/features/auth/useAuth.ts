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

const setIsAuth = createEvent();
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
          throw new Error("No token found");
        }

        const response = await createRequest<{
          score: number;
          available_clicks: number;
          wallet: string | null;
          level: number;
        }>({
          endpoint: "game/auth",
          method: "POST",
        });

        if (!response.error && response.payload) {
          clickerModel.valueInited(response.payload.score);
          clickerModel.availableInited(response.payload.available_clicks);

          if (response.payload.wallet) {
            wallet.updateWallet(response.payload.wallet);
          }

          rangModel.update(response.payload.level);
          navigate("/main");
          setIsAuth(true);
        } else {
          throw new Error("Authentication failed, invalid response");
        }
      }
    } catch (e: any) {
      console.error(`Error during authentication: ${e.message || "Unknown error"}`);
      jwtTokenStore.remove();
      setError(`Error during authentication: ${e.message || "Unknown error"}`);
    }
  }, [isAuth, jwtTokenStore, wallet, rangModel, navigate, setError]);

  return { initialize };
};
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { clickerModel } from "../clicker/model";
import { useJWTToken } from "@/shared/model/jwt";
import { createRequest } from "@/shared/lib/api/createRequest";
import { createEvent, createStore } from "effector";
import { useUnit } from "effector-react";
import { walletModel } from "@/shared/model/wallet";
import { randModel } from "@/shared/model/rang"; // Corrected import from rang to rand
import { useErrorHandler } from "@/shared/lib/hooks/useErrorHandler";

const setIsAuth = createEvent<boolean>();

const $isAuth = createStore(false).on(setIsAuth, (_, isAuth) => isAuth);

export const useAuth = () => {
  const navigate = useNavigate();
  const isAuth = useUnit($isAuth);
  const jwtTokenStore = useJWTToken();
  const wallet = walletModel.useWalletModel();
  const rang = randModel.useRang(); // Corrected from rangModel to randModel
  const { setError } = useErrorHandler();

  const initialize = useCallback(async () => {
    if (isAuth) {
      return; // Exit early if already authenticated
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (!token) {
        setError("No token found");
        return;
      }

      jwtTokenStore.set(token);

      const response = await createRequest<{
        score: number;
        available_clicks: number;
        wallet: string | null;
        level: number;
      }>(
        "game/auth",
        {
          method: "POST",
        },
        setError // Pass setError for debugging
      );

      if (response.error) {
        setError("Authentication failed, invalid response");
        jwtTokenStore.remove();
        return;
      }

      clickerModel.valueInited(response.payload.score);
      clickerModel.availableInited(response.payload.available_clicks);

      if (response.payload.wallet) {
        wallet.updateWallet(response.payload.wallet);
      }

      rang.update(response.payload.level); // Corrected usage of rang to rand
      setIsAuth(true);
      navigate("/main");
    } catch (e) {
      setError(`Error during authentication: ${e instanceof Error ? e.message : String(e)}`);
      jwtTokenStore.remove();
    }
  }, [isAuth, jwtTokenStore, wallet, rang, navigate, setError]);

  return {
    initialize,
  };
};
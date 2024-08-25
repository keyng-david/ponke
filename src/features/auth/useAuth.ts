import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { clickerModel } from "../clicker/model";
import { useJWTToken } from "@/shared/model/jwt";
import { createRequest } from "@/shared/lib/api/createRequest";
import { createEvent, createStore } from "effector";
import { useUnit } from "effector-react";
import { walletModel } from "@/shared/model/wallet";
import { randModel } from "@/shared/model/rand"; // Corrected import from rang to rand
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
        throw new Error("Token is missing from URL parameters");
      }

      const response = await createRequest({
        endpoint: "game/auth",
        method: "POST",
        body: { token },
        onError: setError, // Pass setError for debugging
      });

      if (response.error) {
        throw new Error(response.error);
      }

      jwtTokenStore.setJWTToken(response.data.token);
      wallet.setWallet(response.data.wallet);
      rang.setRang(response.data.rang);
      clickerModel.setClickerData(response.data.clickerData);

      setIsAuth(true);
      navigate("/home");
    } catch (error: any) {
      setError(error.message || "An unknown error occurred during authentication");
      setIsAuth(false);
    }
  }, [isAuth, jwtTokenStore, wallet, rang, clickerModel, setError, navigate]);

  return {
    initialize,
    isAuth,
  };
};
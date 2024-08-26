import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { clickerModel } from "../clicker/model";
import { useSessionId } from "@/shared/model/session"; // Replace useJWTToken with useSessionId
import { createRequest } from "@/shared/lib/api/createRequest";
import { createEvent, createStore } from "effector";
import { useUnit } from "effector-react";
import { walletModel } from "@/shared/model/wallet";
import { randModel } from "@/shared/model/rang";
import { useErrorHandler } from "@/shared/lib/hooks/useErrorHandler";

const setIsAuth = createEvent<boolean>();
const $isAuth = createStore(false).on(setIsAuth, (_, value) => value);

export const useAuth = () => {
  const navigate = useNavigate();
  const isAuth = useUnit($isAuth);
  const sessionIdStore = useSessionId(); // Use session ID instead of JWT token
  const wallet = walletModel.useWalletModel();
  const rangModel = randModel.useRang();
  const { setError } = useErrorHandler();

  const initialize = useCallback(async () => {
  try {
    if (!isAuth) {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("session_id");

      if (sessionId) {
        sessionIdStore.set(sessionId);
      } else {
        setError("No session ID found");
        return;
      }

      const response = await createRequest<{
        score: number;
        available_clicks: number;
        wallet: string | null;
        level: number;
      }>({
        endpoint: "/api/game/auth",
        method: "POST",
        headers: {
          Authorization: `Session ${sessionId}`,  // Send session ID in the Authorization header
        },
      });

      if (!response.error) {
        clickerModel.valueInited(response.payload.score);
        clickerModel.availableInited(response.payload.available_clicks);

        if (response.payload.wallet) {
          wallet.updateWallet(response.payload.wallet);
        }

        rangModel.update(response.payload.level);
        navigate("/main");
        setIsAuth(true);
      } else {
        sessionIdStore.remove();
        setError("Authentication failed, invalid response");
      }
    }
  } catch (e) {
    sessionIdStore.remove();
    setError(`Error during authentication: ${e instanceof Error ? e.message : String(e)}`);
  }
}, [isAuth, sessionIdStore, wallet, rangModel, navigate, setError]);

  return { initialize };
};
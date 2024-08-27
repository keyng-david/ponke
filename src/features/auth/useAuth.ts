import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent, createStore } from "effector";
import { useUnit } from "effector-react";
import { clickerModel } from "../clicker/model";
import { useSessionId } from "@/shared/model/session";
import { createRequest } from "@/shared/lib/api/createRequest";
import { walletModel } from "@/shared/model/wallet";
import { randModel } from "@/shared/model/rang";
import { useErrorHandler } from "@/shared/lib/hooks/useErrorHandler";

// New event and store to manage telegram_id
const setTelegramId = createEvent<string>();
const $telegramId = createStore<string | null>(null).on(setTelegramId, (_, id) => id);

const setIsAuth = createEvent<boolean>();
const $isAuth = createStore(false).on(setIsAuth, (_, value) => value);

export const useAuth = () => {
  const navigate = useNavigate();
  const isAuth = useUnit($isAuth);
  const sessionIdStore = useSessionId();
  const wallet = walletModel.useWalletModel();
  const rangModel = randModel.useRang();
  const { setError } = useErrorHandler();
  const telegramId = useUnit($telegramId);  // Hook to retrieve telegram_id

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
          telegram_id: string;  // Include telegram_id in the response type
        }>({
          endpoint: "/api/game/auth",
          method: "POST",
          body: {
            sessionId  // Send session ID in the body instead of headers
          },
        });

        if (!response.error) {
          clickerModel.valueInited(response.payload.score);
          clickerModel.availableInited(response.payload.available_clicks);

          if (response.payload.wallet) {
            wallet.updateWallet(response.payload.wallet);
          }

          rangModel.update(response.payload.level);

          // Set telegram_id for global access
          setTelegramId(response.payload.telegram_id);

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

  // Return both the initialize method and the telegram_id
  return { initialize, telegramId };
};
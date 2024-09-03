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

// New events and stores to manage global state
const setTelegramId = createEvent<string>();
const $telegramId = createStore<string | null>(null).on(setTelegramId, (_, id) => id);

const setSessionId = createEvent<string>();
const $sessionId = createStore<string | null>(null).on(setSessionId, (_, id) => id);

const setIsAuth = createEvent<boolean>();
const $isAuth = createStore(false).on(setIsAuth, (_, value) => value);

// New global events and stores for score and available clicks
const setValue = createEvent<number>();
const $value = createStore<number>(0).on(setValue, (_, value) => value);

const setAvailable = createEvent<number>();
const $available = createStore<number>(500).on(setAvailable, (_, available) => available);

export const useAuth = () => {
  const navigate = useNavigate();
  const isAuth = useUnit($isAuth);
  const sessionIdStore = useSessionId();
  const wallet = walletModel.useWalletModel();
  const rangModel = randModel.useRang(); 
  const { setError } = useErrorHandler();
  const telegramId = useUnit($telegramId);
  const sessionId = useUnit($sessionId);

  const initialize = useCallback(async () => {
    try {
      if (!isAuth) {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get("session_id");

        if (sessionId) {
          sessionIdStore.set(sessionId);
          setSessionId(sessionId);
        } else {
          setError("No session ID found");
          return;
        }

        const response = await createRequest<{
          score: number;
          available_clicks: number;
          wallet: string | null;
          level: number;
          telegram_id: string;
        }>({
          endpoint: "/api/game/auth",
          method: "POST",
          body: {
            sessionId,
          },
        });

        if (!response.error) {
          // Initialize global stores with retrieved values
          setValue(response.payload.score);
          setAvailable(response.payload.available_clicks);
          clickerModel.valueInited(response.payload.score);
          clickerModel.availableInited(response.payload.available_clicks);

          if (response.payload.wallet) {
            wallet.updateWallet(response.payload.wallet);
          }

          rangModel.update(response.payload.level);
          setTelegramId(response.payload.telegram_id);

          setIsAuth(true);
          navigate("/main");
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

  return {
    initialize,
    telegramId,
    sessionId,
    isAuth,
    initialScore: useUnit($value) ?? 0,
    initialAvailableClicks: useUnit($available) ?? 0,
  };
};
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent, createStore } from "effector";
import { useUnit } from "effector-react";
import { useSessionId } from "@/shared/model/session";
import { walletModel } from "@/shared/model/wallet";
import { randModel } from "@/shared/model/rang"; 
import { useErrorHandler } from "@/shared/lib/hooks/useErrorHandler";

// Events and stores for global state
const setTelegramId = createEvent<string>();
const $telegramId = createStore<string | null>(null).on(setTelegramId, (_, id) => id);

const setSessionId = createEvent<string>();
const $sessionId = createStore<string | null>(null).on(setSessionId, (_, id) => id);

const setIsAuth = createEvent<boolean>();
const $isAuth = createStore(false).on(setIsAuth, (_, value) => value);

// New global stores for game data
const setInitialScore = createEvent<number>();
const $initialScore = createStore<number>(0).on(setInitialScore, (_, score) => score);

const setInitialAvailableClicks = createEvent<number>();
const $initialAvailableClicks = createStore<number>(0).on(setInitialAvailableClicks, (_, clicks) => clicks);

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

        const response = await fetch("/api/game/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store initial game data globally
          setInitialScore(data.score);
          console.log("Initial Score set:", data.score); // Log the score to confirm

          setInitialAvailableClicks(data.available_clicks);
          console.log("Initial Available Clicks set:", data.available_clicks); // Log the clicks to confirm

          if (data.wallet) {
            wallet.updateWallet(data.wallet);
          }

          rangModel.update(data.level);
          setTelegramId(data.telegram_id);
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
    initialScore: useUnit($initialScore), // Directly from the global store
    initialAvailableClicks: useUnit($initialAvailableClicks), // Directly from the global store
  };
};
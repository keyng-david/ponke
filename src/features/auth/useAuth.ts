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
  console.log("initialize function called");
  try {
    if (!isAuth) {
      console.log("User is not authenticated, starting authentication process");
      
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("session_id");

      if (!sessionId) {
        console.error("No session ID found in the URL");
        setError("No session ID found");
        return;
      }

      console.log("Session ID found:", sessionId);
      sessionIdStore.set(sessionId);
      setSessionId(sessionId);

      const response = await fetch("/api/game/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        console.error("Authentication request failed with status:", response.status);
        setError("Authentication failed, invalid response");
        sessionIdStore.remove();
        return;
      }

      const data = await response.json();
      console.log("Authentication response data:", data);

      // Store initial game data globally
      setInitialScore(data.score);
      console.log("Initial Score set:", data.score);

      setInitialAvailableClicks(data.available_clicks);
      console.log("Initial Available Clicks set:", data.available_clicks);

      if (data.wallet) {
        wallet.updateWallet(data.wallet);
      }

      rangModel.update(data.level);
      setTelegramId(data.telegram_id);
      setIsAuth(true);

      console.log("Navigating to /main");
      navigate("/main");
    }
  } catch (e) {
    console.error("Error during initialization:", e);
    setError(`Error during authentication: ${e instanceof Error ? e.message : String(e)}`);
    sessionIdStore.remove();
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
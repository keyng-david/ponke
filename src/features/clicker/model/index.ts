import { useState, useEffect, useCallback } from "react";
import { createEvent, createStore, sample } from "effector";
import { useUnit } from "effector-react";
import { $sessionId } from "@/shared/model/session";
import { debounce } from "lodash";

// Constants
export const CLICK_STEP = 1;
export const MAX_AVAILABLE = 500; // Set the max refill limit

// Events
export const valueInited = createEvent<number>();
export const availableInited = createEvent<number>();
export const availableUpdated = createEvent<number>();
export const errorUpdated = createEvent<boolean>();

// Stores
export const $isMultiAccount = createStore(false);
export const $value = createStore<number | null>(null, { skipVoid: false }).on(valueInited, (_, score) => score);
export const $available = createStore<number | null>(null, { skipVoid: false }).on(availableInited, (_, availableClicks) => availableClicks);

// Effector samples
sample({
  clock: availableUpdated,
  target: $available,
});

sample({
  clock: valueInited,
  target: $value,
});

sample({
  clock: errorUpdated,
  target: $isMultiAccount,
});

// Hooks
export const useCanBeClicked = () => useUnit($available.map((state) => (state ?? 0) >= CLICK_STEP));

export const useClicker = () => {
  const sessionId = useUnit($sessionId);
  const availableClicks = useUnit($available);
  const currentValue = useUnit($value) ?? 0;
  const [lastActivityTime, setLastActivityTime] = useState<number | null>(null);
  const [isRefilling, setIsRefilling] = useState(false);

  // WebSocket or another method should handle server-side updates
  const sendPointsUpdate = useCallback(
    (score: number, availableClicks: number) => {
      if (!sessionId) {
        console.error("No session ID available");
        return;
      }

      // Simulate WebSocket call
      console.log("Sending WebSocket update:", { session_id: sessionId, click_score: score, available_clicks: availableClicks });
    },
    [sessionId]
  );

  // Debounced update to avoid rapid firing of events
  const debouncedSendPointsUpdate = useCallback(
    debounce((totalScore: number, totalAvailableClicks: number) => {
      sendPointsUpdate(totalScore, totalAvailableClicks);
    }, 2000),
    [sendPointsUpdate]
  );

  // Handle refill logic
  useEffect(() => {
    if (!isRefilling && (Date.now() - (lastActivityTime ?? 0)) > 4000 && (availableClicks ?? 0) < MAX_AVAILABLE) {
      setIsRefilling(true);
      const refillInterval = setInterval(() => {
        if ((availableClicks ?? 0) < MAX_AVAILABLE) {
          availableUpdated((availableClicks ?? 0) + 1);
        } else {
          clearInterval(refillInterval);
          setIsRefilling(false);
        }
      }, 1000);

      return () => clearInterval(refillInterval);
    }
  }, [availableClicks, lastActivityTime, isRefilling]);

  return {
    value: currentValue,
    available: availableClicks,
    canBeClicked: useUnit($available.map((state) => (state ?? 0) >= CLICK_STEP)),
    isMultiError: useUnit($isMultiAccount),
    onClick: (score: number, availableClicks: number) => {
      setLastActivityTime(Date.now());
      debouncedSendPointsUpdate(score, availableClicks);
    },
  };
};

export const clickerModel = {
  availableUpdated,
  valueInited,
  availableInited,
  errorUpdated,
  useCanBeClicked,
  useClicker,
  $value,
  $available,
};
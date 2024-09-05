import { useState, useEffect, useCallback, useRef } from "react";
import { createEvent, createStore, sample } from "effector";
import { useUnit } from "effector-react";
import { $sessionId } from "@/shared/model/session";
import { debounce } from "lodash";


export const CLICK_STEP = 1

// Events
export const valueInited = createEvent<number>();
export const availableInited = createEvent<number>();
export const availableUpdated = createEvent<number>();
export const errorUpdated = createEvent<boolean>();

// Stores
export const $isMultiAccount = createStore(false);
export const $value = createStore<number | null>(null, { skipVoid: false })
  .on(valueInited, (_, score) => score);

export const $available = createStore<number | null>(null, { skipVoid: false })
  .on(availableInited, (_, availableClicks) => availableClicks);

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
  const [lastClickTime, setLastClickTime] = useState<Date | null>(null);

  const availableClicks = useUnit($available);
  const currentValue = useUnit($value) ?? 0;

  const sendPointsUpdate = useCallback(
  async (score: number, availableClicks: number) => {
    if (!sessionId) {
      console.error("No session ID available");
      return;
    }

    try {
      const response = await fetch("/api/game/updatePoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, click_score: score, available_clicks: availableClicks }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Failed to update points:", data.error || "Unknown error");
        return;
      }

      // Real-time updates will manage score updates via WebSocket

    } catch (error) {
      console.error("Error updating points:", error);
    }
  },
  [sessionId]
);

// Debounce the function to send points after 2 seconds of inactivity
const debouncedSendPointsUpdate = useCallback(
  debounce(async () => {
    await sendPointsUpdate(currentValue, availableClicks);
  }, 2000),
  [sendPointsUpdate, currentValue, availableClicks]
);

  const onClick = useCallback(() => {
    setLastClickTime(new Date());
    debouncedSendPointsUpdate();
  }, [debouncedSendPointsUpdate]);

  // Monitor for inactivity and send points if necessary
  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastClickTime || new Date().getTime() - lastClickTime.getTime() >= 2000) {
        debouncedSendPointsUpdate();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastClickTime, debouncedSendPointsUpdate]);

  return {
    value: currentValue,
    available: availableClicks,
    canBeClicked: useUnit($available.map((state) => (state ?? 0) >= CLICK_STEP)),
    isMultiError: useUnit($isMultiAccount),
    onClick,
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
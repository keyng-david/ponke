import { useState, useEffect, useCallback, useRef } from "react";
import { createEvent, createStore, sample } from "effector";
import { useUnit } from "effector-react";
import { $sessionId } from "@/shared/model/session";
import { debounce } from "lodash";

// Constants
export const CLICK_STEP = 1;

// Events
export const valueInited = createEvent<number>();
export const availableInited = createEvent<number>();
export const clicked = createEvent<{
  score: number;
  click_score: number;
  available_clicks: number;
}>();
export const availableUpdated = createEvent<number>();
export const errorUpdated = createEvent<boolean>();

// Stores
export const $isMultiAccount = createStore(false);
export const $value = createStore<number | null>(null, { skipVoid: false })
  .on(valueInited, (_, score) => {
    console.log("Effector Store Update - $value:", score);
    return score;
  });

export const $available = createStore<number | null>(null, { skipVoid: false })
  .on(availableInited, (_, availableClicks) => {
    console.log("Effector Store Update - $available:", availableClicks);
    return availableClicks;
  });

// Derived store
export const $canBeClicked = $available.map((state) => (state ?? 0) >= CLICK_STEP);

// Effector samples
sample({
  clock: availableUpdated,
  target: $available,
});

sample({
  clock: clicked,
  fn: ({ score }) => score,
  target: $value,
});

sample({
  clock: clicked,
  fn: ({ available_clicks }) => available_clicks,
  target: $available,
});

sample({
  clock: valueInited,
  target: $value,
});

sample({
  clock: availableInited,
  target: $available,
});

sample({
  clock: errorUpdated,
  target: $isMultiAccount,
});

// Hooks
export const useCanBeClicked = () => useUnit($canBeClicked);

export const useClicker = () => {
  const [clickBuffer, setClickBuffer] = useState(0); // Total click score buffer
  const sessionId = useUnit($sessionId);
  const [lastClickTime, setLastClickTime] = useState<Date | null>(null);

  const currentValue = useUnit($value) ?? 0;
  const availableClicksRef = useRef<number | null>(null);
  const availableClicks = useUnit($available);
  availableClicksRef.current = availableClicks;

  const canBeClicked = useUnit($canBeClicked);
  const isMultiError = useUnit($isMultiAccount);

  // Updated function: remove availableClicks from backend request
  const sendPointsUpdate = useCallback(
    async (score: number) => {
      if (!sessionId) {
        console.error("No session ID available");
        return;
      }

      try {
        await fetch("/api/game/updatePoints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, click_score: score }),
        });
      } catch (error) {
        console.error("Error updating points:", error);
      }
    },
    [sessionId]
  );

  const debouncedSendPointsUpdate = useCallback(
    debounce(async (score: number) => {
      await sendPointsUpdate(score);
      setClickBuffer(0);
    }, 2000),
    [sendPointsUpdate]
  );

  const onClick = useCallback(() => {
    setClickBuffer((prev) => prev + CLICK_STEP);
    setLastClickTime(new Date());

    // Optimistically update local state
    valueInited(currentValue + CLICK_STEP);

    // Trigger batched backend update
    debouncedSendPointsUpdate(currentValue + CLICK_STEP);
  }, [currentValue, debouncedSendPointsUpdate]);

  // Refill mechanism managed locally
  useEffect(() => {
    const refillInterval = setInterval(() => {
      if (availableClicksRef.current !== null && availableClicksRef.current < 1000) {
        availableInited((availableClicksRef.current || 0) + 1);
      }
    }, 10000);

    return () => clearInterval(refillInterval);
  }, []);

  useEffect(() => {
    if (!sessionId) {
      console.error("Session ID is not set");
      return;
    }

    const interval = setInterval(() => {
      if (clickBuffer > 0 && (!lastClickTime || new Date().getTime() - lastClickTime.getTime() >= 2000)) {
        debouncedSendPointsUpdate(clickBuffer);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [clickBuffer, sessionId, lastClickTime, debouncedSendPointsUpdate]);

  return {
    value: currentValue,
    available: availableClicks,
    canBeClicked,
    isMultiError,
    onClick,
  };
};

export const clickerModel = {
  availableUpdated,
  valueInited,
  availableInited,
  clicked,
  errorUpdated,
  useCanBeClicked,
  useClicker,
  $value, 
  $available,
};
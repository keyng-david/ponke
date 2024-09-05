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
export const clicked = createEvent<{ score: number; available_clicks: number }>(); // Reintroduced `clicked` event

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

// Hooks
export const useCanBeClicked = () => useUnit($available.map((state) => (state ?? 0) >= CLICK_STEP));

export const useClicker = () => {
  const sessionId = useUnit($sessionId);
  const availableClicks = useUnit($available);
  const currentValue = useUnit($value) ?? 0;
  const [lastActivityTime, setLastActivityTime] = useState<number | null>(null);
  const [isRefilling, setIsRefilling] = useState(false);

  // WebSocket or server-side communication function
  const sendMessage = useCallback((type: string, data: any) => {
    // Your WebSocket or server communication logic here
  }, []);

  const onClick = useCallback(() => {
    if (availableClicks && availableClicks >= CLICK_STEP) {
      // Example data; replace with actual click handling logic
      const newScore = currentValue + 1; // Calculate new score
      const newAvailableClicks = availableClicks - CLICK_STEP; // Deduct clicks
      
      // Trigger the `clicked` event with new values
      clicked({ score: newScore, available_clicks: newAvailableClicks });

      // Send message to server or perform any side-effects
      sendMessage('click', { sessionId, newScore, newAvailableClicks });
    }
  }, [availableClicks, currentValue, sessionId, sendMessage]);

  useEffect(() => {
    // Your refilling logic if needed
  }, [isRefilling]);

  return {
    value: currentValue,
    available: availableClicks ?? 0,
    canBeClicked: useCanBeClicked(),
    isMultiError: useUnit($isMultiAccount),
    onClick,
  };
};

export const clickerModel = {
  valueInited,
  availableInited,
  availableUpdated,
  errorUpdated,
  clicked,
  useCanBeClicked,
  useClicker,
  $value, 
  $available,
};
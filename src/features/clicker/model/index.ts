import { useState, useEffect, useCallback, useRef } from "react";
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
export const clicked = createEvent<{ score: number; available_clicks: number }>();

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
  const [clickBuffer, setClickBuffer] = useState(0); // Total click score buffer
  const [totalClicks, setTotalClicks] = useState(0); // Count of total clicks
  const [lastClickTime, setLastClickTime] = useState<Date | null>(null);

  // Use a ref to store the latest availableClicks value
  const availableClicksRef = useRef<number | null>(null);
  availableClicksRef.current = availableClicks;

  // Function to update points on the server
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

        // No need to update local state here since WebSocket handles it
      } catch (error) {
        console.error("Error updating points:", error);
      }
    },
    [sessionId]
  );

  const debouncedSendPointsUpdate = useCallback(
    debounce(async (totalScore: number, totalAvailableClicks: number) => {
      await sendPointsUpdate(totalScore, totalAvailableClicks);
      setClickBuffer(0);
      setTotalClicks(0);
    }, 2000),
    [sendPointsUpdate]
  );

  const onClick = useCallback(() => {
    if (availableClicks && availableClicks >= CLICK_STEP) {
      setClickBuffer((prev) => prev + CLICK_STEP);
      setTotalClicks((prev) => prev + 1);
      setLastClickTime(new Date());

      // Update the local state optimistically
      const newAvailable = (availableClicksRef.current || 0) - CLICK_STEP;

      // Update with the incremented value
      valueInited(currentValue + CLICK_STEP);
      availableInited(newAvailable);

      // Debounce sending updates to the backend
      debouncedSendPointsUpdate(currentValue + CLICK_STEP, newAvailable);
    }
  }, [availableClicks, currentValue, debouncedSendPointsUpdate]);

  // Auto refill available clicks on inactivity
  useEffect(() => {
    const refillInterval = setInterval(() => {
      if (availableClicksRef.current !== null && availableClicksRef.current < MAX_AVAILABLE) {
        availableInited((availableClicksRef.current || 0) + 1);
      }
    }, 500); // Refills slowly over time

    return () => clearInterval(refillInterval);
  }, []);

  useEffect(() => {
    if (!sessionId) {
      console.error("Session ID is not set");
      return;
    }

    const interval = setInterval(() => {
      if (totalClicks > 0 && (!lastClickTime || new Date().getTime() - lastClickTime.getTime() >= 2000)) {
        debouncedSendPointsUpdate(clickBuffer, availableClicksRef.current ?? 0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [clickBuffer, sessionId, lastClickTime, debouncedSendPointsUpdate, totalClicks]);

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
  $available
};
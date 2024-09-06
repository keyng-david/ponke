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
  const [totalClicks, setTotalClicks] = useState(0); // Count of total clicks
  const sessionId = useUnit($sessionId);
  const [lastClickTime, setLastClickTime] = useState<Date | null>(null);

  // Use a ref to store the latest availableClicks value
  const availableClicksRef = useRef<number | null>(null);
  const availableClicks = useUnit($available);
  availableClicksRef.current = availableClicks;

  const currentValue = useUnit($value) ?? 0;

  const sendPointsUpdate = useCallback(
    async (score: number, availableClicks: number) => {
      if (!sessionId) {
        console.error("No session ID available");
        return;
      }

      try {
        // Send only the POST request without handling the response
        await fetch("/api/game/updatePoints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, click_score: score, available_clicks: availableClicks }),
        });

        // No response handling needed since we use real-time updates
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
    setClickBuffer((prev) => prev + CLICK_STEP);
    setTotalClicks((prev) => prev + 1);
    setLastClickTime(new Date());

    // Update the local state optimistically
    const newAvailable = (availableClicksRef.current || 0) - CLICK_STEP;

    // Log the current and new state before sending the backend request
    console.log("Current Value:", currentValue + CLICK_STEP);
    console.log("New Available Clicks:", newAvailable);

    // Update with the incremented value
    valueInited(currentValue + CLICK_STEP);
    availableInited(newAvailable);

    // Log before calling the debounced function
    console.log("Sending Points Update - Score:", currentValue + CLICK_STEP, "Available Clicks:", newAvailable);

    debouncedSendPointsUpdate(currentValue + CLICK_STEP, newAvailable);
  }, [currentValue, debouncedSendPointsUpdate]);

  // Auto refill available clicks on inactivity
  useEffect(() => {
    const refillInterval = setInterval(() => {
      if (availableClicksRef.current !== null && availableClicksRef.current < 1000) {
        availableInited((availableClicksRef.current || 0) + 1);
      }
    }, 10000); // Refills slowly over time

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
    available: availableClicks,
    canBeClicked: useUnit($canBeClicked),
    isMultiError: useUnit($isMultiAccount),
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
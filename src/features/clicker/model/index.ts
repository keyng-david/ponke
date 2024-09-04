import { useState, useEffect, useCallback } from "react";
import { createEvent, createStore, sample } from "effector";
import { useUnit } from "effector-react";
import { $sessionId } from "@/shared/model/session";
import { debounce } from "lodash"; // Import lodash debounce

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
  .on(valueInited, (_, score) => score);

export const $available = createStore<number | null>(null, { skipVoid: false })
  .on(availableInited, (_, availableClicks) => availableClicks);

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
  const [clickBuffer, setClickBuffer] = useState(0);
  const sessionId = useUnit($sessionId);
  const [lastClickTime, setLastClickTime] = useState<Date | null>(null);

  // Function to send points update
  const sendPointsUpdate = useCallback(
    async (score: number) => {
      if (!sessionId) {
        console.error("No session ID available");
        return;
      }

      try {
        const response = await fetch("/api/game/updatePoints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, click_score: score }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Failed to update points:", data.error || "Unknown error");
          return;
        }

        // Update the state with the returned data
        valueInited(data.currentScore);
        availableInited(data.available_clicks);
      } catch (error) {
        console.error("Error updating points:", error);
      }
    },
    [sessionId]
  );

  // Debounced function to update points after inactivity
  const debouncedSendPointsUpdate = useCallback(
    debounce(async (score: number) => {
      await sendPointsUpdate(score);
      setClickBuffer(0); // Reset buffer after sending
    }, 2000),
    [sendPointsUpdate]
  );

  useEffect(() => {
    if (!sessionId) {
      console.error("Session ID is not set");
      return;
    }

    const interval = setInterval(() => {
      if (clickBuffer > 0 && (!lastClickTime || new Date().getTime() - lastClickTime.getTime() >= 2000)) {
        // Call debounced update if the user has been inactive for 2 seconds
        debouncedSendPointsUpdate(clickBuffer);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [clickBuffer, sessionId, lastClickTime, debouncedSendPointsUpdate]);

  function onClick() {
    setClickBuffer((prev) => {
      const newBuffer = prev + CLICK_STEP;
      setLastClickTime(new Date());
      debouncedSendPointsUpdate.cancel(); // Cancel any ongoing debounce to reset the timer
      return newBuffer;
    });
  }

  return {
    value: useUnit($value),
    available: useUnit($available),
    canBeClicked: useUnit($canBeClicked),
    isMultiError: useUnit($isMultiAccount),
    onClick,
  };
};

// Export model object with all events, stores, and hooks
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
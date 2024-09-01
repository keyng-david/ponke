import { useState, useEffect } from "react";
import { createEvent, createStore, sample } from "effector";
import { useUnit } from "effector-react";
import { $sessionId } from "@/shared/model/session";

export const MAX_AVAILABLE = 500;
export const CLICK_STEP = 1;

const valueInited = createEvent<number>();
const availableInited = createEvent<number>();
const clicked = createEvent<{
  score: number;
  click_score: number;
  available_clicks: number;
}>();
const availableUpdated = createEvent<number>();
const errorUpdated = createEvent<boolean>();

const $isMultiAccount = createStore(false);
const $value = createStore(0);
const $available = createStore(MAX_AVAILABLE);

const $canBeClicked = $available.map((state) => state >= CLICK_STEP);

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

const useCanBeClicked = () => useUnit($canBeClicked);

const useClicker = () => {
  const [clickBuffer, setClickBuffer] = useState(0);
  const sessionId = useUnit($sessionId);

  async function sendPointsUpdate(score: number) {
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

      valueInited(data.currentScore);
      availableInited(MAX_AVAILABLE - data.currentScore);
    } catch (error) {
      console.error("Error updating points:", error);
    }
  }

  async function syncWithBackend() {
  if (!sessionId) {
    console.error("No session ID available for syncing");
    return;
  }

  try {
    // Use the same endpoint as updatePoints since it's handled by the same code
    const response = await fetch("/api/game/updatePoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // No click_score required for this call, as we're just querying the score
      body: JSON.stringify({ session_id: sessionId, click_score: 0 }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to sync with backend:", data.error || "Unknown error");
      return;
    }

    // Update stores with the current score and available clicks from the response
    valueInited(data.currentScore);
    availableInited(MAX_AVAILABLE - data.currentScore);
  } catch (error) {
    console.error("Error syncing with backend:", error);
  }
}

  function onClick() {
    setClickBuffer((prev) => {
      const newBuffer = prev + CLICK_STEP;
      if (newBuffer >= 10) {
        sendPointsUpdate(newBuffer);
        return 0;
      }
      return newBuffer;
    });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (clickBuffer > 0) {
        sendPointsUpdate(clickBuffer);
        setClickBuffer(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [clickBuffer]);

  return {
    value: useUnit($value),
    available: useUnit($available),
    canBeClicked: useUnit($canBeClicked),
    isMultiError: useUnit($isMultiAccount),
    onClick,
    syncWithBackend, // Expose syncWithBackend here
  };
};

// Export the hook and necessary functions
export const clickerModel = {
  valueInited,
  availableInited,
  availableUpdated,
  clicked,
  errorUpdated,
  useCanBeClicked,
  useClicker,
};
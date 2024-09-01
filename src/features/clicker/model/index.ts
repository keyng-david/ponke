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

const $value = createStore(0);
const $available = createStore(MAX_AVAILABLE);

const $canBeClicked = $available.map((state) => state >= CLICK_STEP);

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

const useCanBeClicked = () => useUnit($canBeClicked);

const useClicker = () => {
  const [clickBuffer, setClickBuffer] = useState(0);
  const sessionId = useUnit($sessionId);
  const [isSyncing, setIsSyncing] = useState(false);

  async function initializeScore() {
    if (!sessionId) {
      console.error("No session ID available for initialization");
      return;
    }

    try {
      setIsSyncing(true);
      const response = await fetch("/api/game/initScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to initialize score:", data.error || "Unknown error");
        return;
      }

      valueInited(data.currentScore);
      availableInited(MAX_AVAILABLE - data.currentScore);
      setIsSyncing(false);
    } catch (error) {
      console.error("Error initializing score:", error);
      setIsSyncing(false);
    }
  }

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

  function onClick() {
    setClickBuffer((prev) => {
      const newBuffer = prev + CLICK_STEP;
      clicked({
        score: $value.getState() + CLICK_STEP,
        click_score: newBuffer,
        available_clicks: $available.getState() - CLICK_STEP,
      }); // Update UI immediately

      if (newBuffer >= 10) {
        sendPointsUpdate(newBuffer);
        return 0;
      }
      return newBuffer;
    });
  }

  useEffect(() => {
    if (!sessionId) {
      console.error("Session ID is not set");
      return;
    }

    initializeScore(); // Initial sync only once

    const interval = setInterval(() => {
      if (clickBuffer > 0) {
        sendPointsUpdate(clickBuffer);
        setClickBuffer(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [clickBuffer, sessionId]);

  return {
    value: useUnit($value),
    available: useUnit($available),
    canBeClicked: useUnit($canBeClicked),
    isSyncing,
    onClick,
  };
};

// Export the hook and necessary functions
export const clickerModel = {
  valueInited,
  availableInited,
  clicked,
  useCanBeClicked,
  useClicker,
};
import { useState, useEffect } from "react";
import { createEvent, createStore, sample, createEffect } from "effector";
import { useUnit } from "effector-react";
import { useSocket } from "@/app/socketProvider";
import { $sessionId } from "@/shared/model/session";
import axios from "axios";

// Constants
export const MAX_AVAILABLE = 500;
export const CLICK_STEP = 1;

// Events
const valueInited = createEvent<number>();
const availableInited = createEvent<number>();
const clicked = createEvent<{ score: number; click_score: number }>();
const errorUpdated = createEvent<string>();

// Create an effect to sync with backend
const syncWithBackendFx = createEffect(async () => {
  const sessionId = $sessionId.getState(); // Assuming this is how sessionId is stored
  if (!sessionId) return; // Handle case where sessionId is not available

  try {
    const response = await axios.post("/api/updatePoints", {
      session_id: sessionId,
    });

    if (response.data.currentScore) {
      return {
        currentScore: response.data.currentScore,
        availableClicks: response.data.availableClicks || MAX_AVAILABLE,
      };
    } else {
      throw new Error("Failed to sync with backend");
    }
  } catch (error) {
    console.error("Error syncing with backend:", error);
    throw error;
  }
});

// Stores
const $value = createStore(0).on(valueInited, (_, value) => value);
const $available = createStore(MAX_AVAILABLE).on(
  availableInited,
  (_, available) => available
);

// Handle successful sync and update the stores
sample({
  clock: syncWithBackendFx.doneData,
  fn: (data) => data.currentScore,
  target: valueInited,
});

sample({
  clock: syncWithBackendFx.doneData,
  fn: (data) => data.availableClicks,
  target: availableInited,
});

// Handle sync errors
sample({
  clock: syncWithBackendFx.failData,
  target: errorUpdated,
});

// Custom Hooks
const useCanBeClicked = () => {
  const available = useUnit($available);
  return available > 0;
};

const useClicker = () => {
  const value = useUnit($value);
  const available = useUnit($available);
  const canBeClicked = useCanBeClicked();

  const onClick = () => {
    if (canBeClicked) {
      clicked({ score: value + CLICK_STEP, click_score: CLICK_STEP });
    }
  };

  return {
    value,
    available,
    canBeClicked,
    onClick,
  };
};

// Model export
export const clickerModel = {
  valueInited,
  availableInited,
  clicked,
  errorUpdated,
  useCanBeClicked,
  useClicker,
  syncWithBackend: syncWithBackendFx, // Export syncWithBackend method
};

export { $value, $available };
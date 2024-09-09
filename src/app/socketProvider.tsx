import { CLICK_STEP, clickerModel } from "@/features/clicker/model";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useStore } from "effector-react";
import { $sessionId } from "@/shared/model/session";

export const SocketContext = createContext<{
  accumulatePoints: (points: number) => void;
  debounceSendPoints: () => void;
}>({
  accumulatePoints: () => {},
  debounceSendPoints: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = React.memo<React.PropsWithChildren>(({ children }) => {
  const sessionId = useStore($sessionId);
  const [earnedPoint, setEarnedPoint] = useState(0);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Establish SSE connection to listen for updates
    const eventSource = new EventSource("/api/game/updatePoints");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data) {
        // Trigger events to update state in Effector
        clickerModel.valueInited(data.score);  // Use the valueInited event to update the score
        clickerModel.availableInited(data.available_clicks);  // Use the availableInited event to update available clicks
        // Optionally reset earned points if necessary based on update logic
      }
    };

    return () => {
      eventSource.close(); // Clean up when component unmounts
    };
  }, [sessionId]);

  // Function to accumulate points locally
  const accumulatePoints = (points: number) => {
    setEarnedPoint((prev) => prev + points + CLICK_STEP); // Ensure CLICK_STEP is always added
  };

  // Function to send points to the backend
  const sendPointUpdate = async () => {
  if (earnedPoint > 0) {
    try {
      // Store the current earnedPoint value
      const currentEarnedPoint = earnedPoint;

      // Immediately clear earned points before sending the request
      setEarnedPoint(0);

      const response = await fetch("/api/game/updatePoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          earnedPoint: currentEarnedPoint, // Use stored earnedPoint value
        }),
      });

      const result = await response.json();
      if (!result.success) {
        console.error("Error updating points:", result.message || "Unknown error");
        // Optionally, handle failure case (e.g., retry logic or showing an error message)
      }
    } catch (error) {
      console.error("Error updating points:", error);
      // Retry logic or error handling can be implemented here
    }
  }
};

  const debounceSendPoints = () => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    const newTimeout = setTimeout(async () => {
      await sendPointUpdate();
    }, 500);
    setDebounceTimeout(newTimeout);
  };

  return (
    <SocketContext.Provider value={{ accumulatePoints, debounceSendPoints }}>
      {children}
    </SocketContext.Provider>
  );
});
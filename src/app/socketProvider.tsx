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
        // Corrected method names from 'setState' to 'set'
        clickerModel.$value.set(data.score);
        clickerModel.$available.set(data.available_clicks);
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
        const response = await fetch("/api/game/updatePoints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            earnedPoint, // Use earnedPoint here
          }),
        });

        const result = await response.json();
        if (result.success) {
          // Clear earned points only if update was successful
          setEarnedPoint(0);
        }
      } catch (error) {
        console.error("Error updating points:", error);
        // Retry logic can be implemented here
      }
    }
  };

  const debounceSendPoints = () => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    const newTimeout = setTimeout(async () => {
      await sendPointUpdate(); // Ensure async-await is used for proper handling
    }, 3000);
    setDebounceTimeout(newTimeout);
  };

  return (
    <SocketContext.Provider value={{ accumulatePoints, debounceSendPoints }}>
      {children}
    </SocketContext.Provider>
  );
});
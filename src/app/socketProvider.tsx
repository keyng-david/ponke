import { CLICK_STEP, clickerModel } from "@/features/clicker/model";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useStore } from "effector-react";
import { $sessionId } from "@/shared/model/session";
import { subscribeToUpdates } from "@/api/game/websocketServer";

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

  // Set up subscription for score updates when the component mounts
  useEffect(() => {
    if (sessionId) {
      const unsubscribe = subscribeToUpdates(sessionId);

      // Clean up the subscription when the component unmounts
      return () => {
        unsubscribe();
      };
    }
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

        if (!response.ok) {
          const errorText = await response.text(); // Read error as text if not JSON
          throw new Error(`Failed to update points: ${errorText}`);
        }

        const result = await response.json();
        if (result.success) {
          // Clear earned points only if update was successful
          setEarnedPoint(0);
        }
      } catch (error) {
        console.error("Error updating points:", error);
        // Retry logic or user feedback can be implemented here
      }
    }
  };

  // Debounce mechanism to trigger batch updates
  const debounceSendPoints = () => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    const newTimeout = setTimeout(() => {
      sendPointUpdate();
    }, 3000); // 3 seconds debounce
    setDebounceTimeout(newTimeout);
  };

  return (
    <SocketContext.Provider value={{ accumulatePoints, debounceSendPoints }}>
      {children}
    </SocketContext.Provider>
  );
});
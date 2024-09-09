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

  // Function to subscribe to updates using HTTP request
  const subscribeToUpdates = async () => {
    try {
      await fetch("/api/game/websocketServer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      console.log('Subscribed to updates successfully');
    } catch (error) {
      console.error('Error subscribing to updates:', error);
    }
  };

  useEffect(() => {
    // Subscribe to updates when the component mounts
    subscribeToUpdates();

    // Cleanup function to unsubscribe from updates if needed
    return () => {
      // Optionally implement an endpoint to remove the subscription
    };
  }, [sessionId]);

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
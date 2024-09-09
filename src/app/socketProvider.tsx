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

  // Function to subscribe to updates using SSE
  const subscribeToUpdates = () => {
    const eventSource = new EventSource(`/api/game/websocketServer?session_id=${sessionId}`);

    eventSource.onmessage = (event) => {
      const { score, available_clicks } = JSON.parse(event.data);
      clickerModel.$value.setState(score);
      clickerModel.$available.setState(available_clicks);
      console.log('Points updated and confirmed successfully');
    };

    eventSource.onerror = (error) => {
      console.error("Error with SSE connection:", error);
      eventSource.close(); // Close connection on error
    };

    return () => {
      eventSource.close(); // Clean up on component unmount
    };
  };

  useEffect(() => {
    // Subscribe to updates when the component mounts
    const cleanup = subscribeToUpdates();

    // Cleanup function to unsubscribe from updates
    return cleanup;
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
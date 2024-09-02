import { useStore } from "effector-react";
import { useEffect, useState } from "react";
import { $value, $available, clickerModel } from "@/features/clicker/model";

// Custom hook for game data management
export const useGameData = () => {
    // Use Effector's useStore to retrieve reactive state
    const initialValue: number = useStore($value);  // Directly using $value
    const initialAvailable: number = useStore($available);  // Directly using $available

    // Local state in the component
    const [score, setScore] = useState<number>(initialValue);
    const [availableClicks, setAvailableClicks] = useState<number>(initialAvailable);

    // Sync Effector store updates with local state
    useEffect(() => {
        const unsubscribeValue = $value.watch(setScore);
        const unsubscribeAvailable = $available.watch(setAvailableClicks);

        return () => {
            unsubscribeValue();
            unsubscribeAvailable();
        };
    }, []);

    // Update both local and global state
    const updateScoreAndAvailable = (newScore: number, newAvailable: number) => {
        setScore(newScore);
        setAvailableClicks(newAvailable);
        clickerModel.valueInited(newScore);
        clickerModel.availableInited(newAvailable);
    };

    return { score, availableClicks, updateScoreAndAvailable };
};
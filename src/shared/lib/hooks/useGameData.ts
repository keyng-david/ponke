import { useStore } from "effector-react";
import { useEffect, useState } from "react";
import { clickerModel } from "@/features/clicker/model";

// Custom hook for game data management
export const useGameData = () => {
    // Use Effector's useStore to retrieve reactive state
    const initialValue: number = useStore(clickerModel.$value);  // Assuming $value is a number
    const initialAvailable: number = useStore(clickerModel.$available);  // Assuming $available is a number

    // Local state in the component
    const [score, setScore] = useState<number>(initialValue);
    const [availableClicks, setAvailableClicks] = useState<number>(initialAvailable);

    // Sync Effector store updates with local state
    useEffect(() => {
        const unsubscribeValue = clickerModel.$value.watch(setScore);
        const unsubscribeAvailable = clickerModel.$available.watch(setAvailableClicks);

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
import { useStore } from "effector-react";
import { useEffect, useState } from "react";
import { clickerModel } from "@/features/clicker/model";

// Custom hook for game data management
const useGameData = () => {
    // Use Effector's useStore to retrieve reactive state
    const initialValue = useStore(clickerModel.$value);
    const initialAvailable = useStore(clickerModel.$available);

    // Local state in the component
    const [score, setScore] = useState(initialValue);
    const [availableClicks, setAvailableClicks] = useState(initialAvailable);

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
        clickerModel.valueInited(newScore); // Update Effector store
        clickerModel.availableInited(newAvailable); // Update Effector store
    };

    return {
        score,
        availableClicks,
        updateScoreAndAvailable,
    };
};
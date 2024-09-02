import { useUnit } from "effector-react";
import { useEffect, useState } from "react";
import { $value, $available, clickerModel } from "@/features/clicker/model";
import { useAuth } from "@/shared/lib/hooks/useAuth"; // Import useAuth

export const useGameData = () => {
    // Retrieve user game data from useAuth
    const { userData } = useAuth(); // Assuming userData contains initial score and availableClicks

    // Use Effector's useStore to retrieve reactive state
    const initialValue: number = useUnit($value);
const initialAvailable: number = useUnit($available);

    // Initialize local state with useAuth data
    const [score, setScore] = useState<number>(userData ? userData.initialScore : initialValue);
    const [availableClicks, setAvailableClicks] = useState<number>(userData ? userData.initialAvailableClicks : initialAvailable);

    useEffect(() => {
        if (userData) {
            // Update Effector stores based on initial userData
            clickerModel.valueInited(userData.initialScore);
            clickerModel.availableInited(userData.initialAvailableClicks);
        }

        // Sync Effector store updates with local state
        const unsubscribeValue = $value.watch(setScore);
        const unsubscribeAvailable = $available.watch(setAvailableClicks);

        return () => {
            unsubscribeValue();
            unsubscribeAvailable();
        };
    }, [userData]); // Depend on userData to re-run the effect when it changes

    const updateScoreAndAvailable = (newScore: number, newAvailable: number) => {
        setScore(newScore);
        setAvailableClicks(newAvailable);
        clickerModel.valueInited(newScore);
        clickerModel.availableInited(newAvailable);
    };

    return { score, availableClicks, updateScoreAndAvailable };
};
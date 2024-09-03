import { useUnit } from "effector-react";
import { useEffect, useState } from "react";
import { clickerModel } from "@/features/clicker/model";
import { useAuth } from "@/features/auth/useAuth";

export const useGameData = () => {
    const { initialScore, initialAvailableClicks } = useAuth();

    const { $value, $available } = clickerModel;

    // Initialize local state with useAuth data
    const [score, setScore] = useState<number>(initialScore);
    const [availableClicks, setAvailableClicks] = useState<number>(initialAvailableClicks);

    useEffect(() => {
        // Sync Effector store updates with local state
        const unsubscribeValue = $value.watch(setScore);
        const unsubscribeAvailable = $available.watch(setAvailableClicks);

        return () => {
            unsubscribeValue();
            unsubscribeAvailable();
        };
    }, []); // Removed userData dependency

    const updateScoreAndAvailable = (newScore: number, newAvailable: number) => {
        setScore(newScore);
        setAvailableClicks(newAvailable);
        clickerModel.valueInited(newScore);
        clickerModel.availableInited(newAvailable);
    };

    return { score, availableClicks, updateScoreAndAvailable };
};
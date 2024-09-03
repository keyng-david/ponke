import { useUnit } from "effector-react";
import { useEffect, useState } from "react";
import { clickerModel } from "@/features/clicker/model";
import { useAuth } from "@/features/auth/useAuth";

export const useGameData = () => {
    const { initialScore, initialAvailableClicks } = useAuth();

    const { $value, $available } = clickerModel;

    // Initialize local state with useAuth data and provide a default value if null
    const [score, setScore] = useState<number>(initialScore ?? 0);
    const [availableClicks, setAvailableClicks] = useState<number>(initialAvailableClicks ?? 0);

    useEffect(() => {
        // Sync Effector store updates with local state
        const unsubscribeValue = $value.watch((value) => {
            // Ensure value is a number before setting state
            if (value !== null) {
                setScore(value);
            }
        });
        const unsubscribeAvailable = $available.watch((available) => {
            // Ensure available is a number before setting state
            if (available !== null) {
                setAvailableClicks(available);
            }
        });

        return () => {
            unsubscribeValue();
            unsubscribeAvailable();
        };
    }, [$value, $available]); // Added dependencies to useEffect

    const updateScoreAndAvailable = (newScore: number, newAvailable: number) => {
        setScore(newScore);
        setAvailableClicks(newAvailable);
        clickerModel.valueInited(newScore);
        clickerModel.availableInited(newAvailable);
    };

    return { score, availableClicks, updateScoreAndAvailable };
};
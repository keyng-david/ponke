import { useUnit } from "effector-react";
import { useEffect, useState } from "react";
import { clickerModel } from "@/features/clicker/model";
import { useAuth } from "@/features/auth/useAuth";

export const useGameData = () => {
    const { initialScore, initialAvailableClicks } = useAuth();
    const { $value, $available } = clickerModel;

    // Initialize local state with Effector store values
    const [score, setScore] = useState<number>(initialScore ?? 0);
    const [availableClicks, setAvailableClicks] = useState<number>(initialAvailableClicks ?? 0);

    useEffect(() => {
        const unsubscribeValue = $value.watch((value) => {
            if (value !== null) setScore(value);
        });
        const unsubscribeAvailable = $available.watch((available) => {
            if (available !== null) setAvailableClicks(available);
        });

        return () => {
            unsubscribeValue();
            unsubscribeAvailable();
        };
    }, [$value, $available]);

    const updateScoreAndAvailable = (newScore: number, newAvailable: number) => {
        clickerModel.valueInited(newScore);
        clickerModel.availableInited(newAvailable);
    };

    return { score, availableClicks, updateScoreAndAvailable };
};
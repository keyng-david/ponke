import React, { TouchEvent, useCallback, useMemo, useState, useEffect } from "react";
import progress from '@/shared/assets/images/main/progress.png';
import pointImage from '@/shared/assets/images/main/point.png';
import leftHand from '@/shared/assets/images/main/left-hand.png';
import rightHand from '@/shared/assets/images/main/right-hand.png';
import { MAX_AVAILABLE, clickerModel } from "../model";
import styles from './ClickerField.module.scss';
import { getRandomArbitrary, getRandomInt, toFormattedNumber } from "@/shared/lib/number";
import { useTelegram } from "@/shared/lib/hooks/useTelegram";

export const ClickerField = () => {
    const { value, available, canBeClicked, onClick } = clickerModel.useClicker();
    const { haptic } = useTelegram();

    const [isClickEnabled, setIsClickEnabled] = useState(true);
    const [leftClasses, setLeftClasses] = useState<string[]>([styles['hand-left']]);
    const [rightClasses, setRightClasses] = useState<string[]>([styles['hand-right']]);
    const [isLoading, setIsLoading] = useState(true); // Add a loading state
    const [syncError, setSyncError] = useState<string | null>(null); // Error state for syncing issues

    // Function to sync initial data from the backend
    const initializeData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/game/auth", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error("Failed to fetch initial data");
            }
            clickerModel.valueInited(data.score);
            clickerModel.availableInited(data.available_clicks);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            setSyncError("Failed to sync data with backend. Please try again.");
        }
    }, []);

    useEffect(() => {
        initializeData(); // Initial sync
    }, [initializeData]);

    const handleClick = useCallback(() => {
        // Real-time score update locally
        onClick();
    }, [onClick]);

    const onTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
        if (isClickEnabled) {
            for (let i = 0; i < Math.min(e.touches.length, 3); i++) {
                const { clientX, clientY } = e.touches[i];
                if (canBeClicked) {
                    handleClick(); // Call local onClick handler

                    // Create point animation
                    const point = document.createElement('img');
                    point.src = pointImage;
                    point.alt = 'point';
                    point.style.transform = `rotate(${getRandomInt(-25, 25)}deg) scale(${getRandomArbitrary(0.8, 1.2)})`;

                    const pointParent = document.createElement('div');
                    pointParent.appendChild(point);
                    pointParent.style.top = `${clientY}px`;
                    pointParent.style.left = `${clientX}px`;
                    pointParent.className = styles.point;

                    document.querySelector('#clicker')!.appendChild(pointParent);
                    haptic();
                    setTimeout(() => {
                        document.querySelector('#clicker')!.removeChild(pointParent);
                    }, 500);

                    // Handle hand animations
                    if (leftClasses.length === 1 && rightClasses.length === 1) {
                        setLeftClasses(prevState => [...prevState, styles['hand-animated']]);
                        setRightClasses(prevState => [...prevState, styles['hand-animated']]);
                        setTimeout(() => {
                            setRightClasses([styles['hand-right']]);
                            setLeftClasses([styles['hand-left']]);
                        }, 350);
                    }
                }
            }

            setIsClickEnabled(false);
            setTimeout(() => {
                setIsClickEnabled(true);
            }, 150);
        }
    }, [isClickEnabled, canBeClicked, handleClick, haptic, leftClasses, rightClasses]);

    function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
        event.preventDefault();
    }

    function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
        event.preventDefault();
    }

    const valueString = useMemo(() => toFormattedNumber(value), [value]);

    // Render loading or error states
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (syncError) {
        return <div className={styles.error}>{syncError}</div>;
    }

    return (
        <div
            id={'clicker'}
            className={styles.root}
            onTouchStart={onTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <p className={styles.value}>{valueString}</p>
            <ProgressBar value={available} />
            <div className={styles.hands}>
                <img id={'handLeft'} className={leftClasses.join(' ')} src={leftHand} alt={'left hand'} />
                <img id={'handRight'} className={rightClasses.join(' ')} src={rightHand} alt={'right hand'} />
            </div>
        </div>
    );
}

const ProgressBar = React.memo<{
    value: number
}>(({ value }) => {
    const list = useMemo(() => {
        let count = 0;
        let curr = value;

        while (curr >= 0) {
            count += 1;
            curr = curr - MAX_AVAILABLE / 12;
        }

        return count;
    }, [value]);
  

    return (
        <div className={styles['progress-bar']}>
            <span className={styles.available}>{value}</span>
            <div className={styles.row}>
                {Array(list).fill(1).map((_, index) => (
                    <img key={index} className={styles['item']} src={progress} alt={'progress'} />
                ))}
            </div>
        </div>
    );
});
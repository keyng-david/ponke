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
    const { value, available, canBeClicked, onClick, syncWithBackend } = clickerModel.useClicker();
    const { haptic } = useTelegram();

    const [isClickEnabled, setIsClickEnabled] = useState(true);
    const [leftClasses, setLeftClasses] = useState<string[]>([styles['hand-left']]);
    const [rightClasses, setRightClasses] = useState<string[]>([styles['hand-right']]);
    const [isLoading, setIsLoading] = useState(true); // Add a loading state

    useEffect(() => {
        syncWithBackend().then(() => {
            setIsLoading(false); // Set loading to false after syncing
        });

        const syncInterval = setInterval(() => {
            syncWithBackend();  // Periodic syncing
        }, 5000);

        return () => clearInterval(syncInterval);
    }, [syncWithBackend]);

    if (isLoading) {
        return <div>Loading...</div>; // Display loading indicator
    }

    // Ensure onTouchStart function is not conditional
    const onTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
        if (isClickEnabled) {
            for (let i = 0; i < Math.min(e.touches.length, 3); i++) {
                const { clientX, clientY } = e.touches[i];
                if (canBeClicked) {
                    onClick();  // Call onClick only if clicking is allowed

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
    }, [isClickEnabled, canBeClicked, onClick, haptic, leftClasses.length, rightClasses.length]);

    function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
        event.preventDefault();
    }

    function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
        event.preventDefault();
    }

    const valueString = useMemo(() => toFormattedNumber(value), [value]);

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
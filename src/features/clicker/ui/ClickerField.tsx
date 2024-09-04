import React, { TouchEvent, useCallback, useMemo, useState } from "react";
import progress from '@/shared/assets/images/main/progress.png';
import pointImage from '@/shared/assets/images/main/point.png';
import leftHand from '@/shared/assets/images/main/left-hand.png';
import rightHand from '@/shared/assets/images/main/right-hand.png';
import { clickerModel } from "../model";
import styles from './ClickerField.module.scss';
import { getRandomArbitrary, getRandomInt, toFormattedNumber } from "@/shared/lib/number";
import { useTelegram } from "@/shared/lib/hooks/useTelegram";
import { useUnit } from "effector-react";
import { useGameData } from "@/shared/lib/hooks/useGameData";

export const ClickerField = () => {
  const score = useUnit(clickerModel.$value) ?? 0;
  const availableClicks = Number(useUnit(clickerModel.$available)) || 0;
  const canBeClicked = clickerModel.useCanBeClicked();
  const { haptic } = useTelegram();
  const { updateScoreAndAvailable } = useGameData();

  const [leftClasses, setLeftClasses] = useState([styles['hand-left']]);
  const [rightClasses, setRightClasses] = useState([styles['hand-right']]);
  const [isClickEnabled, setIsClickEnabled] = useState(true);

  const { onClick } = clickerModel.useClicker();

  const handleClick = useCallback(() => {
    if (canBeClicked && availableClicks > 0) {
      const newScore = score + 1;
      const newAvailable = availableClicks - 1;

      // Update local state and Effector stores
      updateScoreAndAvailable(newScore, newAvailable);

      // Directly call backend update without debounce in UI
      onClick();

      console.log("Clicked: New Score:", newScore, "New Available:", newAvailable);
    } else {
      console.log("Click ignored: canBeClicked:", canBeClicked, "availableClicks:", availableClicks);
    }
  }, [canBeClicked, availableClicks, score, updateScoreAndAvailable, onClick]);

  const onTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (isClickEnabled) {
      for (let i = 0; i < Math.min(e.touches.length, 3); i++) {
        const { clientX, clientY } = e.touches[i];
        handleClick();

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

      setIsClickEnabled(false);
      setTimeout(() => {
        setIsClickEnabled(true);
      }, 150);
    }
  }, [isClickEnabled, handleClick, haptic, leftClasses, rightClasses]);

  // Remove handleTouchMove and handleTouchEnd or define them if needed
  const valueString = useMemo(() => {
    return typeof score === 'number' ? toFormattedNumber(score) : "0";
  }, [score]);

  return (
        <div
            id={'clicker'}
            className={styles.root}
            onTouchStart={onTouchStart}
            // Removed handleTouchMove and handleTouchEnd to fix the error
        >
            <p className={styles.value}>{valueString}</p>
            <p className={styles.value}>{valueString}</p>
            <ProgressBar value={availableClicks} maxAvailable={100} />
            <div className={styles.hands}>
                <img id={'handLeft'} className={leftClasses.join(' ')} src={leftHand} alt={'left hand'}/>
                <img id={'handRight'} className={rightClasses.join(' ')} src={rightHand} alt={'right hand'}/>
            </div>
        </div>
    )
}

const ProgressBar = React.memo<{
  value: number,
  maxAvailable: number
}>(({ value, maxAvailable }) => {
  const list = useMemo(() => {
    let count = 0;
    let curr = value;

    while (curr > 0) {
      count += 1;
      curr -= maxAvailable / 12;
    }

    return count;
  }, [value, maxAvailable]);

  return (
    <div className={styles['progress-bar']}>
      <span className={styles.available}>{value}</span>
      <div className={styles.row}>
        {Array.from({ length: list }).map((_, index) => (
          <img key={index} className={styles['item']} src={progress} alt={'progress'} />
        ))}
      </div>
    </div>
  );
});
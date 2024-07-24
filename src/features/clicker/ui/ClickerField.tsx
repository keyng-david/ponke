import React, {useCallback, useMemo, useState} from "react";

import progress from '@/shared/assets/images/main/progress.png'
import pointImage from '@/shared/assets/images/main/point.png'
import leftHand from '@/shared/assets/images/main/left-hand.png'
import rightHand from '@/shared/assets/images/main/right-hand.png'

import {clickerModel} from "../model";

import styles from './ClickerField.module.scss'
import {getRandomArbitrary, getRandomInt, toFormattedNumber} from "@/shared/lib/number";

export const ClickerField = () => {
    const { value, available, canBeClicked } = clickerModel.useClickerState()

    const [isAnimated, setIsAnimated] = useState(false)

    const valueString = useMemo(() => toFormattedNumber(value), [value])

    const onClick = useCallback((e: { clientX: number, clientY: number }) => {
        if (canBeClicked) {
            clickerModel.clicked()

            const point = document.createElement('img')
            point.src = pointImage
            point.alt = 'point'
            point.style.transform = `rotate(${getRandomInt(-25, 25)}deg) scale(${getRandomArbitrary(0.8, 1.2)})`

            const pointParent = document.createElement('div')
            pointParent.appendChild(point)
            pointParent.style.top = `${e.clientY}px`
            pointParent.style.left = `${e.clientX}px`
            pointParent.className = styles.point

            document.body.appendChild(pointParent)
            const timeout = setTimeout(() => {
                document.body.removeChild(pointParent)

                clearTimeout(timeout)
            }, 500)

            if (!isAnimated) {
                setIsAnimated(true)
                const timeout1 = setTimeout(() => {
                    setIsAnimated(false)
                    clearTimeout(timeout1)
                }, 300)
            }
        }
    }, [canBeClicked, isAnimated])

    return <div className={styles.root} onClick={onClick}>
        <p className={styles.value}>{valueString}</p>
        <p className={styles.value}>{valueString}</p>
        <ProgressBar value={available}/>
        <div className={styles.hands}>
            <img className={`${styles['hand-left']} ${isAnimated ? styles['hand-animated'] : undefined}`} src={leftHand} alt={'left hand'}/>
            <img className={`${styles['hand-right']} ${isAnimated ? styles['hand-animated'] : undefined}`} src={rightHand} alt={'right hand'}/>
        </div>
    </div>
}

const ProgressBar = React.memo<{
    value: number
}>(({value}) => {
    const list = useMemo(() => {
        let count = 0;
        let curr = value

        while (curr > 0) {
            count += 1
            curr = curr - 5000 / 11
        }

        return count
    }, [value])

    return (
        <div className={styles['progress-bar']}>
            <span className={styles.available}>{value}</span>
            <div className={styles.row}>
                {Array(list).fill(1).map((_, index) => (
                    <img key={index} className={styles['item']} src={progress} alt={'progress'} />
                ))}
            </div>
        </div>
    )
})
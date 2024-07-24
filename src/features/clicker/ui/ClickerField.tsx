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

    const [leftClasses, setLeftClasses] = useState<string[]>([styles['hand-left']])
    const [rightClasses, setRightClasses] = useState<string[]>([styles['hand-right']])

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

            if (leftClasses.length === 1 && rightClasses.length === 1) {
                setLeftClasses(prevState => [...prevState, styles['hand-animated']])
                setRightClasses(prevState => [...prevState, styles['hand-animated']])
                const timeout1 = setTimeout(() => {
                    setRightClasses([styles['hand-right']])
                    setLeftClasses([styles['hand-left']])

                    clearTimeout(timeout1)
                }, 300)
            }
        }
    }, [canBeClicked, leftClasses, rightClasses])

    return <div className={styles.root} onClick={onClick}>
        <p className={styles.value}>{valueString}</p>
        <p className={styles.value}>{valueString}</p>
        <ProgressBar value={available}/>
        <div className={styles.hands}>
            <img className={leftClasses.join(' ')} src={leftHand} alt={'left hand'}/>
            <img className={rightClasses.join(' ')} src={rightHand} alt={'right hand'}/>
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
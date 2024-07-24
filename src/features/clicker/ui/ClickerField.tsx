import React, {useCallback, useMemo} from "react";

import progress from '@/shared/assets/images/main/progress.png'
import pointImage from '@/shared/assets/images/main/point.png'

import {clickerModel} from "../model";

import styles from './ClickerField.module.scss'
import {getRandomArbitrary, getRandomInt} from "@/shared/lib/number";

export const ClickerField = () => {
    const { value, available, canBeClicked } = clickerModel.useClickerState()

    const valueString = useMemo(() => {
        if (String(value).length > 3) {
            return String(value).split('').reduce((prev, curr, index) => {
                if (index + 1 % 3 === 0) {
                    return prev + curr + '.'
                }

                return prev + curr
            }, '')
        }

        return `${value}`
    }, [value])

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
        }
    }, [canBeClicked])

    return <div className={styles.root} onClick={onClick}>
        <p className={styles.value}>{valueString}</p>
        <ProgressBar value={available} />
    </div>
}

const ProgressBar = React.memo<{
    value: number
}>(({ value }) => {
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
                {Array(list).fill(1).map(() => (
                    <img className={styles['item']} src={progress} alt={'progress'} />
                ))}
            </div>
        </div>
    )
})
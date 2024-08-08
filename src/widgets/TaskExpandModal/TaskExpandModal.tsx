import React, { useMemo } from 'react'

import { EarnItem, EarnItemTask } from '@/entities/earn/model/types'

import taskInfoBg from '@/shared/assets/images/earn/task_info.png'
import item0 from '@/shared/assets/images/earn/item_0.png'
import item1 from '@/shared/assets/images/earn/item_1.png'
import checked from '@/shared/assets/images/earn/checked.png'

import styles from './TaskExpandModal.module.scss'

export type TaskExpandModalProps = {
    data: EarnItem | null
    onClose: () => void
}

export const TaskExpandModal = React.memo<TaskExpandModalProps>(
    ({ data, onClose }) => {
        const rootClasses = useMemo(() => {
            const classes = [styles.root]

            if (!!data) {
                classes.push(styles['is-active'])
            }

            return classes.join(' ')
        }, [data])

        const timeBlocks = useMemo(() => {
            function toView(v: number) {
                if (v < 10) {
                    return `0${v}`
                }

                return `${v}`
            }

            if (data?.time) {
                const days = Math.floor(data.time / (1000 * 60 * 60 * 24));
                const hours = Math.floor((data.time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((data.time % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((data.time % (1000 * 60)) / 1000);

                return {
                    days: toView(days),
                    hours: toView(hours),
                    minutes: toView(minutes),
                    seconds: toView(seconds)
                }
            }

            return {
                days: '00',
                hours: '00',
                minutes: '00',
                seconds: '00'
            }
        }, [data])

        return (
            <div className={rootClasses}>
                <div className={styles.background} />
                <div className={styles.container} >
                    <button className={styles['close-button']} onClick={onClose}>
                        x CLOSE
                    </button>
                    <div className={styles.header}>
                        <div />
                        <h2>{data?.name}</h2>
                    </div>
                    <div className={styles.info}>
                        <img src={taskInfoBg} alt='background' />
                        <h3>{data?.amount}</h3>
                        <p>{data?.description}</p>
                    </div>
                    <p className={styles.timer}>
                        TIME - {timeBlocks.days}D {timeBlocks.hours}:{timeBlocks.minutes}:{timeBlocks.seconds}
                    </p>
                    {data?.tasks.map((item, index) => (
                        <Item {...item} index={index} />
                    ))}
                </div>
            </div>
        )
    }
)

const Item = React.memo<EarnItemTask & {
    index: number
}>(({ index, isDone, name }) => {
    const image = useMemo(() => {
        if ((index + 2) % 2 === 0) {
            return item0
        }

        return item1
    }, [index])

    return <div className={styles.item}>
        <img className={styles['item-background']} src={image} alt='background' />
        {isDone && <img className={styles['item-checked']} src={checked} alt='checked' />}
        <h4>TASK {index + 1}</h4>
        <p>{name}</p>
    </div>
})
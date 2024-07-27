import home from '@/shared/assets/images/navbar/home.png'
import frens from '@/shared/assets/images/navbar/frens.png'
import board from '@/shared/assets/images/navbar/board.png'

import styles from './NavBar.module.scss'
import React, {useCallback} from "react";
import {Steps, useNavigatorModel} from "@/shared/model";

export const NavBar = () => {
    const { step, stepChanged } = useNavigatorModel()

    const getClasses = useCallback((page: Steps) => {
        const classes = [
            styles.item,
            styles[`item-${page}`],
        ]

        if (page === step) {
            classes.push(styles['is-active'])
        }

        return classes.join(' ')
    }, [step])

    return (
        <div className={styles.root}>
            <img
                className={getClasses(Steps.HOME)}
                src={home}
                alt={'main'}
                onClick={() => stepChanged(Steps.HOME)}
            />
            <img
                className={getClasses(Steps.FRENS)}
                src={frens}
                alt={'frens'}
                onClick={() => stepChanged(Steps.FRENS)}
            />
            <img
                className={getClasses(Steps.BOARD)}
                src={board}
                alt={'board'}
                onClick={() => stepChanged(Steps.BOARD)}
            />
            {/*<img*/}
            {/*    className={getClasses('earn')}*/}
            {/*    src={earn}*/}
            {/*    alt={'earn'}*/}
            {/*    onClick={() => setValue('earn')}*/}
            {/*/>*/}
        </div>
    )
}
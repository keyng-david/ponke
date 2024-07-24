import main from '@/shared/assets/images/navbar/main.png'
import home from '@/shared/assets/images/navbar/home.png'
import frens from '@/shared/assets/images/navbar/frens.png'
import board from '@/shared/assets/images/navbar/board.png'
import earn from '@/shared/assets/images/navbar/earn.png'

import styles from './NavBar.module.scss'
import React, {useCallback, useEffect, useRef, useState} from "react";

const pages = ['main', 'frens', 'board', 'earn'] as const
type Page = typeof pages[number]

export const NavBar = () => {
    const [value, setValue] = useState<Page>('main')
    const [isInit, setIsInit] = useState(false)

    const getClasses = useCallback((page: Page) => {
        const classes = [
            styles.item,
            styles[`item-${page}`],
        ]

        if (page === value) {
            classes.push(styles['is-active'])
        }

        return classes.join(' ')
    }, [value])

    return (
        <div className={styles.root}>
            <img className={styles.background} src={main} alt={'manu'}/>
            <img
                className={getClasses('main')}
                src={home}
                alt={'main'}
                onClick={() => setValue('main')}
            />
            <img
                className={getClasses('frens')}
                src={frens}
                alt={'frens'}
                onClick={() => setValue('frens')}
            />
            <img
                className={getClasses('board')}
                src={board}
                alt={'board'}
                onClick={() => setValue('board')}
            />
            <img
                className={getClasses('earn')}
                src={earn}
                alt={'earn'}
                onClick={() => setValue('earn')}
            />
        </div>
    )
}
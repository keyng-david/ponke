import main from '@/shared/assets/images/navbar/main.png'
import home from '@/shared/assets/images/navbar/home.png'
import frens from '@/shared/assets/images/navbar/frens.png'
import board from '@/shared/assets/images/navbar/board.png'
import earn from '@/shared/assets/images/navbar/earn.png'

import styles from './NavBar.module.scss'
import React, {useCallback, useEffect, useState} from "react";

const pages = ['main', 'frens', 'board', 'earn'] as const
type Page = typeof pages[number]

export const NavBar = () => {
    const [value, setValue] = useState<Page>('main')

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

    useEffect(() => {
        alert('nav bar render')
    }, []);

    return (
        <div className={styles.root}>
            {/*<img className={styles.background} src={main} alt={'menu'}/>*/}
            {/*<img*/}
            {/*    className={`${styles.item} ${styles['item-main']}`}*/}
            {/*    src={home}*/}
            {/*    alt={'main'}*/}
            {/*    onClick={() => setValue('main')}*/}
            {/*/>*/}
            {/*<img*/}
            {/*    className={`${styles.item} ${styles['item-frens']}`}*/}
            {/*    src={frens}*/}
            {/*    alt={'frens'}*/}
            {/*    onClick={() => setValue('frens')}*/}
            {/*/>*/}
            {/*<img*/}
            {/*    className={`${styles.item} ${styles['item-board']}`}*/}
            {/*    src={board}*/}
            {/*    alt={'board'}*/}
            {/*    onClick={() => setValue('board')}*/}
            {/*/>*/}
            {/*<img*/}
            {/*    className={`${styles.item} ${styles['item-earn']}`}*/}
            {/*    src={earn}*/}
            {/*    alt={'earn'}*/}
            {/*    onClick={() => setValue('earn')}*/}
            {/*/>*/}
        </div>
    )
}
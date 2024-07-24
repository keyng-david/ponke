import main from '@/shared/assets/images/navbar/main.png'
import home from '@/shared/assets/images/navbar/home.png'
import frens from '@/shared/assets/images/navbar/frens.png'
import board from '@/shared/assets/images/navbar/board.png'
import earn from '@/shared/assets/images/navbar/earn.png'

import styles from './NavBar.module.scss'
import React, {useCallback, useEffect, useRef, useState} from "react";

const pages = ['main', 'frens', 'board', 'earn'] as const
type Page = typeof pages[number]

export const NavBar = React.memo(() => {
    const [value, setValue] = useState<Page>('main')
    const [isInit, setIsInit] = useState(false)

    const activeStateImage: Record<Page, string> = {
        main: home,
        frens: frens,
        board: board,
        earn: earn,
    }

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
        setIsInit(true)
    }, []);

    return (
        <>
            {isInit && (
                <div className={styles.root}>
                    <img className={styles.background} src={main} alt={'manu'}/>
                    {pages.map(page => (
                        <img
                            className={getClasses(page)}
                            key={page}
                            src={activeStateImage[page]}
                            alt={page}
                            onClick={() => setValue(page)}
                        />
                    ))}
                </div>
            )}
        </>
    )
})
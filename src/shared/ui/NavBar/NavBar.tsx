import main from '@/shared/assets/images/navbar/main.png'

import styles from './NavBar.module.scss'
import React, {useCallback, useState} from "react";

const pages = ['main', 'frens', 'board', 'earn'] as const
type Page = typeof pages[number]

export const NavBar = React.memo(() => {
    const [value, setValue] = useState<Page>('main')

    const activeStateImage: Record<Page, string> = {
        main: require('@/shared/assets/images/navbar/home.png'),
        frens: require('@/shared/assets/images/navbar/frens.png'),
        board: require('@/shared/assets/images/navbar/board.png'),
        earn: require('@/shared/assets/images/navbar/earn.png'),
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

    return (
        <div className={styles.root}>
            <img className={styles.background} src={main} alt={'manu'} />
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
    )
})
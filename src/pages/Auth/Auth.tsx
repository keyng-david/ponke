import React from "react";
import {useNavigate} from "react-router-dom";

import ponkeImage from '@/shared/assets/auth/ponke.png'

import styles from './Auth.module.scss'

export const Auth = () => {
    const navigate = useNavigate()

    return <div className={styles.root}>
        <div className={styles.container}>
            <Ponke />
            <Ton />
            <img
                className={styles['ponke_img']}
                src={ponkeImage}
                alt={'ponke'}
            />
        </div>
    </div>
}

const Ponke = () => {
    const images = {
        p: require('@/shared/assets/auth/p.png'),
        o: require('@/shared/assets/auth/o.png'),
        n: require('@/shared/assets/auth/n.png'),
        k: require('@/shared/assets/auth/k.png'),
        e: require('@/shared/assets/auth/e.png'),
    }

    const letters = ['p', 'o', 'n', 'k', 'e'] as const

    return <div className={styles['ponke-wrapper']}>
        {letters.map(letter => (
            <img
                src={images[letter]}
                key={`ponke-${letter}`}
                className={`${styles['ponke_letter']} ${styles[`ponke_letter-${letter}`]}`}
                alt={'letter'}
            />
        ))}
    </div>
}

const Ton = () => {
    const images = {
        t: require('@/shared/assets/auth/T.png'),
        o: require('@/shared/assets/auth/o_t.png'),
        n: require('@/shared/assets/auth/n_t.png'),
    }

    const letters = ['t', 'o', 'n'] as const

    return <div>
        {letters.map(letter => (
            <img
                src={images[letter]}
                key={`ton-${letter}`}
                className={`${styles['ton_letter']} ${styles[`ton_letter-${letter}`]}`}
                alt={'letter'}
            />
        ))}
    </div>
}
import React from "react";
import {useNavigate} from "react-router-dom";

import backgroundImage from '@/shared/assets/images/main/background.svg'
import logo from '@/shared/assets/images/main/logo.png'

import styles from './Main.module.scss'
import {MonitorTop} from "@/shared/ui/MonitorTop";
import {MonitorCenter} from "@/shared/ui/MonitorCenter";
import {MonitorRight} from "@/shared/ui/MonitorRight";
import {MonitorLeft} from "@/shared/ui/MonitorLeft";

const Main = React.memo(() => {
    const navigate = useNavigate()

    return <div className={styles.root}>
        <img
            className={styles.background}
            src={backgroundImage}
            alt={'background'}
        />
        <img
            className={styles.logo}
            src={logo}
            alt={'logo'}
        />
        <MonitorTop className={styles['monitor-top']} />
        <MonitorCenter className={styles['monitor-center']} />
        <MonitorRight className={styles['monitor-right']} />
        <MonitorLeft className={styles['monitor-left']} />
    </div>
})

export default Main
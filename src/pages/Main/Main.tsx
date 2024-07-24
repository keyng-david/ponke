import React from "react";
import {useNavigate} from "react-router-dom";

import backgroundImage from '@/shared/assets/images/main/background.svg'
import tableImage from '@/shared/assets/images/main/table.svg'
import cabelImage from '@/shared/assets/images/main/cabel.svg'
import clockImage from '@/shared/assets/images/main/clock.png'
import pictureImage from '@/shared/assets/images/main/picture.png'
import keyboardImage from '@/shared/assets/images/main/keyboard.svg'
import bankaLeftImage from '@/shared/assets/images/main/banka-left.png'
import bankaRightImage from '@/shared/assets/images/main/banka-right.png'
import logo from '@/shared/assets/images/main/logo.png'

import styles from './Main.module.scss'
import {MonitorTop} from "@/shared/ui/MonitorTop";
import {MonitorCenter} from "@/shared/ui/MonitorCenter";
import {MonitorRight} from "@/shared/ui/MonitorRight";
import {MonitorLeft} from "@/shared/ui/MonitorLeft";
import {ClickerField} from "@/features/clicker/ui";

const Main = React.memo(() => {
    const navigate = useNavigate()

    return <div className={styles.root}>
        <img
            className={styles.logo}
            src={logo}
            alt={'logo'}
        />
        <Background />
        <ClickerField />
    </div>
})

const Background = () => (
    <div className={styles.background}>
        <img
            className={styles['background-image']}
            src={backgroundImage}
            alt={'background'}
        />
        <img
            className={styles.table}
            src={tableImage}
            alt={'table'}
        />
        <img
            className={styles.cabel}
            src={cabelImage}
            alt={'cabel'}
        />
        <img
            className={styles.clock}
            src={clockImage}
            alt={'clock'}
        />
        <img
            className={styles.picture}
            src={pictureImage}
            alt={'picture'}
        />
        <img
            className={styles.keyboard}
            src={keyboardImage}
            alt={'keyboard'}
        />
        <img
            className={styles['banka-left']}
            src={bankaLeftImage}
            alt={'banka-left'}
        />
        <img
            className={styles['banka-right']}
            src={bankaRightImage}
            alt={'banka-right'}
        />
        <MonitorTop className={styles['monitor-top']}/>
        <MonitorCenter className={styles['monitor-center']}/>
        <MonitorRight className={styles['monitor-right']}/>
        <MonitorLeft className={styles['monitor-left']}/>
    </div>
)

export default Main
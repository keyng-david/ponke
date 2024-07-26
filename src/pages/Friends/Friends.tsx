import background from '@/shared/assets/images/frens/background.png'
import ponkes from '@/shared/assets/images/frens/ponkes.png'
import invite from '@/shared/assets/images/frens/invite.png'
import statistic from '@/shared/assets/images/frens/statistic.png'
import points from '@/shared/assets/images/frens/points.png'

import styles from './Friends.module.scss'
import {useTelegram} from "@/shared/lib/hooks/useTelegram";

export const Friends = () => (
    <div className={styles.root}>
        <Title />

        <Points />
        <Statistic />
        <InviteButton />

        <Decorations />
    </div>
)

const Title = () => (
    <>
        <h2 className={styles.title}>0 FRIENDS</h2>
        <h2 className={styles.title}>0 FRIENDS</h2>
    </>
)

const Points = () => (
    <div className={styles.points}>
        <img src={points} alt={'points'} />
        <p  className={styles['points-value']}>20050</p>
        <p  className={styles['points-description']}>EARN POINTS</p>
    </div>
)

const Statistic = () => (
    <div className={styles.statistic}>
        <img src={statistic} className={styles['statistic-bg']} />
        <p className={styles['tg-users']}>2.500</p>
        <p className={styles['premium-users']}>2.500</p>
    </div>
)

const InviteButton = () => {
    const { sendInviteLink } = useTelegram()

    return (
        <img
            src={invite}
            className={styles['invite-button']}
            alt={'invite button'}
            onTouchStart={sendInviteLink}
        />
    )
}

const Decorations = () => (
    <>
        <img src={background} className={styles.background} alt={'background'}/>
        <img src={ponkes} className={styles.ponkes} alt={'decoration'}/>
    </>
)
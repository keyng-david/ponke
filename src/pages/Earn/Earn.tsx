import React from 'react'
import { reflect } from '@effector/reflect'

import { earnModel } from "@/entities/earn/model"

import { LoaderTemplate } from '@/shared/ui/LoaderTemplate'
import background from '@/shared/assets/images/frens/background.png'
import points from '@/shared/assets/images/frens/points.png'
import taskBg from '@/shared/assets/images/earn/task_bg.png'

import styles from './Earn.module.scss'
import { EarnItem } from '@/entities/earn/model/types'

export const Earn = () => {
    const { isLoading } = earnModel.useFetchGate()

    return (
        <div className={styles.root}>
            <TitleReflect />
            <Main isLoading={isLoading} />
            <Decorations />
        </div>
    )
}

const Main = React.memo<{
    isLoading: boolean
}>(({ isLoading }) => (
    <LoaderTemplate className={styles.main} isLoading={isLoading}>
        <PointsReflect />
        <ListReflect />
    </LoaderTemplate>
))

const Title = React.memo<{
    count: number
}>(({ count }) => (
    <>
        <h2 className={styles.title}>{count} COLLABS</h2>
        <h2 className={styles.title}>{count} COLLABS</h2>
    </>
))

const TitleReflect = reflect({
    view: Title,
    bind: {
        count: earnModel.$data.map(state => state.collabs)
    }
})

const Points = React.memo<{
    count: number
}>(({ count }) => (
    <div className={styles.points}>
        <img src={points} alt={'points'} />
        <p  className={styles['points-value']}>{count}</p>
        <p  className={styles['points-description']}>EARN POINTS</p>
    </div>
))

const PointsReflect = reflect({
    view: Points,
    bind: {
        count: earnModel.$data.map(state => state.points)
    }
})

const List = React.memo<{
    list: EarnItem[]
}>(({ list }) => (
    <div className={styles['task-list-wrapper']}>
        <div className={styles['task-list']}>
            {list.map(item => (
                <Task key={item.name} {...item} />
            ))}
        </div>
    </div>
))

const ListReflect = reflect({
    view: List,
    bind: {
        list: earnModel.$data.map(state => state.list)
    }
})

const Task = React.memo<EarnItem>(({ name }) => (
    <div className={styles.task}>
        <span className={styles['task-label']} />
        <p className={styles['task-title']}>{name}</p>
        <img className={styles['task-bg']} src={taskBg} />
    </div>
))

const Decorations = () => (
    <>
        <img src={background} className={styles.background} alt={'background'}/>
    </>
)
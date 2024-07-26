import React, {useCallback, useEffect, useState} from "react";

import styles from './Navigator.module.scss'
import {NavBar} from "@/shared/ui/NavBar";

export type SliderNavigatorProps = {
    activeStep: number
    components: {
        step: number
        component: React.ReactNode
    }[]
}

export const SliderNavigator = React.memo<SliderNavigatorProps>(({ activeStep, components }) => {
    const [ active, setActive ] = useState(activeStep)
    const [ prev, setPrev ] = useState<number[]>([])
    const [ prevCurr, setPrevCurr ] = useState<number>(0)
    const [ next, setNext ] = useState(0)

    const getClasses = useCallback((step: number) => {
        const classes = [styles.step]

        if (prev.includes(step)) {
            classes.push(styles['step-prev-hidden'])
        }

        if (step === active) {
            classes.push(styles['step-active'])
        }

        if (step === next) {
            if (next > active) {
                classes.push(styles['step-next-right'])
            } else {
                classes.push(styles['step-next-left'])
            }
        }

        if (step === prevCurr) {
            classes.push(styles['step-prev'])
        }

        return classes.join(' ')
    }, [active, prev, next, prevCurr])

    useEffect(() => {
        if (active !== activeStep) {
            setNext(activeStep)
            setPrevCurr(active)
            const timeout1 = setTimeout(() => {
                setPrev(prevState => prevState.filter(item => item !== activeStep))
                setActive(activeStep)
                setNext(0)

                clearTimeout(timeout1)
            }, 50)
            const timeout2 = setTimeout(() => {
                setPrev(prevState => [...prevState, prevCurr])
                setPrevCurr(0)

                clearTimeout(timeout2)
            }, 300)
        }
    }, [activeStep, active, prevCurr, prev]);

    return (
        <div className={styles.root}>
            {components.map(({ step, component }) => {
                if (step === active || prev.includes(step) || step === next || step === prevCurr) {
                    return (
                        <div key={step} className={getClasses(step)}>
                            {component}
                        </div>
                    )
                }

                return null
            })}
            <NavBar />
        </div>
    )
})
import {Route, Routes, useLocation} from "react-router-dom";
import {Auth} from "@/pages/Auth/Auth";
import React, {useEffect, useState} from "react";
import {Main as Home} from "@/pages/Main/Main";
import {Steps, useNavigatorModel} from "@/shared/model";
import {SliderNavigator} from "@/shared/ui/Navigator";
import {Friends} from "@/pages/Friends/Friends";

export const RouterView = React.memo(() => {
    const location = useLocation();

    const [displayLocation, setDisplayLocation] = useState(location);
    const [transitionStage, setTransitionStage] = useState<'fade-in' | 'fade-out'>('fade-in');

    useEffect(() => {
        if (location !== displayLocation) setTransitionStage("fade-out");
    }, [location, displayLocation]);

    return (
        <div
            className={transitionStage}
            onAnimationEnd={() => {
                if (transitionStage === 'fade-out') {
                    setTransitionStage('fade-in')
                    setDisplayLocation(location)
                }
            }}
        >
            <Routes location={displayLocation}>
                <Route path={'/'} element={<Auth />} />
                <Route path={'/main'} element={<Main />} />
            </Routes>
        </div>
    )
})

const Main = () => {
    const { step } = useNavigatorModel()

    return (
        <SliderNavigator
            activeStep={step}
            components={[
                {
                    step: Steps.HOME,
                    component: <Home />,
                },
                {
                    step: Steps.FRENS,
                    component: <Friends />,
                }
            ]}
        />
    )
}
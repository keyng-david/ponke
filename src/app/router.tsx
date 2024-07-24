import {Route, Routes, useLocation} from "react-router-dom";
import {Auth} from "@/pages/Auth/Auth";
import React, {lazy, useEffect, useState} from "react";

export const RouterView = () => {
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
                <Route path={'/main'} element={<MainElement />} />
            </Routes>
        </div>
    )
}

const Main = React.lazy(() => import('../pages/Main/Main'))

const MainElement = React.memo(() => {
    return <React.Suspense fallback={<></>}>
        <Main />
    </React.Suspense>
})
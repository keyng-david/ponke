import React from "react";
import {useNavigate} from "react-router-dom";

const Main = React.memo(() => {
    const navigate = useNavigate()

    return <div>
        <h1>Main</h1>
        <button onClick={() => navigate('/')}>go loader</button>
    </div>
})

export default Main
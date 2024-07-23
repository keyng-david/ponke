import React, {useEffect} from 'react';
import './App.css';
import { RouterView } from './router'
import {BrowserRouter} from "react-router-dom";
import {useTelegram} from "@/shared/lib/hooks/useTelegram";

function App() {
    const { expand } = useTelegram()

    useEffect(() => {
        expand()
    }, [expand]);

  return (
    <React.StrictMode>
        <BrowserRouter>
            <RouterView />
        </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;

import React, {useEffect} from 'react';
import './App.css';
import { RouterView } from './router'
import {BrowserRouter} from "react-router-dom";

function App() {
    useEffect(() => {
        alert(`${window.innerWidth} - ${window.innerHeight}`)
    }, []);

  return (
    <React.StrictMode>
        <BrowserRouter>
            <RouterView />
        </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;

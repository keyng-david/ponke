import React from 'react';
import './App.css';
import { RouterView } from './router'
import {BrowserRouter} from "react-router-dom";

function App() {
  return (
    <React.StrictMode>
        <BrowserRouter>
            <RouterView />
        </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;

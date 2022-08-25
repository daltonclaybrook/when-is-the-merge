import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactGA from 'react-ga';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const trackingId = process.env.REACT_APP_GA_TRACKING_ID as string;
ReactGA.initialize(trackingId, { debug: false });

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

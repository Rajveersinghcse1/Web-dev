// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { CSVProvider } from './context/CSVContext';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <CSVProvider>

      <App />
      </CSVProvider>
    </ThemeProvider>
  </React.StrictMode>
);

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { SoundProvider } from './hooks/useSound';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SoundProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SoundProvider>
  </React.StrictMode>
);
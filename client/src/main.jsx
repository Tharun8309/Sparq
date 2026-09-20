import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <CartProvider>
          <AdminProvider>
            <App />
          </AdminProvider>
        </CartProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);

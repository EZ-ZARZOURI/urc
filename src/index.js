import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import Provider et le store
import { Provider } from 'react-redux';
import store from './store/store';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Entourez App du Provider et passez-y le store */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// Mesure des performances (optionnel)
reportWebVitals(console.log);

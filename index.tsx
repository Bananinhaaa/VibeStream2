
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Comportamento imersivo de App: desabilita menu de contexto
document.addEventListener('contextmenu', event => {
  // Permite contexto apenas em inputs/textareas se necessário
  if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
    event.preventDefault();
  }
});

// Previne gestos de pinça (zoom) que quebram o layout de PWA
document.addEventListener('touchstart', (event) => {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}, { passive: false });

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

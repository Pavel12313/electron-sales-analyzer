import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
console.log('Renderer process started');

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
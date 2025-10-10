import React from './react.js';
import { ReactDOM } from './react.js';
import { App } from './App.jsx';

const rootElement = document.getElementById('root');
if (rootElement && ReactDOM) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}

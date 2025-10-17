import React from './react.js';
import { ReactDOM } from './react.js';
import { App } from './App.js';
var rootElement = document.getElementById('root');
if (rootElement && ReactDOM) {
  if (typeof ReactDOM.createRoot === 'function') {
    var root = ReactDOM.createRoot(rootElement);
    root.render(/*#__PURE__*/React.createElement(App, null));
  } else if (typeof ReactDOM.render === 'function') {
    ReactDOM.render(/*#__PURE__*/React.createElement(App, null), rootElement);
  } else {
    console.error('Aucune méthode de rendu ReactDOM disponible.');
  }
}
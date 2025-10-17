var ReactGlobal = window.React;
if (!ReactGlobal) {
  throw new Error('React global not found. Assurez-vous que React est chargé avant les modules.');
}
var ReactDOMGlobal = window.ReactDOM;
export var React = ReactGlobal;
export var ReactDOM = ReactDOMGlobal;
export var {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef
} = ReactGlobal;
export default ReactGlobal;
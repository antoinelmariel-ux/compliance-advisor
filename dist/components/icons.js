var _excluded = ["className", "title"];
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
import React from '../react.js';
var ICON_SVG_MAP = {
  'arrow-right2': () => /*#__PURE__*/React.createElement("path", {
    d: "M9 5l7 7-7 7"
  }),
  // Chevron Right
  'arrow-left2': () => /*#__PURE__*/React.createElement("path", {
    d: "M15 5l-7 7 7 7"
  }),
  // Chevron Left
  warning: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M10.29 3.64 2.5 17.14A2 2 0 0 0 4.24 20h15.52a2 2 0 0 0 1.74-2.86l-7.79-13.5a2 2 0 0 0-3.42 0Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 9v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 16h.01",
    strokeLinecap: "round"
  })),
  checkmark2: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "8.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 12.5 2.25 2.25L15.5 10"
  })),
  cog: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
  })),
  'file-text': () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M14 2H7.5A3.5 3.5 0 0 0 4 5.5v13A3.5 3.5 0 0 0 7.5 22h9A3.5 3.5 0 0 0 20 18.5V9Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 2v7h7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 14.5h6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 18h6"
  })),
  users: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M17 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-5A4.5 4.5 0 0 0 3 19.5V21"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9.5",
    cy: "8",
    r: "3.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 21v-1.25a4.25 4.25 0 0 0-3-4.07"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.5 3.5a3.5 3.5 0 0 1 0 6.59"
  })),
  calendar: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "17",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 2v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 2v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 11h18"
  })),
  info: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "8.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 11v5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7h.01",
    strokeLinecap: "round"
  })),
  pencil: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 20h4l10.5-10.5a2.5 2.5 0 0 0-3.54-3.54L4.46 16.46a2 2 0 0 0-.46 1.28V20"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m13.5 6.5 4 4"
  })),
  plus: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14"
  })),
  bin: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M6 6h12"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: "6",
    width: "14",
    height: "14",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 11v5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 11v5"
  })),
  eye: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M2 12s4-6.5 10-6.5S22 12 22 12s-4 6.5-10 6.5S2 12 2 12Z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  })),
  menu: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "7",
    r: "1",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "12",
    r: "1",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "17",
    r: "1",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "7",
    r: "1",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "12",
    r: "1",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "17",
    r: "1",
    fill: "currentColor",
    stroke: "none"
  })),
  envelop: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m3 5 9 7 9-7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"
  })),
  'aid-kit': () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m12 4-1.3 4.5L6 9.8l4.7 1.3L12 15.5l1.3-4.4 4.7-1.3-4.7-1.3Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m5 18.25-.45 1.45L3 20l1.55.3L5 22l.45-1.7L7 20l-1.55-.3Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m19 14-.45 1.45L17 16l1.55.55L19 18l.45-1.45L21 16l-1.55-.55Z"
  })),
  target: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "8.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "1",
    fill: "currentColor",
    stroke: "none"
  })),
  rocket: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 3c3.5 0 6 2.5 6 6.5 0 4.5-2 8-4 10a2 2 0 0 1-2 0c-2-2-4-5.5-4-10C8 5.5 10.5 3 12 3Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 14.5v3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 18.5 7.5 21"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 18.5 16.5 21"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "8.5",
    r: "1.75"
  })),
  compass2: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "8.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m16.75 8.25-2.5 6.5-6.5 2.5 2.5-6.5Z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "1",
    fill: "currentColor",
    stroke: "none"
  })),
  cross: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m7 7 10 10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 7 7 17"
  })),
  download3: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 3v12"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m8 11 4 4 4-4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 19h14"
  })),
  upload3: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 21V9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m16 13-4-4-4 4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 5h14"
  })),
  'floppy-disk': () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M5 3h11.5L21 7.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "7.5",
    y: "15",
    width: "9",
    height: "5",
    rx: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 3v5.5a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 7 8.5V3"
  })),
  copy: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "9",
    y: "9",
    width: "12",
    height: "12",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 15V5a2 2 0 0 1 2-2h10"
  }))
};
var DEFAULT_SVG_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};
var createIcon = iconName => {
  var renderSvgContent = ICON_SVG_MAP[iconName];
  return _ref => {
    var {
        className = '',
        title
      } = _ref,
      props = _objectWithoutProperties(_ref, _excluded);
    if (typeof renderSvgContent !== 'function') {
      console.warn("Ic\xF4ne inconnue demand\xE9e : ".concat(iconName));
      return null;
    }
    var composedClassName = "app-icon ".concat(className).trim();
    return /*#__PURE__*/React.createElement("svg", _extends({
      className: composedClassName,
      role: title ? 'img' : undefined,
      "aria-label": title,
      "aria-hidden": title ? undefined : true
    }, DEFAULT_SVG_PROPS, props), title ? /*#__PURE__*/React.createElement("title", null, title) : null, renderSvgContent(props));
  };
};
export var ChevronRight = createIcon('arrow-right2');
export var ChevronLeft = createIcon('arrow-left2');
export var AlertTriangle = createIcon('warning');
export var CheckCircle = createIcon('checkmark2');
export var Settings = createIcon('cog');
export var FileText = createIcon('file-text');
export var Users = createIcon('users');
export var Calendar = createIcon('calendar');
export var Info = createIcon('info');
export var Edit = createIcon('pencil');
export var Plus = createIcon('plus');
export var Trash2 = createIcon('bin');
export var Eye = createIcon('eye');
export var GripVertical = createIcon('menu');
export var Send = createIcon('envelop');
export var Sparkles = createIcon('aid-kit');
export var Target = createIcon('target');
export var Rocket = createIcon('rocket');
export var Compass = createIcon('compass2');
export var Close = createIcon('cross');
export var Download = createIcon('download3');
export var Upload = createIcon('upload3');
export var Save = createIcon('floppy-disk');
export var Copy = createIcon('copy');
export { createIcon };
import React from '../react.js';
var URL_REGEX = /(https?:\/\/[^\s]+)/g;
var TRAILING_PUNCTUATION_REGEX = /[)\]\}.,;!?]+$/;
export var renderTextWithLinks = text => {
  if (typeof text !== 'string' || text.length === 0) {
    return text;
  }
  var elements = [];
  var lastIndex = 0;
  text.replace(URL_REGEX, (match, offset) => {
    if (offset > lastIndex) {
      elements.push(text.slice(lastIndex, offset));
    }
    var url = match;
    var trailingMatch = url.match(TRAILING_PUNCTUATION_REGEX);
    var trailing = '';
    if (trailingMatch) {
      url = url.slice(0, -trailingMatch[0].length);
      trailing = trailingMatch[0];
    }
    elements.push(/*#__PURE__*/React.createElement("a", {
      key: "link-".concat(offset),
      href: url,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "text-indigo-600 underline"
    }, url));
    if (trailing) {
      elements.push(trailing);
    }
    lastIndex = offset + match.length;
    return match;
  });
  if (lastIndex === 0) {
    return text;
  }
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }
  return elements;
};
import React from '../../../react.js';
var noop = () => {};
var normalizeLabel = (label, fallback) => {
  if (typeof label === 'string' && label.trim().length > 0) {
    return label.trim();
  }
  if (typeof fallback === 'string' && fallback.trim().length > 0) {
    return fallback.trim();
  }
  return 'ce contenu';
};
var hasActiveSelection = () => {
  if (typeof window === 'undefined' || typeof window.getSelection !== 'function') {
    return false;
  }
  var selection = window.getSelection();
  if (!selection) {
    return false;
  }
  return selection.type === 'Range' && String(selection).trim().length > 0;
};
export var ShowcaseEditable = _ref => {
  var _children$props;
  var {
    enabled = false,
    questionId,
    label,
    onEdit = noop,
    onRequestEnable = null,
    variant = 'block',
    question = null,
    children
  } = _ref;
  if (!React.isValidElement(children)) {
    return children;
  }
  var hasQuestionId = typeof questionId === 'string' && questionId.length > 0;
  var canHandleEdit = typeof onEdit === 'function' && hasQuestionId;
  if (!canHandleEdit && typeof onRequestEnable !== 'function') {
    return children;
  }
  var isEnabled = Boolean(enabled && canHandleEdit);
  var normalizedLabel = normalizeLabel(label, children === null || children === void 0 || (_children$props = children.props) === null || _children$props === void 0 ? void 0 : _children$props['aria-label']);
  var buildEditPayload = () => {
    var payload = {
      label: normalizedLabel
    };
    if (question && typeof question === 'object') {
      payload.question = question;
    }
    return payload;
  };
  var handleEdit = () => {
    try {
      onEdit(questionId, buildEditPayload());
    } catch (error) {
      // Ignore errors thrown by the edit handler to avoid breaking the showcase rendering.
    }
  };
  var handleRequestEnable = () => {
    if (typeof onRequestEnable !== 'function') {
      return;
    }
    try {
      onRequestEnable(questionId, buildEditPayload());
    } catch (error) {
      // Ignore failures when requesting edit mode enablement.
    }
  };
  var isRequestOnly = !isEnabled && typeof onRequestEnable === 'function';
  var isInteractive = isEnabled || isRequestOnly;
  var childClassName = [children.props.className, 'showcase-editable__content'].filter(Boolean).join(' ');
  var ariaLabel = isEnabled ? "Modifier ".concat(normalizedLabel) : "Activer l\u2019\xE9dition pour ".concat(normalizedLabel);
  var hintLabel = isEnabled ? 'Cliquer pour modifier' : 'Activer l’édition';
  var handleActivation = event => {
    if (!isInteractive) {
      return;
    }
    if (hasActiveSelection()) {
      return;
    }
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (isEnabled) {
      handleEdit();
      return;
    }
    handleRequestEnable();
  };
  var handleKeyDown = event => {
    if (!isInteractive) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleActivation(event);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "showcase-editable showcase-editable--".concat(variant, " ").concat(isEnabled ? 'showcase-editable--active' : 'showcase-editable--inactive').concat(isInteractive ? ' showcase-editable--interactive' : '').trim(),
    "data-edit-question": questionId,
    "data-editing-active": isEnabled ? 'true' : 'false',
    onClick: isInteractive ? handleActivation : undefined,
    onKeyDown: isInteractive ? handleKeyDown : undefined,
    role: isInteractive ? 'button' : undefined,
    tabIndex: isInteractive ? 0 : undefined,
    "aria-label": isInteractive ? ariaLabel : undefined
  }, React.cloneElement(children, {
    className: childClassName
  }), isInteractive ? /*#__PURE__*/React.createElement("span", {
    className: "showcase-editable__hint",
    "aria-hidden": "true"
  }, hintLabel) : null);
};
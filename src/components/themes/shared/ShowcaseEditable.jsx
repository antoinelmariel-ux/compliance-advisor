import React from '../../../react.js';

const noop = () => {};

const normalizeLabel = (label, fallback) => {
  if (typeof label === 'string' && label.trim().length > 0) {
    return label.trim();
  }
  if (typeof fallback === 'string' && fallback.trim().length > 0) {
    return fallback.trim();
  }
  return 'ce contenu';
};

const hasActiveSelection = () => {
  if (typeof window === 'undefined' || typeof window.getSelection !== 'function') {
    return false;
  }

  const selection = window.getSelection();
  if (!selection) {
    return false;
  }

  return selection.type === 'Range' && String(selection).trim().length > 0;
};

export const ShowcaseEditable = ({
  enabled = false,
  questionId,
  label,
  onEdit = noop,
  onRequestEnable = null,
  variant = 'block',
  children
}) => {
  if (!React.isValidElement(children)) {
    return children;
  }

  const hasQuestionId = typeof questionId === 'string' && questionId.length > 0;
  const canHandleEdit = typeof onEdit === 'function' && hasQuestionId;

  if (!canHandleEdit && typeof onRequestEnable !== 'function') {
    return children;
  }

  const isEnabled = Boolean(enabled && canHandleEdit);
  const normalizedLabel = normalizeLabel(label, children?.props?.['aria-label']);

  const handleEdit = () => {
    try {
      onEdit(questionId, { label: normalizedLabel });
    } catch (error) {
      // Ignore errors thrown by the edit handler to avoid breaking the showcase rendering.
    }
  };

  const handleRequestEnable = () => {
    if (typeof onRequestEnable !== 'function') {
      return;
    }

    try {
      onRequestEnable(questionId, { label: normalizedLabel });
    } catch (error) {
      // Ignore failures when requesting edit mode enablement.
    }
  };

  const isRequestOnly = !isEnabled && typeof onRequestEnable === 'function';
  const isInteractive = isEnabled || isRequestOnly;
  const childClassName = [children.props.className, 'showcase-editable__content'].filter(Boolean).join(' ');
  const ariaLabel = isEnabled
    ? `Modifier ${normalizedLabel}`
    : `Activer l’édition pour ${normalizedLabel}`;
  const hintLabel = isEnabled ? 'Cliquer pour modifier' : 'Activer l’édition';

  const handleActivation = (event) => {
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

  const handleKeyDown = (event) => {
    if (!isInteractive) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleActivation(event);
    }
  };

  return (
    <div
      className={`showcase-editable showcase-editable--${variant} ${isEnabled ? 'showcase-editable--active' : 'showcase-editable--inactive'}${isInteractive ? ' showcase-editable--interactive' : ''}`.trim()}
      data-edit-question={questionId}
      data-editing-active={isEnabled ? 'true' : 'false'}
      onClick={isInteractive ? handleActivation : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? ariaLabel : undefined}
    >
      {React.cloneElement(children, {
        className: childClassName
      })}
      {isInteractive ? (
        <span className="showcase-editable__hint" aria-hidden="true">{hintLabel}</span>
      ) : null}
    </div>
  );
};


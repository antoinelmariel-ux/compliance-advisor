import React from '../../../react.js';
import { Edit } from '../../icons.js';

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

  const handleButtonClick = () => {
    if (isEnabled) {
      handleEdit();
      return;
    }

    handleRequestEnable();
  };

  const childClassName = [children.props.className, 'showcase-editable__content'].filter(Boolean).join(' ');

  const isRequestOnly = !isEnabled && typeof onRequestEnable === 'function';
  const buttonDisabled = !isEnabled && !isRequestOnly;
  const buttonLabel = isEnabled ? 'Modifier' : 'Activer l’édition';
  const buttonAriaLabel = isEnabled
    ? `Modifier ${normalizedLabel}`
    : `Activer l’édition pour ${normalizedLabel}`;

  return (
    <div
      className={`showcase-editable showcase-editable--${variant} ${isEnabled ? 'showcase-editable--active' : 'showcase-editable--inactive'}`.trim()}
      data-edit-question={questionId}
      data-editing-active={isEnabled ? 'true' : 'false'}
    >
      {React.cloneElement(children, {
        className: childClassName
      })}
      <button
        type="button"
        className="showcase-editable__button"
        onClick={handleButtonClick}
        aria-label={buttonAriaLabel}
        disabled={buttonDisabled}
        aria-disabled={buttonDisabled ? 'true' : undefined}
      >
        <Edit className="showcase-editable__icon" aria-hidden="true" />
        <span>{buttonLabel}</span>
      </button>
    </div>
  );
};


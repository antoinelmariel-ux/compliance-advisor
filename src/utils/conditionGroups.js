export const sanitizeCondition = (condition = {}) => {
  return {
    question: condition.question || '',
    operator: condition.operator || 'equals',
    value: condition.value ?? ''
  };
};

export const sanitizeConditionGroup = (group = {}) => {
  const logic = group.logic === 'any' ? 'any' : 'all';
  const conditions = Array.isArray(group.conditions)
    ? group.conditions.map(sanitizeCondition)
    : [];

  return {
    logic,
    conditions
  };
};

export const normalizeConditionGroups = (entity = {}) => {
  const rawGroups = Array.isArray(entity.conditionGroups) ? entity.conditionGroups : null;

  if (rawGroups && rawGroups.length > 0) {
    return rawGroups.map(sanitizeConditionGroup);
  }

  const fallbackConditions = Array.isArray(entity.conditions) ? entity.conditions : [];
  if (fallbackConditions.length === 0) {
    return [];
  }

  return [
    sanitizeConditionGroup({
      logic: entity.conditionLogic === 'any' ? 'any' : 'all',
      conditions: fallbackConditions
    })
  ];
};

export const applyConditionGroups = (entity = {}, groups = []) => {
  const sanitizedGroups = Array.isArray(groups)
    ? groups.map(sanitizeConditionGroup)
    : [];

  const hasSingleGroup = sanitizedGroups.length === 1;
  const legacyConditions = hasSingleGroup ? sanitizedGroups[0].conditions : [];
  const legacyLogic = hasSingleGroup ? sanitizedGroups[0].logic : 'all';

  return {
    ...entity,
    conditionGroups: sanitizedGroups,
    conditions: legacyConditions,
    conditionLogic: legacyLogic
  };
};

export const hasAnyConditions = (entity = {}) => {
  return normalizeConditionGroups(entity).some(group => group.conditions.length > 0);
};

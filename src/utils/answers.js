export const isAnswerProvided = (value) => {
  if (Array.isArray(value)) {
    return value.some(item => isAnswerProvided(item));
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (value && typeof value === 'object') {
    return Object.values(value).some(item => isAnswerProvided(item));
  }

  return value !== null && value !== undefined;
};

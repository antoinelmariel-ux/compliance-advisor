const normalizeAnswerForComparison = (answer) => {
  if (Array.isArray(answer)) {
    return answer;
  }

  if (answer && typeof answer === 'object') {
    if (typeof answer.value !== 'undefined') {
      return answer.value;
    }

    if (typeof answer.name !== 'undefined') {
      return answer.name;
    }
  }

  return answer;
};

const evaluateQuestionCondition = (condition, answers) => {
  const rawAnswer = answers[condition.question];
  if (Array.isArray(rawAnswer) && rawAnswer.length === 0) return false;
  if (rawAnswer === null || rawAnswer === undefined || rawAnswer === '') return false;

  const answer = normalizeAnswerForComparison(rawAnswer);

  switch (condition.operator) {
    case 'equals':
      if (Array.isArray(answer)) {
        return answer.includes(condition.value);
      }
      return answer === condition.value;
    case 'not_equals':
      if (Array.isArray(answer)) {
        return !answer.includes(condition.value);
      }
      return answer !== condition.value;
    case 'contains':
      if (Array.isArray(answer)) {
        return answer.includes(condition.value);
      }
      if (typeof answer === 'string') {
        return answer.includes(condition.value);
      }
      return false;
    default:
      return false;
  }
};

export const shouldShowQuestion = (question, answers) => {
  if (!question.conditions || question.conditions.length === 0) {
    return true;
  }

  const logic = question.conditionLogic === 'any' ? 'any' : 'all';

  if (logic === 'any') {
    return question.conditions.some(condition => evaluateQuestionCondition(condition, answers));
  }

  return question.conditions.every(condition => evaluateQuestionCondition(condition, answers));
};

export const formatAnswer = (question, answer) => {
  if (answer === null || answer === undefined) {
    return '';
  }

  const questionType = (question && question.type) || 'choice';

  if (questionType === 'date') {
    const parsed = new Date(answer);
    if (Number.isNaN(parsed.getTime())) {
      return String(answer);
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(parsed);
  }

  if (questionType === 'multi_choice' && Array.isArray(answer)) {
    return answer.join(', ');
  }

  if (questionType === 'file' && answer && typeof answer === 'object') {
    const size = typeof answer.size === 'number' ? ` (${Math.round(answer.size / 1024)} Ko)` : '';
    return `${answer.name || 'Fichier joint'}${size}`;
  }

  return Array.isArray(answer) ? answer.join(', ') : String(answer);
};

export { normalizeAnswerForComparison };

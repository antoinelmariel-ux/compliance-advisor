import { normalizeConditionGroups } from './conditionGroups.js';
var normalizeAnswerForComparison = answer => {
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
var evaluateQuestionCondition = (condition, answers) => {
  var rawAnswer = answers[condition.question];
  if (Array.isArray(rawAnswer) && rawAnswer.length === 0) return false;
  if (rawAnswer === null || rawAnswer === undefined || rawAnswer === '') return false;
  var answer = normalizeAnswerForComparison(rawAnswer);
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
export var shouldShowQuestion = (question, answers) => {
  var conditionGroups = normalizeConditionGroups(question);
  if (conditionGroups.length === 0) {
    return true;
  }
  return conditionGroups.every(group => {
    var groupConditions = Array.isArray(group.conditions) ? group.conditions : [];
    if (groupConditions.length === 0) {
      return true;
    }
    var logic = group.logic === 'any' ? 'any' : 'all';
    if (logic === 'any') {
      return groupConditions.some(condition => evaluateQuestionCondition(condition, answers));
    }
    return groupConditions.every(condition => evaluateQuestionCondition(condition, answers));
  });
};
export var formatAnswer = (question, answer) => {
  if (answer === null || answer === undefined) {
    return '';
  }
  var questionType = question && question.type || 'choice';
  if (questionType === 'date') {
    var parsed = new Date(answer);
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
    var size = typeof answer.size === 'number' ? " (".concat(Math.round(answer.size / 1024), " Ko)") : '';
    return "".concat(answer.name || 'Fichier joint').concat(size);
  }
  return Array.isArray(answer) ? answer.join(', ') : String(answer);
};
export { normalizeAnswerForComparison };
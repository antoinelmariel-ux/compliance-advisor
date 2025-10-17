import { isAnswerProvided } from './answers.js';
export var REQUIRED_SHOWCASE_QUESTION_IDS = ['projectName', 'projectSlogan', 'targetAudience', 'problemPainPoints', 'solutionDescription', 'solutionBenefits', 'solutionComparison', 'teamLead', 'teamCoreMembers', 'campaignKickoffDate', 'launchDate'];
export var isShowcaseCriticalQuestion = questionId => typeof questionId === 'string' && REQUIRED_SHOWCASE_QUESTION_IDS.includes(questionId);
export var computeMissingShowcaseQuestions = (questions, answers) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return [];
  }
  return questions.map((question, index) => ({
    question,
    position: index + 1
  })).filter(_ref => {
    var {
      question
    } = _ref;
    return question && isShowcaseCriticalQuestion(question.id);
  }).filter(_ref2 => {
    var {
      question
    } = _ref2;
    return !isAnswerProvided(answers ? answers[question.id] : undefined);
  });
};
export var getMissingShowcaseQuestionLabels = (questions, answers) => {
  var list = Array.isArray(questions) ? questions : [];
  var questionById = new Map();
  list.forEach(question => {
    if (question && typeof question.id === 'string' && question.id.length > 0) {
      questionById.set(question.id, question);
    }
  });
  return REQUIRED_SHOWCASE_QUESTION_IDS.filter(id => {
    var question = questionById.get(id);
    if (!question) {
      return true;
    }
    return !isAnswerProvided(answers ? answers[id] : undefined);
  }).map(id => {
    var question = questionById.get(id);
    if (question) {
      if (typeof question.question === 'string' && question.question.trim().length > 0) {
        return question.question.trim();
      }
      if (typeof question.label === 'string' && question.label.trim().length > 0) {
        return question.label.trim();
      }
    }
    return id;
  });
};
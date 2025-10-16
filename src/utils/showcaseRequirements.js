import { isAnswerProvided } from './answers.js';

export const REQUIRED_SHOWCASE_QUESTION_IDS = [
  'projectName',
  'projectSlogan',
  'targetAudience',
  'problemPainPoints',
  'solutionDescription',
  'solutionBenefits',
  'solutionComparison',
  'teamLead',
  'teamCoreMembers',
  'campaignKickoffDate',
  'launchDate'
];

export const isShowcaseCriticalQuestion = (questionId) =>
  typeof questionId === 'string' && REQUIRED_SHOWCASE_QUESTION_IDS.includes(questionId);

export const computeMissingShowcaseQuestions = (questions, answers) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return [];
  }

  return questions
    .map((question, index) => ({ question, position: index + 1 }))
    .filter(({ question }) => question && isShowcaseCriticalQuestion(question.id))
    .filter(({ question }) => !isAnswerProvided(answers ? answers[question.id] : undefined));
};

export const getMissingShowcaseQuestionLabels = (questions, answers) => {
  const list = Array.isArray(questions) ? questions : [];
  const questionById = new Map();

  list.forEach((question) => {
    if (question && typeof question.id === 'string' && question.id.length > 0) {
      questionById.set(question.id, question);
    }
  });

  return REQUIRED_SHOWCASE_QUESTION_IDS.filter((id) => {
    const question = questionById.get(id);
    if (!question) {
      return true;
    }

    return !isAnswerProvided(answers ? answers[id] : undefined);
  }).map((id) => {
    const question = questionById.get(id);
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

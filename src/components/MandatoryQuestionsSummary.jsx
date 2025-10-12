import React from '../react.js';
import { AlertTriangle, CheckCircle, ChevronRight } from './icons.js';

export const MandatoryQuestionsSummary = ({
  pendingQuestions = [],
  totalQuestions = 0,
  onBackToQuestionnaire,
  onNavigateToQuestion,
  onProceedToSynthesis
}) => {
  const hasPending = pendingQuestions.length > 0;

  const handleNavigate = (questionId) => {
    if (typeof onNavigateToQuestion === 'function') {
      onNavigateToQuestion(questionId);
    }
  };

  const handleBack = () => {
    if (typeof onBackToQuestionnaire === 'function') {
      onBackToQuestionnaire();
    }
  };

  const handleProceed = () => {
    if (typeof onProceedToSynthesis === 'function') {
      onProceedToSynthesis();
    }
  };

  return (
    <div className="py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 hv-surface">
          <div className="flex items-start gap-4">
            {hasPending ? (
              <AlertTriangle className="w-6 h-6 text-amber-500 mt-1" />
            ) : (
              <CheckCircle className="w-6 h-6 text-emerald-500 mt-1" />
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {hasPending
                  ? 'Questions obligatoires à compléter'
                  : 'Toutes les questions obligatoires sont complétées'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {hasPending
                  ? 'Veuillez compléter ces réponses avant de pouvoir accéder à la synthèse du projet.'
                  : 'Vous pouvez désormais consulter la synthèse du projet.'}
              </p>
            </div>
          </div>

          {hasPending ? (
            <ul className="space-y-4" aria-label="Questions obligatoires non répondues">
              {pendingQuestions.map(({ question, position }) => {
                const questionNumber = position > 0 ? position : null;
                const positionLabel =
                  questionNumber && totalQuestions
                    ? `Question ${questionNumber} sur ${totalQuestions}`
                    : 'Question obligatoire';

                return (
                  <li
                    key={question.id}
                    className="border border-amber-200 rounded-xl bg-amber-50 p-4 sm:p-5 hv-surface"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{positionLabel}</p>
                        <p className="mt-2 text-sm sm:text-base font-medium text-gray-900">{question.question}</p>
                        {question.guidance?.objective && (
                          <p className="mt-1 text-xs text-gray-600">
                            {question.guidance.objective}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleNavigate(question.id)}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium bg-white text-amber-700 border border-amber-300 hover:bg-amber-100 transition-all hv-button"
                        >
                          Compléter la question
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="border border-emerald-200 rounded-xl bg-emerald-50 p-4 sm:p-5 hv-surface">
              <p className="text-sm text-emerald-800">
                Toutes les réponses obligatoires ont été fournies. Vous pouvez générer la synthèse quand vous le souhaitez.
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-gray-700 border border-gray-300 hover:bg-gray-100 transition-all hv-button"
            >
              Retour au questionnaire
            </button>
            <button
              type="button"
              onClick={handleProceed}
              disabled={hasPending}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all hv-button hv-button-primary"
            >
              Accéder à la synthèse
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

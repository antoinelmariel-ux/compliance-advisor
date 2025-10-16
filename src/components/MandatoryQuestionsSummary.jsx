import React, { useEffect, useState } from '../react.js';
import { AlertTriangle, CheckCircle, ChevronRight } from './icons.js';

export const MandatoryQuestionsSummary = ({
  pendingQuestions = [],
  totalQuestions = 0,
  missingShowcaseQuestions = [],
  onBackToQuestionnaire,
  onNavigateToQuestion,
  onProceedToSynthesis
}) => {
  const hasPending = pendingQuestions.length > 0;
  const hasPendingShowcase = missingShowcaseQuestions.length > 0;
  const [showIncompleteAlert, setShowIncompleteAlert] = useState(false);

  useEffect(() => {
    if (!hasPending) {
      setShowIncompleteAlert(false);
    }
  }, [hasPending]);

  const summaryTitle = hasPending
    ? 'Questions obligatoires à compléter'
    : hasPendingShowcase
      ? 'Optimisez votre vitrine marketing'
      : 'Toutes les questions obligatoires sont complétées';

  const summaryDescription = hasPending
    ? 'Veuillez compléter ces réponses avant de pouvoir accéder à la synthèse du projet.'
    : hasPendingShowcase
      ? 'Certaines réponses optionnelles sont nécessaires pour afficher l’intégralité de la vitrine marketing.'
      : 'Vous pouvez désormais consulter la synthèse du projet.';

  const StatusIcon = hasPending || hasPendingShowcase ? AlertTriangle : CheckCircle;

  const handleShowcaseNavigate = (questionId) => {
    if (typeof onNavigateToQuestion === 'function') {
      onNavigateToQuestion(questionId);
    }
  };

  const getPositionLabel = (position, total = totalQuestions) => {
    if (position > 0 && total) {
      return `Question ${position} sur ${total}`;
    }
    return 'Question obligatoire';
  };

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
    if (hasPending) {
      setShowIncompleteAlert(true);
      return;
    }

    setShowIncompleteAlert(false);

    if (typeof onProceedToSynthesis === 'function') {
      onProceedToSynthesis();
    }
  };

  const proceedButtonClassName = `w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all hv-button hv-button-primary ${
    hasPending ? 'opacity-60 cursor-not-allowed focus:outline-none focus:ring-0' : ''
  }`;

  return (
    <div className="py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 hv-surface">
          <div className="flex items-start gap-4">
            <StatusIcon className={`w-6 h-6 mt-1 ${hasPending || hasPendingShowcase ? 'text-amber-500' : 'text-emerald-500'}`} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{summaryTitle}</h2>
              <p className="text-sm text-gray-600 mt-1">{summaryDescription}</p>
            </div>
          </div>

          {hasPending ? (
            <ul className="space-y-4" aria-label="Questions obligatoires non répondues">
              {pendingQuestions.map(({ question, position }) => {
                const positionLabel = getPositionLabel(position);

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

          {hasPendingShowcase && (
            <div className="border border-indigo-200 rounded-xl bg-indigo-50 p-4 sm:p-5 space-y-4 hv-surface">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  Questions indispensables pour la vitrine marketing
                </p>
                <p className="mt-1 text-sm text-indigo-800">
                  Ces réponses optionnelles complètent les blocs affichés au sein du showcase.
                </p>
              </div>
              <ul className="space-y-3" aria-label="Questions importantes pour la vitrine">
                {missingShowcaseQuestions.map(({ question, position }) => (
                  <li
                    key={question.id}
                    className="border border-indigo-200 rounded-xl bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                        {getPositionLabel(position)}
                      </p>
                      <p className="mt-2 text-sm sm:text-base font-medium text-gray-900">{question.question}</p>
                      {question.guidance?.objective && (
                        <p className="mt-1 text-xs text-gray-600">{question.guidance.objective}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleShowcaseNavigate(question.id)}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all hv-button"
                      >
                        Ouvrir la question
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showIncompleteAlert && hasPending && (
            <div className="border border-amber-200 rounded-xl bg-amber-50 p-4 text-amber-800 flex items-start gap-3" role="alert" aria-live="assertive">
              <AlertTriangle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Complétez les réponses obligatoires</p>
                <p className="text-sm">
                  Vous devez répondre à toutes les questions obligatoires avant de pouvoir accéder à la synthèse du projet.
                </p>
              </div>
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
              aria-disabled={hasPending}
              className={proceedButtonClassName}
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

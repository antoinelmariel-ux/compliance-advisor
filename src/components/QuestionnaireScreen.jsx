import React, { useEffect, useState } from '../react.js';
import { Info, Calendar, CheckCircle, ChevronLeft, ChevronRight } from './icons.js';
import { formatAnswer } from '../utils/questions.js';
import { renderTextWithLinks } from '../utils/linkify.js';

export const QuestionnaireScreen = ({ questions, currentIndex, answers, onAnswer, onNext, onBack, allQuestions }) => {
  const currentQuestion = questions[currentIndex];
  const questionBank = allQuestions || questions;

  if (!currentQuestion) {
    return null;
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const questionType = currentQuestion.type || 'choice';
  const currentAnswer = answers[currentQuestion.id];
  const multiSelection = Array.isArray(currentAnswer) ? currentAnswer : [];
  const isAnswerProvided = Array.isArray(currentAnswer) ? currentAnswer.length > 0 : !!currentAnswer;
  const canProceed = currentQuestion?.required ? isAnswerProvided : true;
  const [showGuidance, setShowGuidance] = useState(false);
  const questionTextId = `question-${currentQuestion.id}`;
  const instructionsId = `instructions-${currentQuestion.id}`;
  const guidancePanelId = `guidance-${currentQuestion.id}`;
  const progressLabelId = `progress-label-${currentQuestion.id}`;

  useEffect(() => {
    setShowGuidance(false);
  }, [currentQuestion.id]);

  const guidance = currentQuestion.guidance || {};
  const guidanceTips = Array.isArray(guidance.tips)
    ? guidance.tips.filter(tip => typeof tip === 'string' && tip.trim() !== '')
    : [];

  const operatorLabels = {
    equals: 'est égal à',
    not_equals: 'est différent de',
    contains: 'contient'
  };

  const conditionSummaries = (currentQuestion.conditions || []).map(condition => {
    const referenceQuestion = questionBank.find(q => q.id === condition.question);
    const label = referenceQuestion?.question || `Question ${condition.question}`;
    const formattedAnswer = formatAnswer(referenceQuestion, answers[condition.question]);

    return {
      label,
      operator: operatorLabels[condition.operator] || condition.operator,
      value: condition.value,
      answer: formattedAnswer
    };
  });

  const hasGuidanceContent = Boolean(
    (typeof guidance.objective === 'string' && guidance.objective.trim() !== '') ||
      (typeof guidance.details === 'string' && guidance.details.trim() !== '') ||
      guidanceTips.length > 0 ||
      conditionSummaries.length > 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8 hv-background">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 hv-surface">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span id={progressLabelId} className="text-sm font-medium text-gray-600 hv-text-muted" aria-live="polite">
                Question {currentIndex + 1} sur {questions.length}
              </span>
              <span className="text-sm font-medium text-indigo-600" aria-live="polite">
                {Math.round(progress)}% complété
              </span>
            </div>
            <div
              className="w-full bg-gray-200 rounded-full h-2 hv-progress"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-labelledby={progressLabelId}
            >
              <span
                className="block bg-indigo-600 h-2 rounded-full transition-all duration-300 hv-progress-indicator"
                style={{ width: `${progress}%` }}
              />
            </div>
            {currentIndex === 0 && (
              <p id={instructionsId} className="text-xs text-gray-500 mt-2 flex items-center hv-text-muted">
                <Info className="w-3 h-3 mr-1" />
                Certaines questions peuvent apparaître en fonction de vos réponses
              </p>
            )}
          </div>

          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 id={questionTextId} className="text-3xl font-bold text-gray-800">
                {currentQuestion.question}
              </h2>
              {!currentQuestion.required && (
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-gray-100 text-gray-600 rounded-full border border-gray-200 hv-badge">
                  Réponse facultative
                </span>
              )}
              {hasGuidanceContent && (
                <button
                  type="button"
                  onClick={() => setShowGuidance(prev => !prev)}
                  className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border transition-all hv-button hv-focus-ring ${
                    showGuidance
                      ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                      : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                  }`}
                  aria-expanded={showGuidance}
                  aria-controls={guidancePanelId}
                >
                  <Info className="w-4 h-4 mr-2" />
                  {showGuidance ? "Masquer l'aide" : 'Comprendre cette question'}
                </button>
              )}
            </div>

            {hasGuidanceContent && showGuidance && (
              <div
                id={guidancePanelId}
                className="mt-4 bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-sm text-gray-700 hv-surface"
                role="region"
                aria-label="Aide contextuelle"
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5 text-indigo-600">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-indigo-700">Guidage contextuel</h3>
                      {guidance.objective && (
                        <p className="mt-1 text-gray-700">{renderTextWithLinks(guidance.objective)}</p>
                      )}
                    </div>

                    {guidance.details && (
                      <p className="text-gray-700 leading-relaxed">{renderTextWithLinks(guidance.details)}</p>
                    )}

                    {conditionSummaries.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Pourquoi cette question apparaît</h4>
                        <ul className="mt-2 space-y-2">
                          {conditionSummaries.map((item, idx) => (
                            <li
                              key={`${item.label}-${idx}`}
                              className="bg-white border border-indigo-100 rounded-xl p-3 hv-surface"
                            >
                              <p className="text-sm font-medium text-gray-800">
                                • {item.label} {item.operator} "{item.value}"
                              </p>
                              {item.answer && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Votre réponse :{' '}
                                  <span className="font-medium text-gray-700">
                                    {renderTextWithLinks(item.answer)}
                                  </span>
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {guidanceTips.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Conseils pratiques</h4>
                        <ul className="mt-2 space-y-2 list-disc list-inside text-sm text-gray-700">
                          {guidanceTips.map((tip, idx) => (
                            <li key={idx}>{renderTextWithLinks(tip)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {questionType === 'date' && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3" htmlFor={`${currentQuestion.id}-date`}>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Sélectionnez une date
                </span>
              </label>
              <input
                type="date"
                value={currentAnswer || ''}
                onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
                id={`${currentQuestion.id}-date`}
                aria-describedby={currentIndex === 0 ? instructionsId : undefined}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hv-focus-ring"
              />
              <p className="text-xs text-gray-500 mt-2">
                Utilisez le sélecteur ou le format AAAA-MM-JJ pour garantir une analyse correcte.
              </p>
            </div>
          )}

          {questionType === 'choice' && (
            <fieldset className="space-y-3 mb-8" aria-describedby={currentIndex === 0 ? instructionsId : undefined}>
              <legend className="sr-only">{currentQuestion.question}</legend>
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === option;
                const optionId = `${currentQuestion.id}-option-${idx}`;

                return (
                  <label
                    key={idx}
                    htmlFor={optionId}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 cursor-pointer hv-focus-ring ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center">
                      <span
                        className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-gray-300'
                        }`}
                        aria-hidden="true"
                      >
                        {isSelected && <CheckCircle className="w-4 h-4" />}
                      </span>
                      <span className="font-medium">{option}</span>
                    </span>
                    <input
                      type="radio"
                      id={optionId}
                      name={currentQuestion.id}
                      value={option}
                      checked={isSelected}
                      onChange={() => onAnswer(currentQuestion.id, option)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </fieldset>
          )}

          {questionType === 'multi_choice' && (
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = multiSelection.includes(option);
                const optionId = `${currentQuestion.id}-multi-option-${idx}`;

                const toggleOption = () => {
                  if (isSelected) {
                    onAnswer(
                      currentQuestion.id,
                      multiSelection.filter(item => item !== option)
                    );
                  } else {
                    onAnswer(currentQuestion.id, [...multiSelection, option]);
                  }
                };

                return (
                  <label
                    key={idx}
                    htmlFor={optionId}
                    className={`w-full p-4 flex items-center justify-between rounded-xl border-2 transition-all duration-200 cursor-pointer hv-focus-ring ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={toggleOption}
                        id={optionId}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 hv-focus-ring"
                      />
                      <span className="ml-3 font-medium">{option}</span>
                    </div>
                    {isSelected && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                  </label>
                );
              })}
            </div>
          )}

          {questionType === 'text' && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3" htmlFor={`${currentQuestion.id}-text`}>
                Renseignez votre réponse
              </label>
              <input
                type="text"
                value={currentAnswer ?? ''}
                onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
                placeholder="Saisissez une réponse en une ligne"
                id={`${currentQuestion.id}-text`}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hv-focus-ring"
              />
              <p className="text-xs text-gray-500 mt-2">
                Utilisez ce champ pour des réponses courtes sous forme de texte libre.
              </p>
            </div>
          )}

          {questionType === 'long_text' && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3" htmlFor={`${currentQuestion.id}-long-text`}>
                Décrivez les éléments pertinents
              </label>
              <textarea
                value={currentAnswer ?? ''}
                onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
                placeholder="Renseignez ici les informations détaillées..."
                rows={5}
                id={`${currentQuestion.id}-long-text`}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y hv-focus-ring"
              />
              <p className="text-xs text-gray-500 mt-2">
                Ce champ accepte plusieurs lignes : structurez votre réponse librement.
              </p>
            </div>
          )}

          {questionType === 'number' && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3" htmlFor={`${currentQuestion.id}-number`}>
                Renseignez une valeur numérique
              </label>
              <input
                type="number"
                value={currentAnswer ?? ''}
                onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
                id={`${currentQuestion.id}-number`}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hv-focus-ring"
              />
              <p className="text-xs text-gray-500 mt-2">
                Vous pouvez saisir un nombre entier ou décimal.
              </p>
            </div>
          )}

          {questionType === 'url' && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3" htmlFor={`${currentQuestion.id}-url`}>
                Indiquez une adresse URL
              </label>
              <input
                type="url"
                value={currentAnswer || ''}
                onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
                placeholder="https://exemple.com"
                id={`${currentQuestion.id}-url`}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hv-focus-ring"
              />
              <p className="text-xs text-gray-500 mt-2">
                Incluez le protocole (https://) pour une URL valide.
              </p>
            </div>
          )}

          {questionType === 'file' && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3" htmlFor={`${currentQuestion.id}-file`}>
                Téléversez un fichier de référence
              </label>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  if (file) {
                    onAnswer(currentQuestion.id, {
                      name: file.name,
                      size: file.size,
                      type: file.type
                    });
                  } else {
                    onAnswer(currentQuestion.id, null);
                  }
                }}
                id={`${currentQuestion.id}-file`}
                className="w-full focus:outline-none hv-focus-ring"
              />
              {currentAnswer && (
                <p className="text-xs text-gray-500 mt-2">
                  {(() => {
                    const size = typeof currentAnswer.size === 'number'
                      ? ` (${Math.round(currentAnswer.size / 1024)} Ko)`
                      : '';
                    return `Fichier sélectionné : ${currentAnswer.name}${size}`;
                  })()}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onBack}
              disabled={currentIndex === 0}
              className="flex items-center px-6 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all hv-button"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Précédent
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={!canProceed}
              className="flex items-center px-6 py-3 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hv-button hv-button-primary"
            >
              {currentIndex === questions.length - 1 ? 'Voir la synthèse' : 'Suivant'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


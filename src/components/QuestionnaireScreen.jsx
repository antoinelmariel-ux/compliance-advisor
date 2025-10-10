import React, { useEffect, useState } from '../react.js';
import { Info, Calendar, CheckCircle, ChevronLeft, ChevronRight } from './icons.js';
import { formatAnswer } from '../utils/questions.js';

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
  const hasAnswer = Array.isArray(currentAnswer) ? currentAnswer.length > 0 : !!currentAnswer;
  const [showGuidance, setShowGuidance] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Question {currentIndex + 1} sur {questions.length}
              </span>
              <span className="text-sm font-medium text-indigo-600">
                {Math.round(progress)}% complété
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {currentIndex === 0 && (
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Info className="w-3 h-3 mr-1" />
                Certaines questions peuvent apparaître en fonction de vos réponses
              </p>
            )}
          </div>

          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-3xl font-bold text-gray-800">{currentQuestion.question}</h2>
              {hasGuidanceContent && (
                <button
                  onClick={() => setShowGuidance(prev => !prev)}
                  className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                    showGuidance
                      ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                      : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  <Info className="w-4 h-4 mr-2" />
                  {showGuidance ? "Masquer l'aide" : 'Comprendre cette question'}
                </button>
              )}
            </div>

            {hasGuidanceContent && showGuidance && (
              <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-sm text-gray-700">
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5 text-indigo-600">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-indigo-700">Guidage contextuel</h3>
                      {guidance.objective && (
                        <p className="mt-1 text-gray-700">{guidance.objective}</p>
                      )}
                    </div>

                    {guidance.details && (
                      <p className="text-gray-700 leading-relaxed">{guidance.details}</p>
                    )}

                    {conditionSummaries.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Pourquoi cette question apparaît</h4>
                        <ul className="mt-2 space-y-2">
                          {conditionSummaries.map((item, idx) => (
                            <li
                              key={`${item.label}-${idx}`}
                              className="bg-white border border-indigo-100 rounded-xl p-3"
                            >
                              <p className="text-sm font-medium text-gray-800">
                                • {item.label} {item.operator} "{item.value}"
                              </p>
                              {item.answer && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Votre réponse :{' '}
                                  <span className="font-medium text-gray-700">{item.answer}</span>
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
                            <li key={idx}>{tip}</li>
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
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Sélectionnez une date
                </span>
              </label>
              <input
                type="date"
                value={currentAnswer || ''}
                onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Utilisez le sélecteur ou le format AAAA-MM-JJ pour garantir une analyse correcte.
              </p>
            </div>
          )}

          {questionType === 'choice' && (
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === option;

                return (
                  <button
                    key={idx}
                    onClick={() => onAnswer(currentQuestion.id, option)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckCircle className="w-4 h-4" />}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {questionType === 'multi_choice' && (
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = multiSelection.includes(option);

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
                    className={`w-full p-4 flex items-center justify-between rounded-xl border-2 transition-all duration-200 cursor-pointer ${
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
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-3 font-medium">{option}</span>
                    </div>
                    {isSelected && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                  </label>
                );
              })}
            </div>
          )}

          {questionType === 'number' && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Renseignez une valeur numérique
              </label>
              <input
                type="number"
                value={currentAnswer ?? ''}
                onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Vous pouvez saisir un nombre entier ou décimal.
              </p>
            </div>
          )}

          {questionType === 'url' && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Indiquez une adresse URL
              </label>
              <input
                type="url"
                value={currentAnswer || ''}
                onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
                placeholder="https://exemple.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Incluez le protocole (https://) pour une URL valide.
              </p>
            </div>
          )}

          {questionType === 'file' && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
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
                className="w-full"
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
              onClick={onBack}
              disabled={currentIndex === 0}
              className="flex items-center px-6 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Précédent
            </button>

              <button
                onClick={onNext}
                disabled={!hasAnswer}
              className="flex items-center px-6 py-3 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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


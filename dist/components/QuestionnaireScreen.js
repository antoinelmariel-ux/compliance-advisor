import React, { useEffect, useMemo, useState } from '../react.js';
import { Info, Calendar, CheckCircle, ChevronLeft, ChevronRight, AlertTriangle, Save } from './icons.js';
import { formatAnswer } from '../utils/questions.js';
import { normalizeConditionGroups } from '../utils/conditionGroups.js';
import { renderTextWithLinks } from '../utils/linkify.js';
import { isShowcaseCriticalQuestion } from '../utils/showcaseRequirements.js';
var OPERATOR_LABELS = {
  equals: 'est égal à',
  not_equals: 'est différent de',
  contains: 'contient'
};
export var QuestionnaireScreen = _ref => {
  var {
    questions,
    currentIndex,
    answers,
    onAnswer,
    onNext,
    onBack,
    allQuestions,
    onSaveDraft,
    validationError
  } = _ref;
  var currentQuestion = questions[currentIndex];
  var questionBank = allQuestions || questions;
  if (!currentQuestion) {
    return null;
  }
  var progress = (currentIndex + 1) / questions.length * 100;
  var questionType = currentQuestion.type || 'choice';
  var currentAnswer = answers[currentQuestion.id];
  var multiSelection = Array.isArray(currentAnswer) ? currentAnswer : [];
  var [showGuidance, setShowGuidance] = useState(false);
  var questionTextId = "question-".concat(currentQuestion.id);
  var instructionsId = "instructions-".concat(currentQuestion.id);
  var guidancePanelId = "guidance-".concat(currentQuestion.id);
  var progressLabelId = "progress-label-".concat(currentQuestion.id);
  var hasValidationError = (validationError === null || validationError === void 0 ? void 0 : validationError.questionId) === currentQuestion.id;
  var isShowcaseCritical = isShowcaseCriticalQuestion(currentQuestion.id);
  useEffect(() => {
    setShowGuidance(false);
  }, [currentQuestion.id]);
  var guidance = currentQuestion.guidance || {};
  var guidanceTips = useMemo(() => Array.isArray(guidance.tips) ? guidance.tips.filter(tip => typeof tip === 'string' && tip.trim() !== '') : [], [guidance]);
  var conditionSummaries = useMemo(() => {
    var conditionGroups = normalizeConditionGroups(currentQuestion);
    return conditionGroups.map((group, groupIdx) => {
      var logic = group.logic === 'any' ? 'any' : 'all';
      var conditions = (group.conditions || []).map(condition => {
        var referenceQuestion = questionBank.find(q => q.id === condition.question);
        var label = (referenceQuestion === null || referenceQuestion === void 0 ? void 0 : referenceQuestion.question) || "Question ".concat(condition.question);
        var formattedAnswer = formatAnswer(referenceQuestion, answers[condition.question]);
        return {
          label,
          operator: OPERATOR_LABELS[condition.operator] || condition.operator,
          value: condition.value,
          answer: formattedAnswer
        };
      });
      return {
        logic,
        conditions,
        groupIdx
      };
    });
  }, [answers, currentQuestion, questionBank]);
  var hasConditions = useMemo(() => conditionSummaries.some(summary => summary.conditions.length > 0), [conditionSummaries]);
  var hasGuidanceContent = useMemo(() => {
    var hasObjective = typeof guidance.objective === 'string' && guidance.objective.trim() !== '';
    var hasDetails = typeof guidance.details === 'string' && guidance.details.trim() !== '';
    return hasObjective || hasDetails || guidanceTips.length > 0 || hasConditions;
  }, [guidance, guidanceTips, hasConditions]);
  var renderQuestionInput = () => {
    switch (questionType) {
      case 'date':
        return /*#__PURE__*/React.createElement("div", {
          className: "mb-8"
        }, /*#__PURE__*/React.createElement("label", {
          className: "block text-sm sm:text-base font-medium text-gray-700 mb-3",
          htmlFor: "".concat(currentQuestion.id, "-date")
        }, /*#__PURE__*/React.createElement("span", {
          className: "flex items-center"
        }, /*#__PURE__*/React.createElement(Calendar, {
          className: "w-4 h-4 mr-2"
        }), "S\xE9lectionnez une date")), /*#__PURE__*/React.createElement("input", {
          type: "date",
          value: currentAnswer !== null && currentAnswer !== void 0 ? currentAnswer : '',
          onChange: e => onAnswer(currentQuestion.id, e.target.value),
          id: "".concat(currentQuestion.id, "-date"),
          "aria-describedby": currentIndex === 0 ? instructionsId : undefined,
          className: "w-full px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hv-focus-ring"
        }), /*#__PURE__*/React.createElement("p", {
          className: "text-xs text-gray-500 mt-2"
        }, "Utilisez le s\xE9lecteur ou le format AAAA-MM-JJ pour garantir une analyse correcte."));
      case 'choice':
        return /*#__PURE__*/React.createElement("fieldset", {
          className: "space-y-3 mb-8",
          "aria-describedby": currentIndex === 0 ? instructionsId : undefined
        }, /*#__PURE__*/React.createElement("legend", {
          className: "sr-only"
        }, currentQuestion.question), currentQuestion.options.map((option, idx) => {
          var isSelected = answers[currentQuestion.id] === option;
          var optionId = "".concat(currentQuestion.id, "-option-").concat(idx);
          return /*#__PURE__*/React.createElement("label", {
            key: idx,
            htmlFor: optionId,
            className: "w-full p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border-2 transition-all duration-200 cursor-pointer hv-focus-ring ".concat(isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50')
          }, /*#__PURE__*/React.createElement("div", {
            className: "flex items-center"
          }, /*#__PURE__*/React.createElement("input", {
            type: "radio",
            id: optionId,
            name: currentQuestion.id,
            value: option,
            checked: isSelected,
            onChange: () => onAnswer(currentQuestion.id, option),
            className: "w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 hv-focus-ring"
          }), /*#__PURE__*/React.createElement("span", {
            className: "ml-3 font-medium text-sm sm:text-base"
          }, option)), isSelected && /*#__PURE__*/React.createElement(CheckCircle, {
            className: "w-5 h-5 text-indigo-600 self-end sm:self-auto"
          }));
        }));
      case 'multi_choice':
        return /*#__PURE__*/React.createElement("div", {
          className: "space-y-3 mb-8"
        }, currentQuestion.options.map((option, idx) => {
          var isSelected = multiSelection.includes(option);
          var optionId = "".concat(currentQuestion.id, "-multi-option-").concat(idx);
          var toggleOption = () => {
            if (isSelected) {
              onAnswer(currentQuestion.id, multiSelection.filter(item => item !== option));
            } else {
              onAnswer(currentQuestion.id, [...multiSelection, option]);
            }
          };
          return /*#__PURE__*/React.createElement("label", {
            key: idx,
            htmlFor: optionId,
            className: "w-full p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border-2 transition-all duration-200 cursor-pointer hv-focus-ring ".concat(isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50')
          }, /*#__PURE__*/React.createElement("div", {
            className: "flex items-center"
          }, /*#__PURE__*/React.createElement("input", {
            type: "checkbox",
            checked: isSelected,
            onChange: toggleOption,
            id: optionId,
            className: "w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 hv-focus-ring"
          }), /*#__PURE__*/React.createElement("span", {
            className: "ml-3 font-medium text-sm sm:text-base"
          }, option)), isSelected && /*#__PURE__*/React.createElement(CheckCircle, {
            className: "w-5 h-5 text-indigo-600 self-end sm:self-auto"
          }));
        }));
      case 'text':
        return /*#__PURE__*/React.createElement("div", {
          className: "mb-8"
        }, /*#__PURE__*/React.createElement("label", {
          className: "block text-sm sm:text-base font-medium text-gray-700 mb-3",
          htmlFor: "".concat(currentQuestion.id, "-text")
        }, "Renseignez votre r\xE9ponse"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          value: currentAnswer !== null && currentAnswer !== void 0 ? currentAnswer : '',
          onChange: e => onAnswer(currentQuestion.id, e.target.value),
          placeholder: "Saisissez une r\xE9ponse en une ligne",
          id: "".concat(currentQuestion.id, "-text"),
          className: "w-full px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hv-focus-ring"
        }), /*#__PURE__*/React.createElement("p", {
          className: "text-xs text-gray-500 mt-2"
        }, "Utilisez ce champ pour des r\xE9ponses courtes sous forme de texte libre."));
      case 'long_text':
        return /*#__PURE__*/React.createElement("div", {
          className: "mb-8"
        }, /*#__PURE__*/React.createElement("label", {
          className: "block text-sm sm:text-base font-medium text-gray-700 mb-3",
          htmlFor: "".concat(currentQuestion.id, "-long-text")
        }, "D\xE9crivez les \xE9l\xE9ments pertinents"), /*#__PURE__*/React.createElement("textarea", {
          value: currentAnswer !== null && currentAnswer !== void 0 ? currentAnswer : '',
          onChange: e => onAnswer(currentQuestion.id, e.target.value),
          placeholder: "Renseignez ici les informations d\xE9taill\xE9es...",
          rows: 5,
          id: "".concat(currentQuestion.id, "-long-text"),
          className: "w-full px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y hv-focus-ring"
        }), /*#__PURE__*/React.createElement("p", {
          className: "text-xs text-gray-500 mt-2"
        }, "Ce champ accepte plusieurs lignes : structurez votre r\xE9ponse librement."));
      case 'number':
        return /*#__PURE__*/React.createElement("div", {
          className: "mb-8"
        }, /*#__PURE__*/React.createElement("label", {
          className: "block text-sm sm:text-base font-medium text-gray-700 mb-3",
          htmlFor: "".concat(currentQuestion.id, "-number")
        }, "Renseignez une valeur num\xE9rique"), /*#__PURE__*/React.createElement("input", {
          type: "number",
          inputMode: "decimal",
          value: currentAnswer !== null && currentAnswer !== void 0 ? currentAnswer : '',
          onChange: e => onAnswer(currentQuestion.id, e.target.value),
          id: "".concat(currentQuestion.id, "-number"),
          className: "w-full px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hv-focus-ring"
        }), /*#__PURE__*/React.createElement("p", {
          className: "text-xs text-gray-500 mt-2"
        }, "Vous pouvez saisir un nombre entier ou d\xE9cimal."));
      case 'url':
        return /*#__PURE__*/React.createElement("div", {
          className: "mb-8"
        }, /*#__PURE__*/React.createElement("label", {
          className: "block text-sm sm:text-base font-medium text-gray-700 mb-3",
          htmlFor: "".concat(currentQuestion.id, "-url")
        }, "Indiquez une adresse URL"), /*#__PURE__*/React.createElement("input", {
          type: "url",
          value: currentAnswer !== null && currentAnswer !== void 0 ? currentAnswer : '',
          onChange: e => onAnswer(currentQuestion.id, e.target.value),
          placeholder: "https://exemple.com",
          id: "".concat(currentQuestion.id, "-url"),
          className: "w-full px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hv-focus-ring"
        }), /*#__PURE__*/React.createElement("p", {
          className: "text-xs text-gray-500 mt-2"
        }, "Incluez le protocole (https://) pour une URL valide."));
      case 'file':
        return /*#__PURE__*/React.createElement("div", {
          className: "mb-8"
        }, /*#__PURE__*/React.createElement("label", {
          className: "block text-sm sm:text-base font-medium text-gray-700 mb-3",
          htmlFor: "".concat(currentQuestion.id, "-file")
        }, "T\xE9l\xE9versez un fichier de r\xE9f\xE9rence"), /*#__PURE__*/React.createElement("input", {
          type: "file",
          onChange: e => {
            var file = e.target.files && e.target.files[0];
            if (file) {
              onAnswer(currentQuestion.id, {
                name: file.name,
                size: file.size,
                type: file.type
              });
            } else {
              onAnswer(currentQuestion.id, null);
            }
          },
          id: "".concat(currentQuestion.id, "-file"),
          className: "w-full focus:outline-none hv-focus-ring"
        }), currentAnswer && /*#__PURE__*/React.createElement("p", {
          className: "text-xs text-gray-500 mt-2"
        }, (() => {
          var size = typeof currentAnswer.size === 'number' ? " (".concat(Math.round(currentAnswer.size / 1024), " Ko)") : '';
          return "Fichier s\xE9lectionn\xE9 : ".concat(currentAnswer.name).concat(size);
        })()));
      default:
        return null;
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen hv-background px-4 py-16 sm:px-12"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl mx-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-2xl shadow-xl p-6 sm:p-8 hv-surface"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2"
  }, /*#__PURE__*/React.createElement("span", {
    id: progressLabelId,
    className: "text-sm font-medium text-gray-600 hv-text-muted",
    "aria-live": "polite"
  }, "Question ", currentIndex + 1, " sur ", questions.length), /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-medium text-indigo-600 sm:text-right",
    "aria-live": "polite"
  }, Math.round(progress), "% compl\xE9t\xE9")), /*#__PURE__*/React.createElement("div", {
    className: "w-full bg-gray-200 rounded-full h-2 hv-progress",
    role: "progressbar",
    "aria-valuenow": Math.round(progress),
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    "aria-labelledby": progressLabelId
  }, /*#__PURE__*/React.createElement("span", {
    className: "block bg-indigo-600 h-2 rounded-full transition-all duration-300 hv-progress-indicator",
    style: {
      width: "".concat(progress, "%")
    }
  })), currentIndex === 0 && /*#__PURE__*/React.createElement("p", {
    id: instructionsId,
    className: "text-xs text-gray-500 mt-2 flex items-center hv-text-muted"
  }, /*#__PURE__*/React.createElement(Info, {
    className: "w-3 h-3 mr-1"
  }), "Certaines questions peuvent appara\xEEtre en fonction de vos r\xE9ponses")), /*#__PURE__*/React.createElement("div", {
    className: "mb-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1"
  }, /*#__PURE__*/React.createElement("h2", {
    id: questionTextId,
    className: "text-2xl font-bold text-gray-800 sm:text-3xl"
  }, currentQuestion.question), (isShowcaseCritical || !currentQuestion.required) && /*#__PURE__*/React.createElement("div", {
    className: "mt-3 flex flex-wrap items-center gap-2"
  }, isShowcaseCritical && /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-amber-100 text-amber-700 rounded-full border border-amber-200 hv-badge"
  }, "Indispensable pour la vitrine"), !currentQuestion.required && !isShowcaseCritical && /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-gray-100 text-gray-600 rounded-full border border-gray-200 hv-badge"
  }, "R\xE9ponse facultative"))), hasGuidanceContent && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowGuidance(prev => !prev),
    className: "inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg border transition-all hv-button hv-focus-ring ".concat(showGuidance ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'),
    "aria-expanded": showGuidance,
    "aria-controls": guidancePanelId
  }, /*#__PURE__*/React.createElement(Info, {
    className: "w-4 h-4 mr-2"
  }), showGuidance ? "Masquer l'aide" : 'Comprendre cette question')), hasGuidanceContent && showGuidance && /*#__PURE__*/React.createElement("div", {
    id: guidancePanelId,
    className: "mt-4 bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-sm text-gray-700 hv-surface",
    role: "region",
    "aria-label": "Aide contextuelle"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mr-3 mt-0.5 text-indigo-600"
  }, /*#__PURE__*/React.createElement(Info, {
    className: "w-5 h-5"
  })), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-semibold text-indigo-700"
  }, "Guidage contextuel"), guidance.objective && /*#__PURE__*/React.createElement("p", {
    className: "mt-1 text-gray-700"
  }, renderTextWithLinks(guidance.objective))), guidance.details && /*#__PURE__*/React.createElement("p", {
    className: "text-gray-700 leading-relaxed"
  }, renderTextWithLinks(guidance.details)), hasConditions && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "text-xs font-semibold uppercase tracking-wide text-indigo-700"
  }, "Pourquoi cette question appara\xEEt"), conditionSummaries.length === 1 ? (() => {
    var logic = conditionSummaries[0].logic === 'any' ? 'any' : 'all';
    return /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-indigo-600 mt-1"
    }, "Elle s'affiche lorsque ", logic === 'any' ? "au moins une des conditions suivantes est remplie" : 'toutes les conditions suivantes sont remplies', ".");
  })() : /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-indigo-600 mt-1 space-y-1"
  }, /*#__PURE__*/React.createElement("p", null, "Cette question appara\xEEt lorsque", ' ', /*#__PURE__*/React.createElement("strong", {
    className: "text-indigo-700"
  }, "chaque groupe de conditions"), " ci-dessous est v\xE9rifi\xE9."), /*#__PURE__*/React.createElement("p", null, "\xC0 l'int\xE9rieur de chaque groupe, suivez la logique indiqu\xE9e (ET ou OU) pour les conditions list\xE9es.")), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 space-y-3"
  }, conditionSummaries.map((groupSummary, idx) => {
    var logicLabel = groupSummary.logic === 'any' ? 'OU' : 'ET';
    var connectorLabel = groupSummary.logic === 'any' ? 'OU' : 'ET';
    if (groupSummary.conditions.length === 0) {
      return null;
    }
    return /*#__PURE__*/React.createElement("div", {
      key: "condition-group-".concat(idx),
      className: "bg-white border border-indigo-100 rounded-xl p-3 hv-surface"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 mb-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-semibold text-indigo-700 uppercase tracking-wide"
    }, "Groupe ", idx + 1), /*#__PURE__*/React.createElement("span", {
      className: "text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full"
    }, "Logique ", logicLabel), idx > 0 && /*#__PURE__*/React.createElement("span", {
      className: "ml-auto text-[11px] font-semibold text-indigo-600 uppercase tracking-wide"
    }, "ET avec pr\xE9c\xE9dent")), /*#__PURE__*/React.createElement("ul", {
      className: "space-y-2"
    }, groupSummary.conditions.map((item, conditionIdx) => /*#__PURE__*/React.createElement("li", {
      key: "".concat(item.label, "-").concat(conditionIdx),
      className: "text-sm text-gray-700"
    }, /*#__PURE__*/React.createElement("p", {
      className: "font-medium text-gray-800"
    }, conditionIdx > 0 && /*#__PURE__*/React.createElement("span", {
      className: "inline-flex items-center px-2 py-0.5 mr-2 text-[11px] font-semibold uppercase tracking-wide rounded-full bg-indigo-100 text-indigo-700"
    }, connectorLabel), item.label, " ", item.operator, " \"", item.value, "\""), item.answer && /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-gray-500 mt-1"
    }, "Votre r\xE9ponse :", ' ', /*#__PURE__*/React.createElement("span", {
      className: "font-medium text-gray-700"
    }, renderTextWithLinks(item.answer)))))));
  }))), guidanceTips.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "text-xs font-semibold uppercase tracking-wide text-indigo-700"
  }, "Conseils pratiques"), /*#__PURE__*/React.createElement("ul", {
    className: "mt-2 space-y-2 list-disc list-inside text-sm text-gray-700"
  }, guidanceTips.map((tip, idx) => /*#__PURE__*/React.createElement("li", {
    key: idx
  }, renderTextWithLinks(tip))))))))), hasValidationError && /*#__PURE__*/React.createElement("div", {
    className: "mb-6",
    role: "alert",
    "aria-live": "assertive"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start space-x-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 hv-surface"
  }, /*#__PURE__*/React.createElement(AlertTriangle, {
    className: "w-5 h-5 mt-0.5"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-semibold"
  }, "R\xE9ponse obligatoire manquante"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm"
  }, validationError === null || validationError === void 0 ? void 0 : validationError.message)))), renderQuestionInput(), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col-reverse gap-3 sm:flex-row sm:items-center ".concat(currentIndex === 0 && !onSaveDraft ? 'sm:justify-end' : 'sm:justify-between')
  }, currentIndex > 0 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBack,
    className: "flex items-center justify-center px-6 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all hv-button w-full sm:w-auto text-sm sm:text-base"
  }, /*#__PURE__*/React.createElement(ChevronLeft, {
    className: "w-5 h-5 mr-2"
  }), "Pr\xE9c\xE9dent"), onSaveDraft && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onSaveDraft,
    className: "flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-amber-500 text-white hover:bg-amber-600 transition-all hv-button w-full sm:w-auto text-sm sm:text-base"
  }, /*#__PURE__*/React.createElement(Save, {
    className: "w-5 h-5 mr-2"
  }), "Enregistrer et quitter"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onNext,
    className: "flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hv-button hv-button-primary w-full sm:w-auto text-sm sm:text-base"
  }, currentIndex === questions.length - 1 ? 'Voir la synthèse' : 'Suivant', /*#__PURE__*/React.createElement(ChevronRight, {
    className: "w-5 h-5 ml-2"
  }))))));
};
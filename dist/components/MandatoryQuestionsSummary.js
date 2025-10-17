import React, { useEffect, useState } from '../react.js';
import { AlertTriangle, CheckCircle, ChevronRight } from './icons.js';
export var MandatoryQuestionsSummary = _ref => {
  var {
    pendingQuestions = [],
    totalQuestions = 0,
    missingShowcaseQuestions = [],
    onBackToQuestionnaire,
    onNavigateToQuestion,
    onProceedToSynthesis
  } = _ref;
  var hasPending = pendingQuestions.length > 0;
  var hasPendingShowcase = missingShowcaseQuestions.length > 0;
  var [showIncompleteAlert, setShowIncompleteAlert] = useState(false);
  useEffect(() => {
    if (!hasPending) {
      setShowIncompleteAlert(false);
    }
  }, [hasPending]);
  var summaryTitle = hasPending ? 'Questions obligatoires à compléter' : hasPendingShowcase ? 'Optimisez votre vitrine marketing' : 'Toutes les questions obligatoires sont complétées';
  var summaryDescription = hasPending ? 'Veuillez compléter ces réponses avant de pouvoir accéder à la synthèse du projet.' : hasPendingShowcase ? 'Certaines réponses optionnelles sont nécessaires pour afficher l’intégralité de la vitrine marketing.' : 'Vous pouvez désormais consulter la synthèse du projet.';
  var StatusIcon = hasPending || hasPendingShowcase ? AlertTriangle : CheckCircle;
  var handleShowcaseNavigate = questionId => {
    if (typeof onNavigateToQuestion === 'function') {
      onNavigateToQuestion(questionId);
    }
  };
  var getPositionLabel = function getPositionLabel(position) {
    var total = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : totalQuestions;
    if (position > 0 && total) {
      return "Question ".concat(position, " sur ").concat(total);
    }
    return 'Question obligatoire';
  };
  var handleNavigate = questionId => {
    if (typeof onNavigateToQuestion === 'function') {
      onNavigateToQuestion(questionId);
    }
  };
  var handleBack = () => {
    if (typeof onBackToQuestionnaire === 'function') {
      onBackToQuestionnaire();
    }
  };
  var handleProceed = () => {
    if (hasPending) {
      setShowIncompleteAlert(true);
      return;
    }
    setShowIncompleteAlert(false);
    if (typeof onProceedToSynthesis === 'function') {
      onProceedToSynthesis();
    }
  };
  var proceedButtonClassName = "w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all hv-button hv-button-primary ".concat(hasPending ? 'opacity-60 cursor-not-allowed focus:outline-none focus:ring-0' : '');
  return /*#__PURE__*/React.createElement("div", {
    className: "py-10 px-4 sm:px-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-4xl mx-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 hv-surface"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start gap-4"
  }, /*#__PURE__*/React.createElement(StatusIcon, {
    className: "w-6 h-6 mt-1 ".concat(hasPending || hasPendingShowcase ? 'text-amber-500' : 'text-emerald-500')
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold text-gray-900"
  }, summaryTitle), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600 mt-1"
  }, summaryDescription))), hasPending ? /*#__PURE__*/React.createElement("ul", {
    className: "space-y-4",
    "aria-label": "Questions obligatoires non r\xE9pondues"
  }, pendingQuestions.map(_ref2 => {
    var _question$guidance;
    var {
      question,
      position
    } = _ref2;
    var positionLabel = getPositionLabel(position);
    return /*#__PURE__*/React.createElement("li", {
      key: question.id,
      className: "border border-amber-200 rounded-xl bg-amber-50 p-4 sm:p-5 hv-surface"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      className: "text-xs font-semibold uppercase tracking-wide text-amber-700"
    }, positionLabel), /*#__PURE__*/React.createElement("p", {
      className: "mt-2 text-sm sm:text-base font-medium text-gray-900"
    }, question.question), ((_question$guidance = question.guidance) === null || _question$guidance === void 0 ? void 0 : _question$guidance.objective) && /*#__PURE__*/React.createElement("p", {
      className: "mt-1 text-xs text-gray-600"
    }, question.guidance.objective)), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => handleNavigate(question.id),
      className: "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium bg-white text-amber-700 border border-amber-300 hover:bg-amber-100 transition-all hv-button"
    }, "Compl\xE9ter la question", /*#__PURE__*/React.createElement(ChevronRight, {
      className: "w-4 h-4 ml-2"
    })))));
  })) : /*#__PURE__*/React.createElement("div", {
    className: "border border-emerald-200 rounded-xl bg-emerald-50 p-4 sm:p-5 hv-surface"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-emerald-800"
  }, "Toutes les r\xE9ponses obligatoires ont \xE9t\xE9 fournies. Vous pouvez g\xE9n\xE9rer la synth\xE8se quand vous le souhaitez.")), hasPendingShowcase && /*#__PURE__*/React.createElement("div", {
    className: "border border-indigo-200 rounded-xl bg-indigo-50 p-4 sm:p-5 space-y-4 hv-surface"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-semibold uppercase tracking-wide text-indigo-700"
  }, "Questions indispensables pour la vitrine marketing"), /*#__PURE__*/React.createElement("p", {
    className: "mt-1 text-sm text-indigo-800"
  }, "Ces r\xE9ponses optionnelles compl\xE8tent les blocs affich\xE9s au sein du showcase.")), /*#__PURE__*/React.createElement("ul", {
    className: "space-y-3",
    "aria-label": "Questions importantes pour la vitrine"
  }, missingShowcaseQuestions.map(_ref3 => {
    var _question$guidance2;
    var {
      question,
      position
    } = _ref3;
    return /*#__PURE__*/React.createElement("li", {
      key: question.id,
      className: "border border-indigo-200 rounded-xl bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      className: "text-xs font-semibold uppercase tracking-wide text-indigo-700"
    }, getPositionLabel(position)), /*#__PURE__*/React.createElement("p", {
      className: "mt-2 text-sm sm:text-base font-medium text-gray-900"
    }, question.question), ((_question$guidance2 = question.guidance) === null || _question$guidance2 === void 0 ? void 0 : _question$guidance2.objective) && /*#__PURE__*/React.createElement("p", {
      className: "mt-1 text-xs text-gray-600"
    }, question.guidance.objective)), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => handleShowcaseNavigate(question.id),
      className: "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all hv-button"
    }, "Ouvrir la question", /*#__PURE__*/React.createElement(ChevronRight, {
      className: "w-4 h-4 ml-2"
    }))));
  }))), showIncompleteAlert && hasPending && /*#__PURE__*/React.createElement("div", {
    className: "border border-amber-200 rounded-xl bg-amber-50 p-4 text-amber-800 flex items-start gap-3",
    role: "alert",
    "aria-live": "assertive"
  }, /*#__PURE__*/React.createElement(AlertTriangle, {
    className: "w-5 h-5 mt-0.5"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-semibold"
  }, "Compl\xE9tez les r\xE9ponses obligatoires"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm"
  }, "Vous devez r\xE9pondre \xE0 toutes les questions obligatoires avant de pouvoir acc\xE9der \xE0 la synth\xE8se du projet."))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleBack,
    className: "w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-gray-700 border border-gray-300 hover:bg-gray-100 transition-all hv-button"
  }, "Retour au questionnaire"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleProceed,
    "aria-disabled": hasPending,
    className: proceedButtonClassName
  }, "Acc\xE9der \xE0 la synth\xE8se", /*#__PURE__*/React.createElement(ChevronRight, {
    className: "w-5 h-5 ml-2"
  }))))));
};
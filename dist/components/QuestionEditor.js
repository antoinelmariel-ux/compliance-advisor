function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import React, { useEffect, useRef, useState } from '../react.js';
import { Plus, Trash2, GripVertical } from './icons.js';
import { applyConditionGroups, normalizeConditionGroups } from '../utils/conditionGroups.js';
export var QuestionEditor = _ref => {
  var {
    question,
    onSave,
    onCancel,
    allQuestions
  } = _ref;
  var ensureGuidance = guidance => {
    if (!guidance || typeof guidance !== 'object') {
      return {
        objective: '',
        details: '',
        tips: []
      };
    }
    return {
      objective: guidance.objective || '',
      details: guidance.details || '',
      tips: Array.isArray(guidance.tips) ? guidance.tips : []
    };
  };
  var buildQuestionState = source => {
    var base = _objectSpread(_objectSpread({}, source), {}, {
      type: source.type || 'choice',
      options: source.options || [],
      guidance: ensureGuidance(source.guidance)
    });
    var groups = normalizeConditionGroups(base);
    return applyConditionGroups(base, groups);
  };
  var [editedQuestion, setEditedQuestion] = useState(() => buildQuestionState(question));
  useEffect(() => {
    setEditedQuestion(buildQuestionState(question));
  }, [question]);
  var [draggedOptionIndex, setDraggedOptionIndex] = useState(null);
  var [dragOverIndex, setDragOverIndex] = useState(null);
  var questionType = editedQuestion.type || 'choice';
  var typeUsesOptions = questionType === 'choice' || questionType === 'multi_choice';
  var normalizedGuidance = ensureGuidance(editedQuestion.guidance);
  var updateGuidanceField = (field, value) => {
    setEditedQuestion(prev => _objectSpread(_objectSpread({}, prev), {}, {
      guidance: _objectSpread(_objectSpread({}, ensureGuidance(prev.guidance)), {}, {
        [field]: value
      })
    }));
  };
  var addGuidanceTip = () => {
    setEditedQuestion(prev => {
      var current = ensureGuidance(prev.guidance);
      return _objectSpread(_objectSpread({}, prev), {}, {
        guidance: _objectSpread(_objectSpread({}, current), {}, {
          tips: [...current.tips, '']
        })
      });
    });
  };
  var updateGuidanceTip = (index, value) => {
    setEditedQuestion(prev => {
      var current = ensureGuidance(prev.guidance);
      var newTips = [...current.tips];
      newTips[index] = value;
      return _objectSpread(_objectSpread({}, prev), {}, {
        guidance: _objectSpread(_objectSpread({}, current), {}, {
          tips: newTips
        })
      });
    });
  };
  var deleteGuidanceTip = index => {
    setEditedQuestion(prev => {
      var current = ensureGuidance(prev.guidance);
      return _objectSpread(_objectSpread({}, prev), {}, {
        guidance: _objectSpread(_objectSpread({}, current), {}, {
          tips: current.tips.filter((_, i) => i !== index)
        })
      });
    });
  };
  var handleTypeChange = newType => {
    if (newType === 'choice' || newType === 'multi_choice') {
      setEditedQuestion(prev => _objectSpread(_objectSpread({}, prev), {}, {
        type: newType,
        options: prev.options && prev.options.length > 0 ? prev.options : ['Option 1', 'Option 2']
      }));
      return;
    }
    setEditedQuestion(prev => _objectSpread(_objectSpread({}, prev), {}, {
      type: newType,
      options: []
    }));
  };
  var reorderOptions = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setEditedQuestion(prev => {
      var newOptions = [...prev.options];
      var [moved] = newOptions.splice(fromIndex, 1);
      newOptions.splice(toIndex, 0, moved);
      return _objectSpread(_objectSpread({}, prev), {}, {
        options: newOptions
      });
    });
  };
  var handleDragStart = (event, index) => {
    if (event !== null && event !== void 0 && event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
    setDraggedOptionIndex(index);
    setDragOverIndex(index);
  };
  var handleDragEnter = index => {
    if (draggedOptionIndex === null || draggedOptionIndex === index) return;
    reorderOptions(draggedOptionIndex, index);
    setDraggedOptionIndex(index);
    setDragOverIndex(index);
  };
  var handleDragEnd = () => {
    setDraggedOptionIndex(null);
    setDragOverIndex(null);
  };
  var updateConditionGroupsState = updater => {
    setEditedQuestion(prev => {
      var currentGroups = Array.isArray(prev.conditionGroups) ? prev.conditionGroups : [];
      var nextGroups = updater(currentGroups);
      return applyConditionGroups(prev, nextGroups);
    });
  };
  var addConditionGroup = () => {
    updateConditionGroupsState(groups => [...groups, {
      logic: 'all',
      conditions: [{
        question: '',
        operator: 'equals',
        value: ''
      }]
    }]);
  };
  var updateConditionGroupLogic = (groupIndex, logic) => {
    updateConditionGroupsState(groups => {
      var updated = [...groups];
      var target = updated[groupIndex] || {
        logic: 'all',
        conditions: []
      };
      updated[groupIndex] = _objectSpread(_objectSpread({}, target), {}, {
        logic: logic === 'any' ? 'any' : 'all'
      });
      return updated;
    });
  };
  var addConditionToGroup = groupIndex => {
    updateConditionGroupsState(groups => {
      var updated = [...groups];
      var target = updated[groupIndex] || {
        logic: 'all',
        conditions: []
      };
      updated[groupIndex] = _objectSpread(_objectSpread({}, target), {}, {
        conditions: [...target.conditions, {
          question: '',
          operator: 'equals',
          value: ''
        }]
      });
      return updated;
    });
  };
  var updateConditionInGroup = (groupIndex, conditionIndex, field, value) => {
    updateConditionGroupsState(groups => {
      var updated = [...groups];
      var target = updated[groupIndex] || {
        logic: 'all',
        conditions: []
      };
      var conditions = [...(target.conditions || [])];
      var condition = _objectSpread({}, conditions[conditionIndex]);
      condition[field] = value;
      conditions[conditionIndex] = condition;
      updated[groupIndex] = _objectSpread(_objectSpread({}, target), {}, {
        conditions
      });
      return updated;
    });
  };
  var deleteConditionFromGroup = (groupIndex, conditionIndex) => {
    updateConditionGroupsState(groups => {
      var updated = [...groups];
      var target = updated[groupIndex] || {
        logic: 'all',
        conditions: []
      };
      var conditions = (target.conditions || []).filter((_, idx) => idx !== conditionIndex);
      updated[groupIndex] = _objectSpread(_objectSpread({}, target), {}, {
        conditions
      });
      return updated;
    });
  };
  var deleteConditionGroup = groupIndex => {
    updateConditionGroupsState(groups => groups.filter((_, idx) => idx !== groupIndex));
  };
  var addOption = () => {
    setEditedQuestion(_objectSpread(_objectSpread({}, editedQuestion), {}, {
      options: [...editedQuestion.options, 'Nouvelle option']
    }));
  };
  var updateOption = (index, value) => {
    var newOptions = [...editedQuestion.options];
    newOptions[index] = value;
    setEditedQuestion(_objectSpread(_objectSpread({}, editedQuestion), {}, {
      options: newOptions
    }));
  };
  var deleteOption = index => {
    if (editedQuestion.options.length > 1) {
      setEditedQuestion(_objectSpread(_objectSpread({}, editedQuestion), {}, {
        options: editedQuestion.options.filter((_, i) => i !== index)
      }));
    }
  };

  // Filtrer les questions pour ne pas inclure la question en cours d'édition
  var availableQuestions = allQuestions.filter(q => q.id !== editedQuestion.id);
  var conditionGroups = Array.isArray(editedQuestion.conditionGroups) ? editedQuestion.conditionGroups : [];
  var dialogTitleId = 'question-editor-title';
  var handleSave = () => {
    onSave(applyConditionGroups(editedQuestion, conditionGroups));
  };
  var overlayRef = useRef(null);
  var titleRef = useRef(null);
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.scrollTo({
        top: 0
      });
    }
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    ref: overlayRef,
    className: "fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto",
    role: "presentation"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-4 sm:my-8 overflow-y-auto hv-surface hv-modal-panel",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": dialogTitleId
  }, /*#__PURE__*/React.createElement("div", {
    className: "sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl hv-surface"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("h2", {
    id: dialogTitleId,
    ref: titleRef,
    tabIndex: -1,
    className: "text-3xl font-bold text-gray-800 focus:outline-none"
  }, "\xC9dition de question"), /*#__PURE__*/React.createElement("div", {
    className: "flex space-x-3"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onCancel,
    className: "px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-all hv-button"
  }, "Annuler"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleSave,
    className: "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all hv-button hv-button-primary"
  }, "Enregistrer")))), /*#__PURE__*/React.createElement("div", {
    className: "px-8 py-6 space-y-8"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-gray-800 mb-4"
  }, "\uD83D\uDCCB Informations de base"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-gray-700 mb-2"
  }, "Identifiant de la question"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: editedQuestion.id,
    disabled: true,
    className: "w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mt-1"
  }, "L'identifiant ne peut pas \xEAtre modifi\xE9")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-gray-700 mb-2"
  }, "Texte de la question"), /*#__PURE__*/React.createElement("textarea", {
    value: editedQuestion.question,
    onChange: e => setEditedQuestion(_objectSpread(_objectSpread({}, editedQuestion), {}, {
      question: e.target.value
    })),
    className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
    rows: "2",
    placeholder: "Ex: Quel est le p\xE9rim\xE8tre de votre projet ?"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-gray-700 mb-2"
  }, "Type de question"), /*#__PURE__*/React.createElement("select", {
    value: questionType,
    onChange: e => handleTypeChange(e.target.value),
    className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  }, /*#__PURE__*/React.createElement("option", {
    value: "choice"
  }, "Liste de choix"), /*#__PURE__*/React.createElement("option", {
    value: "date"
  }, "Date"), /*#__PURE__*/React.createElement("option", {
    value: "multi_choice"
  }, "Choix multiples"), /*#__PURE__*/React.createElement("option", {
    value: "number"
  }, "Valeur num\xE9rique"), /*#__PURE__*/React.createElement("option", {
    value: "url"
  }, "Lien URL"), /*#__PURE__*/React.createElement("option", {
    value: "file"
  }, "Fichier"), /*#__PURE__*/React.createElement("option", {
    value: "text"
  }, "Texte libre (1 ligne)"), /*#__PURE__*/React.createElement("option", {
    value: "long_text"
  }, "Texte libre (plusieurs lignes)")), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mt-1"
  }, "Choisissez le format adapt\xE9 : liste simple ou multiple, date, valeurs num\xE9riques, URL, fichier ou zone de texte libre.")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: editedQuestion.required,
    onChange: e => setEditedQuestion(_objectSpread(_objectSpread({}, editedQuestion), {}, {
      required: e.target.checked
    })),
    className: "w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
  }), /*#__PURE__*/React.createElement("label", {
    className: "ml-2 text-sm font-medium text-gray-700"
  }, "Question obligatoire")))), /*#__PURE__*/React.createElement("div", null, typeUsesOptions ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-4"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-gray-800"
  }, questionType === 'multi_choice' ? '✅ Options de sélection multiple' : '✅ Options de réponse'), /*#__PURE__*/React.createElement("button", {
    onClick: addOption,
    className: "flex items-center px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all text-sm font-medium"
  }, /*#__PURE__*/React.createElement(Plus, {
    className: "w-4 h-4 mr-1"
  }), "Ajouter une option")), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mb-3"
  }, "Glissez-d\xE9posez les options pour modifier leur ordre d'affichage.", questionType === 'multi_choice' && ' Les répondants pourront sélectionner plusieurs valeurs.'), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, editedQuestion.options.map((option, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "flex items-center space-x-2 rounded-lg border border-transparent bg-white p-2 transition-colors ".concat(dragOverIndex === idx ? 'border-indigo-200 bg-indigo-50 shadow' : 'shadow-sm'),
    onDragOver: e => {
      e.preventDefault();
      setDragOverIndex(idx);
    },
    onDragEnter: () => handleDragEnter(idx),
    onDragLeave: e => {
      e.preventDefault();
      if (draggedOptionIndex !== idx) {
        setDragOverIndex(null);
      }
    },
    onDrop: e => {
      e.preventDefault();
      handleDragEnd();
    },
    onDragEnd: handleDragEnd
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    draggable: true,
    onDragStart: event => handleDragStart(event, idx),
    className: "cursor-grab px-2 py-3 text-gray-400 hover:text-indigo-600 focus:outline-none",
    "aria-label": "R\xE9ordonner l'option ".concat(idx + 1)
  }, /*#__PURE__*/React.createElement(GripVertical, {
    className: "w-4 h-4"
  })), /*#__PURE__*/React.createElement("span", {
    className: "text-gray-500 font-medium w-6 text-center"
  }, idx + 1, "."), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: option,
    onChange: e => updateOption(idx, e.target.value),
    className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500",
    placeholder: "Texte de l'option..."
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => deleteOption(idx),
    disabled: editedQuestion.options.length === 1,
    className: "p-2 text-red-600 hover:bg-red-50 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
  }, /*#__PURE__*/React.createElement(Trash2, {
    className: "w-4 h-4"
  })))))) : /*#__PURE__*/React.createElement("div", {
    className: "bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm text-indigo-700"
  }, "Ce type de question ne n\xE9cessite pas de liste d'options pr\xE9d\xE9finies.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-gray-800 mb-3"
  }, "\uD83E\uDDED Guidage contextuel"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600 mb-4"
  }, "Renseignez les informations d'aide affich\xE9es au chef de projet pour expliquer la question."), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-gray-700 mb-2"
  }, "Objectif p\xE9dagogique"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: normalizedGuidance.objective,
    onChange: e => updateGuidanceField('objective', e.target.value),
    className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
    placeholder: "Pourquoi cette question est pos\xE9e..."
  })), /*#__PURE__*/React.createElement("div", {
    className: "md:col-span-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-gray-700 mb-2"
  }, "Message principal"), /*#__PURE__*/React.createElement("textarea", {
    value: normalizedGuidance.details,
    onChange: e => updateGuidanceField('details', e.target.value),
    className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
    rows: "3",
    placeholder: "Pr\xE9cisez le contexte, les impacts compliance ou les attentes..."
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mt-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-medium text-gray-700"
  }, "Conseils pratiques"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: addGuidanceTip,
    className: "flex items-center px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all"
  }, /*#__PURE__*/React.createElement(Plus, {
    className: "w-3 h-3 mr-1"
  }), "Ajouter un conseil")), normalizedGuidance.tips.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4"
  }, "Ajoutez un ou plusieurs conseils op\xE9rationnels pour aider le chef de projet \xE0 r\xE9pondre correctement.") : /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, normalizedGuidance.tips.map((tip, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "flex items-center space-x-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-gray-400 text-sm w-6"
  }, "#", idx + 1), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: tip,
    onChange: e => updateGuidanceTip(idx, e.target.value),
    className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500",
    placeholder: "Conseil pratique..."
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => deleteGuidanceTip(idx),
    className: "p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
  }, /*#__PURE__*/React.createElement(Trash2, {
    className: "w-4 h-4"
  }))))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-gray-800"
  }, "\uD83C\uDFAF Conditions d'affichage"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600 mt-1"
  }, "D\xE9finissez quand cette question doit appara\xEEtre dans le questionnaire")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: addConditionGroup,
    className: "flex items-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all text-sm font-medium"
  }, /*#__PURE__*/React.createElement(Plus, {
    className: "w-4 h-4 mr-1"
  }), "Ajouter un groupe")), conditionGroups.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "bg-gray-50 rounded-lg p-6 text-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-gray-600 mb-2"
  }, "Cette question s'affiche toujours"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500"
  }, "Cr\xE9ez un groupe pour afficher cette question uniquement dans certains cas"), /*#__PURE__*/React.createElement("div", {
    className: "mt-4"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: addConditionGroup,
    className: "inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
  }, /*#__PURE__*/React.createElement(Plus, {
    className: "w-4 h-4 mr-2"
  }), "Cr\xE9er un groupe de conditions"))) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200"
  }, conditionGroups.length === 1 ? (() => {
    var logic = conditionGroups[0].logic === 'any' ? 'any' : 'all';
    var logicLabel = logic === 'any' ? 'OU' : 'ET';
    var logicDescription = logic === 'any' ? 'au moins une des conditions ci-dessous est remplie' : 'toutes les conditions ci-dessous sont remplies';
    return /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-blue-900"
    }, /*#__PURE__*/React.createElement("strong", null, "\uD83D\uDCA1 Logique :"), " Cette question s'affichera si", ' ', /*#__PURE__*/React.createElement("strong", {
      className: "text-blue-700"
    }, logicDescription), ' ', "(logique ", logicLabel, ").");
  })() : /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 text-sm text-blue-900"
  }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "\uD83D\uDCA1 Logique :"), " Cette question s'affiche lorsque", ' ', /*#__PURE__*/React.createElement("strong", {
    className: "text-blue-700"
  }, "chaque groupe de conditions"), " ci-dessous est valid\xE9 (logique globale ", /*#__PURE__*/React.createElement("strong", null, "ET"), ")."), /*#__PURE__*/React.createElement("p", null, "\xC0 l'int\xE9rieur d'un groupe, choisissez si", ' ', /*#__PURE__*/React.createElement("strong", {
    className: "text-blue-700"
  }, "toutes"), " les conditions doivent \xEAtre vraies (ET) ou si", ' ', /*#__PURE__*/React.createElement("strong", {
    className: "text-blue-700"
  }, "au moins une"), " suffit (OU)."))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, conditionGroups.map((group, groupIdx) => {
    var logic = group.logic === 'any' ? 'any' : 'all';
    var conditions = Array.isArray(group.conditions) ? group.conditions : [];
    var connectorLabel = logic === 'any' ? 'OU' : 'ET';
    return /*#__PURE__*/React.createElement("div", {
      key: groupIdx
    }, groupIdx > 0 && /*#__PURE__*/React.createElement("div", {
      className: "flex justify-center -mb-3",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("span", {
      className: "bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow"
    }, "ET")), /*#__PURE__*/React.createElement("div", {
      className: "bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap items-center gap-3 mb-4"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-gray-700"
    }, "Groupe ", groupIdx + 1), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 text-xs text-green-800 uppercase tracking-wide"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-semibold"
    }, "Logique interne"), /*#__PURE__*/React.createElement("select", {
      value: logic,
      onChange: e => updateConditionGroupLogic(groupIdx, e.target.value),
      className: "px-3 py-1.5 border border-green-200 rounded-lg bg-white text-xs focus:ring-2 focus:ring-green-400"
    }, /*#__PURE__*/React.createElement("option", {
      value: "all"
    }, "Toutes les conditions (ET)"), /*#__PURE__*/React.createElement("option", {
      value: "any"
    }, "Au moins une condition (OU)"))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => deleteConditionGroup(groupIdx),
      className: "ml-auto p-2 text-red-600 hover:bg-red-50 rounded transition-all",
      "aria-label": "Supprimer le groupe ".concat(groupIdx + 1)
    }, /*#__PURE__*/React.createElement(Trash2, {
      className: "w-4 h-4"
    }))), conditions.length === 0 ? /*#__PURE__*/React.createElement("div", {
      className: "bg-white border border-dashed border-green-200 rounded-lg p-4 text-sm text-green-700"
    }, /*#__PURE__*/React.createElement("p", null, "Ajoutez une condition pour d\xE9finir ce groupe."), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => addConditionToGroup(groupIdx),
      className: "mt-3 inline-flex items-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all text-sm font-medium"
    }, /*#__PURE__*/React.createElement(Plus, {
      className: "w-4 h-4 mr-1"
    }), "Ajouter une condition")) : /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, conditions.map((condition, idx) => /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: "bg-white rounded-lg border border-green-200 p-4 shadow-sm"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center space-x-3 mb-3"
    }, idx > 0 && /*#__PURE__*/React.createElement("span", {
      className: "bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold"
    }, connectorLabel), /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-gray-700"
    }, "Condition ", idx + 1), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => deleteConditionFromGroup(groupIdx, idx),
      className: "ml-auto p-1 text-red-600 hover:bg-red-50 rounded transition-all"
    }, /*#__PURE__*/React.createElement(Trash2, {
      className: "w-4 h-4"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-3 gap-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-xs font-medium text-gray-600 mb-1"
    }, "Si la question"), /*#__PURE__*/React.createElement("select", {
      value: condition.question,
      onChange: e => updateConditionInGroup(groupIdx, idx, 'question', e.target.value),
      className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "S\xE9lectionner..."), availableQuestions.map(q => /*#__PURE__*/React.createElement("option", {
      key: q.id,
      value: q.id
    }, q.id, " - ", q.question.substring(0, 30), "...")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-xs font-medium text-gray-600 mb-1"
    }, "Op\xE9rateur"), /*#__PURE__*/React.createElement("select", {
      value: condition.operator,
      onChange: e => updateConditionInGroup(groupIdx, idx, 'operator', e.target.value),
      className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
    }, /*#__PURE__*/React.createElement("option", {
      value: "equals"
    }, "Est \xE9gal \xE0 (=)"), /*#__PURE__*/React.createElement("option", {
      value: "not_equals"
    }, "Est diff\xE9rent de (\u2260)"), /*#__PURE__*/React.createElement("option", {
      value: "contains"
    }, "Contient"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-xs font-medium text-gray-600 mb-1"
    }, "Valeur"), (() => {
      if (!condition.question) {
        return /*#__PURE__*/React.createElement("input", {
          type: "text",
          value: condition.value,
          onChange: e => updateConditionInGroup(groupIdx, idx, 'value', e.target.value),
          className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500",
          placeholder: "Valeur..."
        });
      }
      var selectedQuestion = allQuestions.find(q => q.id === condition.question);
      var selectedType = (selectedQuestion === null || selectedQuestion === void 0 ? void 0 : selectedQuestion.type) || 'choice';
      var usesOptions = ['choice', 'multi_choice'].includes(selectedType);
      if (usesOptions) {
        return /*#__PURE__*/React.createElement("select", {
          value: condition.value,
          onChange: e => updateConditionInGroup(groupIdx, idx, 'value', e.target.value),
          className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
        }, /*#__PURE__*/React.createElement("option", {
          value: ""
        }, "S\xE9lectionner..."), ((selectedQuestion === null || selectedQuestion === void 0 ? void 0 : selectedQuestion.options) || []).map((opt, i) => /*#__PURE__*/React.createElement("option", {
          key: i,
          value: opt
        }, opt)));
      }
      var inputType = selectedType === 'number' ? 'number' : 'text';
      var placeholder = selectedType === 'date' ? 'AAAA-MM-JJ' : selectedType === 'url' ? 'https://...' : 'Valeur...';
      return /*#__PURE__*/React.createElement("input", {
        type: inputType,
        value: condition.value,
        onChange: e => updateConditionInGroup(groupIdx, idx, 'value', e.target.value),
        className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500",
        placeholder: placeholder
      });
    })())))), /*#__PURE__*/React.createElement("div", {
      className: "flex justify-end"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => addConditionToGroup(groupIdx),
      className: "inline-flex items-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all text-sm font-medium"
    }, /*#__PURE__*/React.createElement(Plus, {
      className: "w-4 h-4 mr-1"
    }), "Ajouter une condition")))));
  })))))));
};
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import React, { useEffect, useState } from '../react.js';
import { Settings, Plus, Edit, Trash2, Eye, Info, GripVertical, Download } from './icons.js';
import { QuestionEditor } from './QuestionEditor.js';
import { RuleEditor } from './RuleEditor.js';
import { renderTextWithLinks } from '../utils/linkify.js';
import { normalizeConditionGroups } from '../utils/conditionGroups.js';
import { normalizeTimingRequirement } from '../utils/rules.js';
import { sanitizeRuleCondition } from '../utils/ruleConditions.js';
var QUESTION_TYPE_META = {
  choice: {
    label: 'Liste de choix',
    description: "Affiche une liste d'options exclusives."
  },
  multi_choice: {
    label: 'Choix multiples',
    description: 'Permet de sélectionner plusieurs réponses.'
  },
  date: {
    label: 'Date',
    description: 'Attend la sélection d\'une date précise.'
  },
  number: {
    label: 'Valeur numérique',
    description: 'Attend un nombre entier ou décimal.'
  },
  url: {
    label: 'Lien URL',
    description: 'Attend un lien complet (https://...).'
  },
  file: {
    label: 'Fichier',
    description: 'Permet de téléverser un document de référence.'
  },
  text: {
    label: 'Texte libre (1 ligne)',
    description: 'Attend une réponse texte courte.'
  },
  long_text: {
    label: 'Texte libre (plusieurs lignes)',
    description: 'Attend une réponse texte détaillée.'
  }
};
var getQuestionTypeMeta = type => {
  var key = type || 'choice';
  return QUESTION_TYPE_META[key] || QUESTION_TYPE_META.choice;
};
var buildConditionSummary = (question, allQuestions) => {
  var conditionGroups = normalizeConditionGroups(question);
  var summaries = [];
  for (var groupIndex = 0; groupIndex < conditionGroups.length; groupIndex += 1) {
    var group = conditionGroups[groupIndex];
    var conditions = Array.isArray(group && group.conditions) ? group.conditions : [];
    if (conditions.length === 0) {
      continue;
    }
    var parts = [];
    var _loop = function _loop() {
      var condition = conditions[conditionIndex];
      if (!condition) {
        return 1; // continue
      }
      var refQuestion = allQuestions.find(item => item.id === condition.question);
      var label = refQuestion ? refQuestion.question : "Question ".concat(condition.question);
      var operator = condition.operator === 'equals' ? '=' : condition.operator === 'not_equals' ? '≠' : condition.operator === 'contains' ? 'contient' : condition.operator || '=';
      var value = typeof condition.value === 'string' ? condition.value : JSON.stringify(condition.value);
      var connector = conditionIndex > 0 ? group.logic === 'any' ? 'OU' : 'ET' : '';
      parts.push({
        label,
        operator,
        value,
        connector
      });
    };
    for (var conditionIndex = 0; conditionIndex < conditions.length; conditionIndex += 1) {
      if (_loop()) continue;
    }
    if (parts.length > 0) {
      summaries.push({
        index: groupIndex + 1,
        logic: group.logic === 'any' ? 'OU' : 'ET',
        parts
      });
    }
  }
  return summaries;
};
var buildRuleConditionSummary = (rule, questions) => {
  var groups = normalizeConditionGroups(rule, sanitizeRuleCondition);
  var formatted = [];
  for (var groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
    var group = groups[groupIndex];
    var conditions = Array.isArray(group && group.conditions) ? group.conditions : [];
    if (conditions.length === 0) {
      continue;
    }
    var items = [];
    var _loop2 = function _loop2() {
        var condition = conditions[conditionIndex];
        if (!condition) {
          return 0; // continue
        }
        if (condition.type === 'timing') {
          var requirement = normalizeTimingRequirement(condition);
          var start = condition.startQuestion || 'début ?';
          var end = condition.endQuestion || 'fin ?';
          var constraintParts = [];
          if (typeof requirement.minimumWeeks === 'number') {
            constraintParts.push("\u2265 ".concat(requirement.minimumWeeks, " sem."));
          }
          if (typeof requirement.maximumWeeks === 'number') {
            constraintParts.push("\u2264 ".concat(requirement.maximumWeeks, " sem."));
          }
          if (typeof requirement.minimumDays === 'number') {
            constraintParts.push("\u2265 ".concat(requirement.minimumDays, " j."));
          }
          if (typeof requirement.maximumDays === 'number') {
            constraintParts.push("\u2264 ".concat(requirement.maximumDays, " j."));
          }
          var constraint = constraintParts.length > 0 ? constraintParts.join(' / ') : 'plage personnalisée';
          items.push({
            type: 'timing',
            description: "Fen\xEAtre entre \xAB ".concat(start, " \xBB et \xAB ").concat(end, " \xBB (").concat(constraint, ")")
          });
          return 0; // continue
        }
        var refQuestion = questions.find(item => item.id === condition.question);
        var label = refQuestion ? "".concat(refQuestion.id, " \u2013 ").concat(refQuestion.question) : "Question ".concat(condition.question);
        var operator = condition.operator === 'equals' ? '=' : condition.operator === 'not_equals' ? '≠' : condition.operator === 'contains' ? 'contient' : condition.operator || '=';
        var value = typeof condition.value === 'string' ? condition.value : JSON.stringify(condition.value);
        items.push({
          type: 'question',
          description: "".concat(label, " ").concat(operator, " \xAB ").concat(value, " \xBB")
        });
      },
      _ret;
    for (var conditionIndex = 0; conditionIndex < conditions.length; conditionIndex += 1) {
      _ret = _loop2();
      if (_ret === 0) continue;
    }
    if (items.length > 0) {
      formatted.push({
        index: groupIndex + 1,
        logic: group.logic === 'any' ? 'OU' : 'ET',
        items
      });
    }
  }
  return formatted;
};
var formatGuidanceTips = guidance => {
  if (!guidance || !Array.isArray(guidance.tips)) {
    return [];
  }
  var tips = [];
  for (var index = 0; index < guidance.tips.length; index += 1) {
    var tip = guidance.tips[index];
    if (typeof tip === 'string' && tip.trim() !== '') {
      tips.push(tip);
    }
  }
  return tips;
};
var getTeamLabel = (teamId, teams) => {
  for (var index = 0; index < teams.length; index += 1) {
    var team = teams[index];
    if (team && team.id === teamId) {
      return "".concat(team.name || team.id);
    }
  }
  return teamId;
};
export var BackOffice = _ref => {
  var {
    questions,
    setQuestions,
    rules,
    setRules,
    teams,
    setTeams
  } = _ref;
  var [activeTab, setActiveTab] = useState('questions');
  var [editingRule, setEditingRule] = useState(null);
  var [editingQuestion, setEditingQuestion] = useState(null);
  var [draggedQuestionIndex, setDraggedQuestionIndex] = useState(null);
  var [dragOverIndex, setDragOverIndex] = useState(null);
  var [reorderAnnouncement, setReorderAnnouncement] = useState('');
  useEffect(() => {
    if (!reorderAnnouncement || typeof window === 'undefined') {
      return undefined;
    }
    var timeout = window.setTimeout(() => {
      setReorderAnnouncement('');
    }, 2000);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [reorderAnnouncement]);
  var moveQuestion = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) {
      return;
    }
    setQuestions(prevQuestions => {
      if (fromIndex < 0 || fromIndex >= prevQuestions.length || toIndex < 0 || toIndex >= prevQuestions.length) {
        return prevQuestions;
      }
      var updated = [...prevQuestions];
      var [movedQuestion] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedQuestion);
      if (movedQuestion) {
        var label = movedQuestion.question || movedQuestion.id || 'Question';
        setReorderAnnouncement("La question \xAB ".concat(label, " \xBB est maintenant en position ").concat(toIndex + 1, " sur ").concat(updated.length, "."));
      }
      return updated;
    });
  };
  var handleDragStart = (event, index) => {
    if (event !== null && event !== void 0 && event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
    setDraggedQuestionIndex(index);
    setDragOverIndex(index);
  };
  var handleDragOver = (event, index) => {
    event.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };
  var handleDrop = (event, index) => {
    event.preventDefault();
    var fromIndex = draggedQuestionIndex;
    if (fromIndex === null) {
      var _event$dataTransfer;
      var transferIndex = Number.parseInt(event === null || event === void 0 || (_event$dataTransfer = event.dataTransfer) === null || _event$dataTransfer === void 0 ? void 0 : _event$dataTransfer.getData('text/plain'), 10);
      if (Number.isFinite(transferIndex)) {
        fromIndex = transferIndex;
      }
    }
    if (fromIndex !== null) {
      moveQuestion(fromIndex, index);
    }
    setDraggedQuestionIndex(null);
    setDragOverIndex(null);
  };
  var handleDragEnd = () => {
    setDraggedQuestionIndex(null);
    setDragOverIndex(null);
  };
  var handleKeyboardReorder = (event, index) => {
    if (questions.length <= 1) {
      return;
    }
    if (event.key === 'ArrowUp' && index > 0) {
      event.preventDefault();
      moveQuestion(index, index - 1);
    } else if (event.key === 'ArrowDown' && index < questions.length - 1) {
      event.preventDefault();
      moveQuestion(index, index + 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      moveQuestion(index, 0);
    } else if (event.key === 'End') {
      event.preventDefault();
      moveQuestion(index, questions.length - 1);
    }
  };
  var getNextId = (items, prefix) => {
    var ids = new Set(items.map(item => item.id));
    var maxNumericSuffix = items.map(item => item.id).filter(id => typeof id === 'string' && id.startsWith(prefix)).map(id => Number.parseInt(id.slice(prefix.length), 10)).filter(value => Number.isFinite(value)).reduce((max, value) => Math.max(max, value), 0);
    var counter = maxNumericSuffix + 1;
    var candidate = "".concat(prefix).concat(counter);
    while (ids.has(candidate)) {
      counter += 1;
      candidate = "".concat(prefix).concat(counter);
    }
    return candidate;
  };
  var downloadDataModule = (filename, exportName, data) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }
    var serialized = JSON.stringify(data, null, 2);
    var moduleContent = "export const ".concat(exportName, " = ").concat(serialized, ";\n");
    var blob = new Blob([moduleContent], {
      type: 'application/javascript;charset=utf-8'
    });
    var url = window.URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };
  var handleDownloadDataFiles = () => {
    downloadDataModule('questions.js', 'initialQuestions', questions);
    downloadDataModule('rules.js', 'initialRules', rules);
    downloadDataModule('teams.js', 'initialTeams', teams);
  };
  var tabDefinitions = [{
    id: 'questions',
    label: "Questions (".concat(questions.length, ")"),
    panelId: 'backoffice-tabpanel-questions'
  }, {
    id: 'rules',
    label: "R\xE8gles (".concat(rules.length, ")"),
    panelId: 'backoffice-tabpanel-rules'
  }, {
    id: 'teams',
    label: "\xC9quipes (".concat(teams.length, ")"),
    panelId: 'backoffice-tabpanel-teams'
  }];
  var createDefaultQuestion = existingQuestions => ({
    id: getNextId(existingQuestions, 'q'),
    type: 'choice',
    question: 'Nouvelle question',
    options: ['Option 1', 'Option 2'],
    required: true,
    conditions: [],
    conditionLogic: 'all',
    conditionGroups: [],
    guidance: {
      objective: '',
      details: '',
      tips: []
    }
  });
  var addQuestion = () => {
    var newQuestion = createDefaultQuestion(questions);
    setQuestions([...questions, newQuestion]);
    setEditingQuestion(newQuestion);
  };
  var addQuestionAtIndex = targetIndex => {
    var newQuestion = createDefaultQuestion(questions);
    var next = questions.slice();
    next.splice(targetIndex, 0, newQuestion);
    setQuestions(next);
    setEditingQuestion(newQuestion);
    setReorderAnnouncement("Nouvelle question ajout\xE9e en position ".concat(targetIndex + 1, " sur ").concat(next.length, "."));
  };
  var deleteQuestion = id => {
    var target = questions.find(question => question.id === id);
    if (target && target.showcase) {
      return;
    }
    setQuestions(questions.filter(question => question.id !== id));
  };
  var saveQuestion = updatedQuestion => {
    var index = questions.findIndex(question => question.id === updatedQuestion.id);
    if (index >= 0) {
      var next = questions.slice();
      next[index] = updatedQuestion;
      setQuestions(next);
    } else {
      setQuestions([...questions, updatedQuestion]);
    }
    setEditingQuestion(null);
  };
  var addRule = () => {
    var newRule = {
      id: getNextId(rules, 'rule'),
      name: 'Nouvelle règle',
      conditions: [],
      conditionGroups: [],
      conditionLogic: 'all',
      teams: [],
      questions: {},
      risks: [],
      priority: 'Important'
    };
    setRules([...rules, newRule]);
    setEditingRule(newRule);
  };
  var deleteRule = id => {
    setRules(rules.filter(rule => rule.id !== id));
    if (editingRule && editingRule.id === id) {
      setEditingRule(null);
    }
  };
  var saveRule = updatedRule => {
    var index = rules.findIndex(rule => rule.id === updatedRule.id);
    if (index >= 0) {
      var next = rules.slice();
      next[index] = updatedRule;
      setRules(next);
    } else {
      setRules([...rules, updatedRule]);
    }
    setEditingRule(null);
  };
  var addTeam = () => {
    var newTeam = {
      id: getNextId(teams, 'team'),
      name: 'Nouvelle équipe',
      contact: 'email@company.com',
      expertise: "Domaine d'expertise"
    };
    setTeams([...teams, newTeam]);
  };
  var updateTeamField = (index, field, value) => {
    var next = teams.slice();
    if (!next[index]) {
      return;
    }
    next[index] = _objectSpread(_objectSpread({}, next[index]), {}, {
      [field]: value
    });
    setTeams(next);
  };
  var deleteTeam = id => {
    setTeams(teams.filter(team => team.id !== id));
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen hv-background px-4 py-16 sm:px-10 lg:px-12"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-2xl shadow-xl p-6 sm:p-8 hv-surface",
    role: "region",
    "aria-label": "Back-office compliance"
  }, /*#__PURE__*/React.createElement("header", {
    className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-xl"
  }, /*#__PURE__*/React.createElement(Settings, {
    className: "w-6 h-6"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "text-2xl font-bold text-gray-800 sm:text-3xl"
  }, "Back-Office Compliance"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500"
  }, "Configurez vos r\xE9f\xE9rentiels et automatisations"))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 w-full lg:w-auto"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleDownloadDataFiles,
    className: "inline-flex items-center justify-center px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg shadow-sm hover:bg-indigo-50 hv-button hv-focus-ring text-sm sm:text-base"
  }, /*#__PURE__*/React.createElement(Download, {
    className: "w-5 h-5 mr-2"
  }), "T\xE9l\xE9charger les fichiers (questions, r\xE8gles, \xE9quipes)"))), /*#__PURE__*/React.createElement("nav", {
    className: "flex flex-wrap gap-2 border-b border-gray-200 pb-2 mb-6",
    role: "tablist",
    "aria-label": "Navigation back-office"
  }, tabDefinitions.map(tab => /*#__PURE__*/React.createElement("button", {
    key: tab.id,
    type: "button",
    id: "backoffice-tab-".concat(tab.id),
    role: "tab",
    "aria-controls": tab.panelId,
    "aria-selected": activeTab === tab.id,
    onClick: () => setActiveTab(tab.id),
    className: "px-4 py-2 rounded-t-md text-sm font-medium hv-focus-ring ".concat(activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-800')
  }, tab.label))), activeTab === 'questions' && /*#__PURE__*/React.createElement("section", {
    id: "backoffice-tabpanel-questions",
    role: "tabpanel",
    "aria-labelledby": "backoffice-tab-questions",
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sr-only",
    "aria-live": "polite"
  }, reorderAnnouncement), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-bold text-gray-800"
  }, "Gestion des questions"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600"
  }, "D\xE9finissez les questions et leur logique d'affichage conditionnel.")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: addQuestion,
    className: "inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 hv-button hv-button-primary w-full sm:w-auto text-sm sm:text-base"
  }, /*#__PURE__*/React.createElement(Plus, {
    className: "w-5 h-5 mr-2"
  }), "Ajouter une question")), questions.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500"
  }, "Aucune question configur\xE9e pour le moment."), questions.map((question, index) => {
    var typeMeta = getQuestionTypeMeta(question.type);
    var conditionSummary = buildConditionSummary(question, questions);
    var guidance = question.guidance || {};
    var tips = formatGuidanceTips(guidance);
    var isShowcaseQuestion = Boolean(question && question.showcase);
    var deleteButtonClasses = isShowcaseQuestion ? 'p-2 text-gray-300 bg-gray-100 cursor-not-allowed rounded hv-button' : 'p-2 text-red-600 hover:bg-red-50 rounded hv-button';
    var deleteButtonTitle = isShowcaseQuestion ? 'Cette question alimente la vitrine showcase et ne peut pas être supprimée.' : "Supprimer la question ".concat(question.id);
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: question.id
    }, /*#__PURE__*/React.createElement("article", {
      className: "border border-gray-200 rounded-xl p-6 bg-white shadow-sm hv-surface transition-shadow ".concat(dragOverIndex === index ? 'ring-2 ring-indigo-400 ring-offset-2' : '', " ").concat(draggedQuestionIndex === index ? 'opacity-75' : ''),
      "aria-label": "Question ".concat(question.id),
      onDragOver: event => handleDragOver(event, index),
      onDrop: event => handleDrop(event, index)
    }, /*#__PURE__*/React.createElement("header", {
      className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
    }, /*#__PURE__*/React.createElement("div", {
      className: "space-y-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center space-x-3"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-semibold uppercase tracking-wide bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full"
    }, question.id), /*#__PURE__*/React.createElement("span", {
      className: "text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
    }, typeMeta.label), question.required && /*#__PURE__*/React.createElement("span", {
      className: "text-xs text-red-700 bg-red-100 px-2 py-1 rounded-full"
    }, "Obligatoire")), /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-semibold text-gray-800"
    }, question.question), /*#__PURE__*/React.createElement("p", {
      id: "question-".concat(question.id, "-position"),
      className: "text-xs text-gray-500"
    }, "Position ", index + 1, " sur ", questions.length), /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-gray-500"
    }, typeMeta.description)), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "p-2 text-gray-500 hover:text-indigo-600 rounded hv-button cursor-move",
      "aria-label": "R\xE9organiser la question ".concat(question.id, ". Position ").concat(index + 1, " sur ").concat(questions.length, ". Utilisez les fl\xE8ches haut et bas."),
      "aria-describedby": "question-".concat(question.id, "-position"),
      draggable: true,
      onDragStart: event => handleDragStart(event, index),
      onDragOver: event => handleDragOver(event, index),
      onDrop: event => handleDrop(event, index),
      onDragEnd: handleDragEnd,
      onKeyDown: event => handleKeyboardReorder(event, index)
    }, /*#__PURE__*/React.createElement(GripVertical, {
      className: "w-4 h-4"
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setEditingQuestion(question),
      className: "p-2 text-indigo-600 hover:bg-indigo-50 rounded hv-button",
      "aria-label": "Modifier la question ".concat(question.id)
    }, /*#__PURE__*/React.createElement(Edit, {
      className: "w-5 h-5"
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: isShowcaseQuestion ? undefined : () => deleteQuestion(question.id),
      className: deleteButtonClasses,
      "aria-label": deleteButtonTitle,
      "aria-disabled": isShowcaseQuestion,
      disabled: isShowcaseQuestion,
      title: deleteButtonTitle
    }, /*#__PURE__*/React.createElement(Trash2, {
      className: "w-5 h-5"
    })))), Array.isArray(question.options) && question.options.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "mt-4"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-sm font-semibold text-gray-700 flex items-center"
    }, /*#__PURE__*/React.createElement(Info, {
      className: "w-4 h-4 mr-2"
    }), " Options propos\xE9es"), /*#__PURE__*/React.createElement("ul", {
      className: "mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700"
    }, question.options.map((option, index) => /*#__PURE__*/React.createElement("li", {
      key: "".concat(question.id, "-option-").concat(index),
      className: "px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
    }, option)))), conditionSummary.length > 0 ? /*#__PURE__*/React.createElement("div", {
      className: "mt-6 bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm text-gray-700"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-sm font-semibold text-indigo-700 mb-3"
    }, "Conditions d'affichage"), /*#__PURE__*/React.createElement("ol", {
      className: "space-y-3"
    }, conditionSummary.map(group => /*#__PURE__*/React.createElement("li", {
      key: "".concat(question.id, "-condition-group-").concat(group.index),
      className: "space-y-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-semibold text-indigo-600 uppercase tracking-wide"
    }, "Groupe ", group.index, " \u2013 logique ", group.logic === 'OU' ? 'OU (au moins une)' : 'ET (toutes)'), /*#__PURE__*/React.createElement("ul", {
      className: "space-y-1"
    }, group.parts.map((part, idx) => /*#__PURE__*/React.createElement("li", {
      key: "".concat(question.id, "-part-").concat(group.index, "-").concat(idx),
      className: "flex items-baseline space-x-2"
    }, part.connector && /*#__PURE__*/React.createElement("span", {
      className: "text-xs text-indigo-500"
    }, part.connector), /*#__PURE__*/React.createElement("span", {
      className: "font-mono bg-white px-2 py-0.5 rounded border border-indigo-100"
    }, part.label), /*#__PURE__*/React.createElement("span", null, part.operator), /*#__PURE__*/React.createElement("span", {
      className: "font-semibold text-indigo-700"
    }, "\xAB ", part.value, " \xBB")))))))) : /*#__PURE__*/React.createElement("p", {
      className: "mt-6 text-xs text-gray-500 italic"
    }, "Cette question est toujours affich\xE9e."), (guidance.objective || guidance.details || tips.length > 0) && /*#__PURE__*/React.createElement("div", {
      className: "mt-6 border border-gray-200 rounded-lg p-4 bg-gray-50 text-sm text-gray-700 space-y-2"
    }, guidance.objective && /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", {
      className: "text-gray-800"
    }, "Objectif :"), ' ', renderTextWithLinks(guidance.objective)), guidance.details && /*#__PURE__*/React.createElement("p", null, renderTextWithLinks(guidance.details)), tips.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      className: "text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1"
    }, "Conseils pratiques"), /*#__PURE__*/React.createElement("ul", {
      className: "list-disc list-inside space-y-1"
    }, tips.map((tip, index) => /*#__PURE__*/React.createElement("li", {
      key: "".concat(question.id, "-tip-").concat(index)
    }, renderTextWithLinks(tip))))))), index < questions.length - 1 && /*#__PURE__*/React.createElement("div", {
      className: "flex justify-center my-3"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => addQuestionAtIndex(index + 1),
      className: "w-10 h-10 rounded-full border-2 border-dashed border-indigo-300 text-indigo-600 bg-white flex items-center justify-center shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 hv-button",
      "aria-label": "Ins\xE9rer une nouvelle question apr\xE8s la question ".concat(question.id)
    }, /*#__PURE__*/React.createElement(Plus, {
      className: "w-5 h-5"
    }), /*#__PURE__*/React.createElement("span", {
      className: "sr-only"
    }, "Ajouter une question \xE0 cet emplacement"))));
  })), activeTab === 'rules' && /*#__PURE__*/React.createElement("section", {
    id: "backoffice-tabpanel-rules",
    role: "tabpanel",
    "aria-labelledby": "backoffice-tab-rules",
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-bold text-gray-800"
  }, "Gestion des r\xE8gles"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600"
  }, "Identifiez les combinaisons \xE0 risque et les \xE9quipes concern\xE9es.")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: addRule,
    className: "inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 hv-button hv-button-primary w-full sm:w-auto text-sm sm:text-base"
  }, /*#__PURE__*/React.createElement(Plus, {
    className: "w-5 h-5 mr-2"
  }), "Ajouter une r\xE8gle")), rules.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500"
  }, "Aucune r\xE8gle m\xE9tier n'est configur\xE9e."), rules.map(rule => {
    var conditionSummary = buildRuleConditionSummary(rule, questions);
    var teamLabels = Array.isArray(rule.teams) ? rule.teams.map(teamId => getTeamLabel(teamId, teams)) : [];
    var risks = Array.isArray(rule.risks) ? rule.risks : [];
    return /*#__PURE__*/React.createElement("article", {
      key: rule.id,
      className: "border border-gray-200 rounded-xl p-6 bg-white shadow-sm hv-surface"
    }, /*#__PURE__*/React.createElement("header", {
      className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
    }, /*#__PURE__*/React.createElement("div", {
      className: "space-y-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center space-x-3 text-sm text-gray-500"
    }, /*#__PURE__*/React.createElement("span", {
      className: "bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold"
    }, rule.id), /*#__PURE__*/React.createElement("span", {
      className: "bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
    }, "Priorit\xE9 : ", rule.priority || 'N/A')), /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-semibold text-gray-800"
    }, rule.name)), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setEditingRule(rule),
      className: "p-2 text-indigo-600 hover:bg-indigo-50 rounded hv-button",
      "aria-label": "Afficher la r\xE8gle ".concat(rule.name)
    }, /*#__PURE__*/React.createElement(Eye, {
      className: "w-5 h-5"
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => deleteRule(rule.id),
      className: "p-2 text-red-600 hover:bg-red-50 rounded hv-button",
      "aria-label": "Supprimer la r\xE8gle ".concat(rule.name)
    }, /*#__PURE__*/React.createElement(Trash2, {
      className: "w-5 h-5"
    })))), conditionSummary.length > 0 ? /*#__PURE__*/React.createElement("div", {
      className: "mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-gray-700 space-y-3"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-sm font-semibold text-blue-700"
    }, "Conditions de d\xE9clenchement"), /*#__PURE__*/React.createElement("ol", {
      className: "space-y-3"
    }, conditionSummary.map(group => /*#__PURE__*/React.createElement("li", {
      key: "".concat(rule.id, "-group-").concat(group.index),
      className: "space-y-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-semibold text-blue-600 uppercase tracking-wide"
    }, "Groupe ", group.index, " \u2013 logique ", group.logic === 'OU' ? 'OU' : 'ET'), /*#__PURE__*/React.createElement("ul", {
      className: "space-y-1"
    }, group.items.map((item, idx) => /*#__PURE__*/React.createElement("li", {
      key: "".concat(rule.id, "-item-").concat(group.index, "-").concat(idx),
      className: "flex items-start space-x-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-blue-500 mt-1"
    }, "\u2022"), /*#__PURE__*/React.createElement("span", null, item.description)))))))) : /*#__PURE__*/React.createElement("p", {
      className: "mt-4 text-xs text-gray-500 italic"
    }, "Cette r\xE8gle est toujours active (aucune condition configur\xE9e)."), /*#__PURE__*/React.createElement("div", {
      className: "mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700"
    }, /*#__PURE__*/React.createElement("div", {
      className: "space-y-2"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "font-semibold text-gray-800"
    }, "\xC9quipes impliqu\xE9es"), teamLabels.length > 0 ? /*#__PURE__*/React.createElement("ul", {
      className: "flex flex-wrap gap-2"
    }, teamLabels.map(label => /*#__PURE__*/React.createElement("li", {
      key: "".concat(rule.id, "-team-").concat(label),
      className: "px-2 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-100"
    }, label))) : /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-gray-500 italic"
    }, "Aucune \xE9quipe associ\xE9e.")), /*#__PURE__*/React.createElement("div", {
      className: "space-y-2"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "font-semibold text-gray-800"
    }, "Risques identifi\xE9s"), risks.length > 0 ? /*#__PURE__*/React.createElement("ul", {
      className: "space-y-1"
    }, risks.map((risk, index) => /*#__PURE__*/React.createElement("li", {
      key: "".concat(rule.id, "-risk-").concat(index),
      className: "flex items-start space-x-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-red-500 mt-1"
    }, "\u2022"), /*#__PURE__*/React.createElement("span", null, risk && risk.description ? risk.description : 'Risque non renseigné')))) : /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-gray-500 italic"
    }, "Aucun risque document\xE9."))));
  })), activeTab === 'teams' && /*#__PURE__*/React.createElement("section", {
    id: "backoffice-tabpanel-teams",
    role: "tabpanel",
    "aria-labelledby": "backoffice-tab-teams",
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-bold text-gray-800"
  }, "Gestion des \xE9quipes"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600"
  }, "D\xE9finissez les \xE9quipes contact\xE9es selon les sc\xE9narios identifi\xE9s.")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: addTeam,
    className: "inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 hv-button hv-button-primary w-full sm:w-auto text-sm sm:text-base"
  }, /*#__PURE__*/React.createElement(Plus, {
    className: "w-5 h-5 mr-2"
  }), "Ajouter une \xE9quipe")), teams.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500"
  }, "Aucune \xE9quipe renseign\xE9e."), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-4"
  }, teams.map((team, index) => /*#__PURE__*/React.createElement("article", {
    key: team.id,
    className: "border border-gray-200 rounded-xl p-6 bg-white shadow-sm hv-surface",
    "aria-label": "\xC9quipe ".concat(team.name)
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: team.name,
    onChange: event => updateTeamField(index, 'name', event.target.value),
    className: "text-lg font-semibold text-gray-800 border-b border-transparent focus:border-indigo-600 focus:outline-none flex-1 hv-focus-ring",
    "aria-label": "Nom de l'\xE9quipe ".concat(team.id)
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-end sm:justify-start"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => deleteTeam(team.id),
    className: "p-2 text-red-600 hover:bg-red-50 rounded hv-button",
    "aria-label": "Supprimer l'\xE9quipe ".concat(team.name)
  }, /*#__PURE__*/React.createElement(Trash2, {
    className: "w-5 h-5"
  })))), /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1",
    htmlFor: "".concat(team.id, "-contact")
  }, "Contact principal"), /*#__PURE__*/React.createElement("input", {
    id: "".concat(team.id, "-contact"),
    type: "text",
    value: team.contact,
    onChange: event => updateTeamField(index, 'contact', event.target.value),
    className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4 hv-focus-ring"
  }), /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1",
    htmlFor: "".concat(team.id, "-expertise")
  }, "Domaine d'expertise"), /*#__PURE__*/React.createElement("textarea", {
    id: "".concat(team.id, "-expertise"),
    value: team.expertise,
    onChange: event => updateTeamField(index, 'expertise', event.target.value),
    className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-y hv-focus-ring",
    rows: 3
  })))))), editingQuestion && /*#__PURE__*/React.createElement(QuestionEditor, {
    question: editingQuestion,
    onSave: saveQuestion,
    onCancel: () => setEditingQuestion(null),
    allQuestions: questions
  }), editingRule && /*#__PURE__*/React.createElement(RuleEditor, {
    rule: editingRule,
    onSave: saveRule,
    onCancel: () => setEditingRule(null),
    questions: questions,
    teams: teams
  })));
};
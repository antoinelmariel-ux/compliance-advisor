function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import React, { useMemo, useEffect, useCallback, useState, useRef } from './react.js';
import { ReactDOM } from './react.js';
import { ProjectShowcase, SHOWCASE_THEMES, getInitialShowcaseTheme } from './components/ProjectShowcase.js';
import { loadPersistedState, persistState } from './utils/storage.js';
import { initialQuestions } from './data/questions.js';
import { initialRules } from './data/rules.js';
import { initialTeams } from './data/teams.js';
import { shouldShowQuestion } from './utils/questions.js';
import { analyzeAnswers } from './utils/rules.js';
import { extractProjectName } from './utils/projects.js';
import { createDemoProject } from './data/demoProject.js';
var buildPresentationContext = () => {
  var _analysis$timeline;
  if (typeof window === 'undefined') {
    return {
      status: 'error',
      message: "Cette vue de présentation nécessite un navigateur."
    };
  }
  var savedState = loadPersistedState();
  var params = new URLSearchParams(window.location.search);
  var requestedId = params.get('projectId');
  var questions = Array.isArray(savedState === null || savedState === void 0 ? void 0 : savedState.questions) && savedState.questions.length > 0 ? savedState.questions : initialQuestions;
  var rules = Array.isArray(savedState === null || savedState === void 0 ? void 0 : savedState.rules) && savedState.rules.length > 0 ? savedState.rules : initialRules;
  var teams = Array.isArray(savedState === null || savedState === void 0 ? void 0 : savedState.teams) && savedState.teams.length > 0 ? savedState.teams : initialTeams;
  var projects = null;
  if (Array.isArray(savedState === null || savedState === void 0 ? void 0 : savedState.projects) && savedState.projects.length > 0) {
    projects = savedState.projects;
  } else if (Array.isArray(savedState === null || savedState === void 0 ? void 0 : savedState.submittedProjects) && savedState.submittedProjects.length > 0) {
    projects = savedState.submittedProjects;
  }
  var findProjectById = (collection, id) => {
    if (!id || !Array.isArray(collection)) {
      return null;
    }
    return collection.find(project => (project === null || project === void 0 ? void 0 : project.id) === id) || null;
  };
  var project = findProjectById(projects, requestedId);
  if (!project && savedState !== null && savedState !== void 0 && savedState.activeProjectId) {
    project = findProjectById(projects, savedState.activeProjectId);
  }
  if (!project && Array.isArray(projects) && projects.length > 0) {
    project = projects[0];
  }
  var usedFallback = false;
  if (!project) {
    project = createDemoProject({
      questions,
      rules
    });
    usedFallback = true;
  }
  var answers = project.answers || {};
  var visibleQuestions = Array.isArray(questions) ? questions.filter(question => shouldShowQuestion(question, answers)) : [];
  var relevantQuestions = visibleQuestions.length > 0 ? visibleQuestions : questions;
  var analysis = project.analysis || (Object.keys(answers).length > 0 ? analyzeAnswers(answers, rules) : null);
  var relevantTeams = Array.isArray(teams) ? teams.filter(team => ((analysis === null || analysis === void 0 ? void 0 : analysis.teams) || []).includes(team.id)) : [];
  var timelineDetails = (analysis === null || analysis === void 0 || (_analysis$timeline = analysis.timeline) === null || _analysis$timeline === void 0 ? void 0 : _analysis$timeline.details) || [];
  var projectName = project.projectName || extractProjectName(answers, relevantQuestions) || 'Projet sans nom';
  var isDemoProject = Boolean(project.isDemo);
  var projectMeta = project.meta && typeof project.meta === 'object' ? project.meta : null;
  return {
    status: 'ready',
    projectId: project.id,
    requestedId,
    projectName,
    answers,
    analysis,
    relevantTeams,
    questions: relevantQuestions,
    allQuestions: questions,
    rules,
    teams,
    timelineDetails,
    usedFallback,
    isDemoProject,
    projectMeta,
    project
  };
};
var PresentationPage = () => {
  var context = useMemo(buildPresentationContext, []);
  var themeOptions = SHOWCASE_THEMES;
  var [selectedTheme, setSelectedTheme] = useState(() => getInitialShowcaseTheme(themeOptions));
  var computeDerived = useCallback(answersCandidate => {
    var _analysis$timeline2;
    if (context.status !== 'ready') {
      return {
        activeQuestions: Array.isArray(context.questions) ? context.questions : [],
        analysis: context.analysis || null,
        relevantTeams: context.relevantTeams || [],
        timelineDetails: context.timelineDetails || [],
        projectName: context.projectName || 'Projet sans nom'
      };
    }
    var allQuestions = Array.isArray(context.allQuestions) && context.allQuestions.length > 0 ? context.allQuestions : Array.isArray(context.questions) ? context.questions : [];
    var candidate = answersCandidate && typeof answersCandidate === 'object' ? answersCandidate : {};
    var visibleQuestions = allQuestions.filter(question => shouldShowQuestion(question, candidate));
    var activeQuestions = visibleQuestions.length > 0 ? visibleQuestions : allQuestions;
    var hasAnswers = Object.keys(candidate).length > 0;
    var analysis = hasAnswers ? analyzeAnswers(candidate, context.rules) : null;
    var relevantTeams = Array.isArray(context.teams) ? context.teams.filter(team => ((analysis === null || analysis === void 0 ? void 0 : analysis.teams) || []).includes(team.id)) : [];
    var timelineDetails = (analysis === null || analysis === void 0 || (_analysis$timeline2 = analysis.timeline) === null || _analysis$timeline2 === void 0 ? void 0 : _analysis$timeline2.details) || [];
    var projectName = extractProjectName(candidate, activeQuestions) || context.projectName;
    return {
      activeQuestions,
      analysis,
      relevantTeams,
      timelineDetails,
      projectName
    };
  }, [context]);
  var [answers, setAnswers] = useState(() => context.status === 'ready' ? _objectSpread({}, context.answers || {}) : {});
  var [derived, setDerived] = useState(() => computeDerived(context.status === 'ready' ? context.answers || {} : {}));
  var [isEditingMode, setIsEditingMode] = useState(false);
  var [editorState, setEditorState] = useState(null);
  var pendingEditRef = useRef(null);
  useEffect(() => {
    if (context.status !== 'ready') {
      return;
    }
    setDerived(computeDerived(answers));
  }, [answers, computeDerived, context.status]);
  var activeTheme = useMemo(() => themeOptions.find(theme => theme.id === selectedTheme) || themeOptions[0] || null, [themeOptions, selectedTheme]);
  var handleThemeSelection = useCallback(nextThemeId => {
    if (!themeOptions.some(theme => theme.id === nextThemeId)) {
      return;
    }
    setSelectedTheme(nextThemeId);
  }, [themeOptions]);
  useEffect(() => {
    if (context.status !== 'ready') {
      return;
    }
    if (typeof document !== 'undefined') {
      document.title = "".concat(derived.projectName, " \xB7 Pr\xE9sentation");
    }
  }, [context.status, derived.projectName]);
  var handleClose = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.close();
      if (window.opener) {
        return;
      }
    } catch (error) {
      // Ignore potential security errors.
    }
    window.location.href = './index.html';
  }, []);
  var persistProjectUpdate = useCallback(updatedProject => {
    var savedState = loadPersistedState();
    if (!savedState || !(updatedProject !== null && updatedProject !== void 0 && updatedProject.id)) {
      return;
    }
    var updateCollection = collection => {
      if (!Array.isArray(collection)) {
        return collection;
      }
      var changed = false;
      var nextCollection = collection.map(entry => {
        if (!entry || entry.id !== updatedProject.id) {
          return entry;
        }
        changed = true;
        return _objectSpread(_objectSpread({}, entry), updatedProject);
      });
      return changed ? nextCollection : collection;
    };
    var nextState = _objectSpread(_objectSpread({}, savedState), {}, {
      projects: updateCollection(savedState.projects),
      submittedProjects: updateCollection(savedState.submittedProjects)
    });
    if (savedState.activeProjectId === updatedProject.id) {
      nextState.answers = updatedProject.answers;
      nextState.analysis = updatedProject.analysis;
    }
    persistState(nextState);
  }, []);
  var handleAnswerSave = useCallback((questionId, newValue) => {
    if (context.status !== 'ready') {
      setEditorState(null);
      return;
    }
    var baseAnswers = _objectSpread({}, answers || {});
    var normalizedValue = newValue;
    if (Array.isArray(normalizedValue)) {
      normalizedValue = normalizedValue.map(item => typeof item === 'string' ? item.trim() : item).filter(item => {
        if (item === null || item === undefined) {
          return false;
        }
        if (typeof item === 'string') {
          return item.length > 0;
        }
        return true;
      });
    } else if (typeof normalizedValue === 'string') {
      normalizedValue = normalizedValue.trim();
    }
    if (normalizedValue === null || normalizedValue === undefined || typeof normalizedValue === 'string' && normalizedValue.length === 0 || Array.isArray(normalizedValue) && normalizedValue.length === 0) {
      delete baseAnswers[questionId];
    } else {
      baseAnswers[questionId] = normalizedValue;
    }
    setAnswers(baseAnswers);
    var nextDerived = computeDerived(baseAnswers);
    if (context.project) {
      var updatedProject = _objectSpread(_objectSpread({}, context.project), {}, {
        answers: baseAnswers,
        analysis: nextDerived.analysis || context.analysis || null,
        timelineDetails: nextDerived.timelineDetails,
        projectName: nextDerived.projectName,
        lastUpdated: new Date().toISOString()
      });
      persistProjectUpdate(updatedProject);
    }
    setEditorState(null);
  }, [answers, computeDerived, context, persistProjectUpdate]);
  var handleRequestEdit = useCallback(function (questionId) {
    var _context$answers;
    var info = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (context.status !== 'ready') {
      return;
    }
    var infoQuestion = info !== null && info !== void 0 && info.question && info.question.id === questionId ? info.question : null;
    var allQuestions = Array.isArray(context.allQuestions) ? context.allQuestions : [];
    var question = infoQuestion || allQuestions.find(entry => (entry === null || entry === void 0 ? void 0 : entry.id) === questionId);
    if (!question) {
      if (typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn("[Presentation] Impossible d'\xE9diter la question ".concat(questionId, " : introuvable."));
      }
      return;
    }
    var currentValue = Object.prototype.hasOwnProperty.call(answers || {}, questionId) ? answers[questionId] : (_context$answers = context.answers) === null || _context$answers === void 0 ? void 0 : _context$answers[questionId];
    var label = typeof (info === null || info === void 0 ? void 0 : info.label) === 'string' && info.label.trim().length > 0 ? info.label.trim() : question.question;
    setEditorState({
      question,
      label,
      value: currentValue
    });
  }, [context, answers]);
  var handleRequestEnableEditing = useCallback(function (questionId) {
    var info = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (context.status !== 'ready') {
      return;
    }
    if (isEditingMode) {
      handleRequestEdit(questionId, info);
      return;
    }
    pendingEditRef.current = {
      questionId,
      info
    };
    setIsEditingMode(true);
  }, [context.status, handleRequestEdit, isEditingMode]);
  useEffect(() => {
    if (!isEditingMode) {
      return;
    }
    if (!pendingEditRef.current) {
      return;
    }
    var {
      questionId,
      info
    } = pendingEditRef.current;
    pendingEditRef.current = null;
    handleRequestEdit(questionId, info);
  }, [isEditingMode, handleRequestEdit]);
  var handleToggleEditing = useCallback(() => {
    setIsEditingMode(previous => !previous);
    setEditorState(null);
    pendingEditRef.current = null;
  }, []);
  if (context.status !== 'ready') {
    return /*#__PURE__*/React.createElement("div", {
      className: "presentation-layout"
    }, /*#__PURE__*/React.createElement("div", {
      className: "presentation-empty"
    }, /*#__PURE__*/React.createElement("h2", null, "Impossible d'afficher la pr\xE9sentation"), /*#__PURE__*/React.createElement("p", null, context.message || 'Aucune donnée de projet disponible.'), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "presentation-button",
      onClick: handleClose
    }, "Retourner \xE0 l'application")));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "presentation-layout"
  }, /*#__PURE__*/React.createElement("header", {
    className: "presentation-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "presentation-header-main"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "presentation-title"
  }, "Pr\xE9sentation du projet"), /*#__PURE__*/React.createElement("p", {
    className: "presentation-subtitle"
  }, derived.projectName), isEditingMode ? /*#__PURE__*/React.createElement("span", {
    className: "inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
  }, "Mode \xE9dition activ\xE9") : null, /*#__PURE__*/React.createElement("div", {
    className: "presentation-theme-switch",
    role: "group",
    "aria-label": "Choisir un th\xE8me de vitrine"
  }, /*#__PURE__*/React.createElement("div", {
    className: "presentation-theme-summary"
  }, /*#__PURE__*/React.createElement("span", {
    className: "presentation-theme-label"
  }, "Style de pr\xE9sentation"), activeTheme !== null && activeTheme !== void 0 && activeTheme.description ? /*#__PURE__*/React.createElement("p", {
    className: "presentation-theme-description"
  }, activeTheme.description) : null), /*#__PURE__*/React.createElement("div", {
    className: "presentation-theme-options"
  }, themeOptions.map(theme => /*#__PURE__*/React.createElement("button", {
    key: theme.id,
    type: "button",
    className: "presentation-theme-option".concat(theme.id === selectedTheme ? ' presentation-theme-option--active' : ''),
    onClick: () => handleThemeSelection(theme.id),
    "aria-pressed": theme.id === selectedTheme
  }, theme.label))))), /*#__PURE__*/React.createElement("div", {
    className: "presentation-actions"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "presentation-button presentation-button--ghost".concat(isEditingMode ? ' presentation-button--ghost-active' : ''),
    onClick: handleToggleEditing,
    "aria-pressed": isEditingMode
  }, isEditingMode ? 'Terminer l’édition' : 'Activer l’édition'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "presentation-button",
    onClick: handleClose
  }, "Revenir \xE0 l'application"))), context.usedFallback && context.requestedId && /*#__PURE__*/React.createElement("p", {
    className: "presentation-banner"
  }, "Aucun projet avec l'identifiant \xAB ", context.requestedId, " \xBB n'a \xE9t\xE9 trouv\xE9. La pr\xE9sentation affiche le projet de d\xE9monstration."), /*#__PURE__*/React.createElement("main", {
    className: "presentation-content"
  }, /*#__PURE__*/React.createElement(ProjectShowcase, {
    projectName: derived.projectName,
    analysis: derived.analysis || context.analysis,
    relevantTeams: derived.relevantTeams.length > 0 ? derived.relevantTeams : context.relevantTeams,
    questions: derived.activeQuestions.length > 0 ? derived.activeQuestions : context.questions,
    answers: answers,
    timelineDetails: derived.timelineDetails.length > 0 ? derived.timelineDetails : context.timelineDetails,
    onClose: handleClose,
    renderInStandalone: true,
    selectedTheme: selectedTheme,
    onThemeChange: handleThemeSelection,
    themeOptions: themeOptions,
    isDemoProject: context.isDemoProject,
    projectMeta: context.projectMeta,
    allowEditing: isEditingMode,
    onEditQuestion: handleRequestEdit,
    onRequestEnableEditing: handleRequestEnableEditing
  })), editorState ? /*#__PURE__*/React.createElement(ShowcaseAnswerEditor, {
    question: editorState.question,
    label: editorState.label,
    value: editorState.value,
    onCancel: () => setEditorState(null),
    onSave: handleAnswerSave
  }) : null);
};
var normalizeMultiChoiceValue = value => {
  if (Array.isArray(value)) {
    return value.map(item => typeof item === 'string' ? item.trim() : item).filter(item => {
      if (item === null || item === undefined) {
        return false;
      }
      if (typeof item === 'string') {
        return item.length > 0;
      }
      return true;
    });
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value.trim()];
  }
  return [];
};
var getInitialDraftValue = (question, value) => {
  if (!question) {
    return '';
  }
  if (question.type === 'multi_choice') {
    return normalizeMultiChoiceValue(value);
  }
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return '';
  }
  return value;
};
var ShowcaseAnswerEditor = _ref => {
  var {
    question,
    label,
    value,
    onCancel,
    onSave
  } = _ref;
  var [draft, setDraft] = useState(() => getInitialDraftValue(question, value));
  var formRef = useRef(null);
  useEffect(() => {
    setDraft(getInitialDraftValue(question, value));
  }, [question, value]);
  useEffect(() => {
    var node = formRef.current;
    if (!node) {
      return;
    }
    var focusable = node.querySelector('input, textarea, select, button');
    if (focusable && typeof focusable.focus === 'function') {
      focusable.focus();
    }
  }, [question]);
  useEffect(() => {
    var handleEscape = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onCancel]);
  if (!question) {
    return null;
  }
  var handleSubmit = event => {
    event.preventDefault();
    if (typeof onSave !== 'function') {
      onCancel();
      return;
    }
    if (question.type === 'multi_choice') {
      onSave(question.id, normalizeMultiChoiceValue(draft));
      return;
    }
    if (typeof draft === 'string') {
      onSave(question.id, draft);
      return;
    }
    onSave(question.id, draft !== null && draft !== void 0 ? draft : '');
  };
  var handleToggleOption = option => {
    setDraft(previous => {
      var current = Array.isArray(previous) ? [...previous] : [];
      var index = current.indexOf(option);
      if (index >= 0) {
        current.splice(index, 1);
        return current;
      }
      current.push(option);
      return current;
    });
  };
  var guidance = question.guidance || {};
  var options = Array.isArray(question.options) ? question.options : [];
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 bg-slate-900/60",
    "aria-hidden": "true",
    onClick: onCancel
  }), /*#__PURE__*/React.createElement("form", {
    ref: formRef,
    onSubmit: handleSubmit,
    className: "relative z-10 w-full max-w-2xl space-y-6 rounded-2xl bg-white p-6 shadow-2xl"
  }, /*#__PURE__*/React.createElement("header", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-semibold uppercase tracking-wide text-indigo-500"
  }, "\xC9dition vitrine"), /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold text-slate-900"
  }, label || question.question)), guidance.objective ? /*#__PURE__*/React.createElement("div", {
    className: "rounded-lg border border-indigo-100 bg-indigo-50/80 p-3 text-sm text-indigo-700"
  }, guidance.objective) : null, guidance.details ? /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-600"
  }, guidance.details) : null, /*#__PURE__*/React.createElement("div", null, question.type === 'multi_choice' ? /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, options.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-500"
  }, "Aucune option disponible pour cette question.") : null, options.map(option => {
    var checked = Array.isArray(draft) ? draft.includes(option) : false;
    return /*#__PURE__*/React.createElement("label", {
      key: option,
      className: "flex items-center gap-3 text-sm text-slate-700"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      className: "h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400",
      checked: checked,
      onChange: () => handleToggleOption(option)
    }), /*#__PURE__*/React.createElement("span", null, option));
  })) : question.type === 'long_text' ? /*#__PURE__*/React.createElement("textarea", {
    rows: 6,
    className: "w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200",
    value: typeof draft === 'string' ? draft : '',
    onChange: event => setDraft(event.target.value)
  }) : /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200",
    value: typeof draft === 'string' ? draft : '',
    onChange: event => setDraft(event.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-end gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100",
    onClick: onCancel
  }, "Annuler"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
  }, "Enregistrer")))), document.body);
};
var rootElement = document.getElementById('presentation-root');
if (rootElement && ReactDOM) {
  if (typeof ReactDOM.createRoot === 'function') {
    var root = ReactDOM.createRoot(rootElement);
    root.render(/*#__PURE__*/React.createElement(PresentationPage, null));
  } else if (typeof ReactDOM.render === 'function') {
    ReactDOM.render(/*#__PURE__*/React.createElement(PresentationPage, null), rootElement);
  } else {
    console.error('Aucune méthode de rendu ReactDOM disponible.');
  }
}
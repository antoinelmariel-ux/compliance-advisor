function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import React, { useCallback, useEffect, useMemo, useRef, useState } from './react.js';
import { QuestionnaireScreen } from './components/QuestionnaireScreen.js';
import { SynthesisReport } from './components/SynthesisReport.js';
import { HomeScreen } from './components/HomeScreen.js';
import { BackOffice } from './components/BackOffice.js';
import { CheckCircle, Settings } from './components/icons.js';
import { MandatoryQuestionsSummary } from './components/MandatoryQuestionsSummary.js';
import { initialQuestions } from './data/questions.js';
import { initialRules } from './data/rules.js';
import { initialTeams } from './data/teams.js';
import { loadPersistedState, persistState } from './utils/storage.js';
import { shouldShowQuestion } from './utils/questions.js';
import { analyzeAnswers } from './utils/rules.js';
import { extractProjectName } from './utils/projects.js';
import { createDemoProject } from './data/demoProject.js';
import { verifyAdminPassword } from './utils/password.js';
import { isAnswerProvided } from './utils/answers.js';
import { computeMissingShowcaseQuestions } from './utils/showcaseRequirements.js';
var APP_VERSION = 'v1.0.71';
var normalizeProjectEntry = function normalizeProjectEntry() {
  var project = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var fallbackQuestionsLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : initialQuestions.length;
  var answers = typeof project.answers === 'object' && project.answers !== null ? project.answers : {};
  var computedTotalQuestions = typeof project.totalQuestions === 'number' && project.totalQuestions > 0 ? project.totalQuestions : fallbackQuestionsLength > 0 ? fallbackQuestionsLength : Object.keys(answers).length;
  var answeredQuestionsCount = typeof project.answeredQuestions === 'number' ? project.answeredQuestions : Object.keys(answers).length;
  var lastQuestionIndex = typeof project.lastQuestionIndex === 'number' ? project.lastQuestionIndex : computedTotalQuestions > 0 ? computedTotalQuestions - 1 : 0;
  if (computedTotalQuestions > 0) {
    lastQuestionIndex = Math.min(Math.max(lastQuestionIndex, 0), computedTotalQuestions - 1);
  }
  var lastUpdated = project.lastUpdated || project.submittedAt || null;
  var submittedAt = project.submittedAt || project.lastUpdated || null;
  return _objectSpread(_objectSpread({
    status: 'submitted'
  }, project), {}, {
    status: project.status || 'submitted',
    lastUpdated,
    submittedAt,
    totalQuestions: computedTotalQuestions,
    answeredQuestions: Math.min(answeredQuestionsCount, computedTotalQuestions || answeredQuestionsCount),
    lastQuestionIndex
  });
};
var normalizeProjectsCollection = function normalizeProjectsCollection(projects) {
  var fallbackQuestionsLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : initialQuestions.length;
  if (!Array.isArray(projects)) {
    return null;
  }
  return projects.map(project => normalizeProjectEntry(project, fallbackQuestionsLength));
};
var resolveFallbackQuestionsLength = function resolveFallbackQuestionsLength(savedState) {
  var currentQuestionsLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : initialQuestions.length;
  if (savedState && Array.isArray(savedState.questions) && savedState.questions.length > 0) {
    return savedState.questions.length;
  }
  return currentQuestionsLength;
};
var buildInitialProjectsState = () => {
  var savedState = loadPersistedState();
  if (!savedState) {
    return [createDemoProject()];
  }
  var fallbackQuestions = Array.isArray(savedState.questions) ? savedState.questions : initialQuestions;
  var fallbackRules = Array.isArray(savedState.rules) ? savedState.rules : initialRules;
  var fallbackQuestionsLength = resolveFallbackQuestionsLength(savedState, fallbackQuestions.length);
  var normalizedProjects = normalizeProjectsCollection(savedState.projects, fallbackQuestionsLength) || normalizeProjectsCollection(savedState.submittedProjects, fallbackQuestionsLength);
  if (normalizedProjects && normalizedProjects.length > 0) {
    return normalizedProjects;
  }
  return [createDemoProject({
    questions: fallbackQuestions,
    rules: fallbackRules
  })];
};
export var App = () => {
  var [mode, setMode] = useState('user');
  var [screen, setScreen] = useState('home');
  var [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  var [answers, setAnswers] = useState({});
  var [analysis, setAnalysis] = useState(null);
  var [projects, setProjects] = useState(buildInitialProjectsState);
  var [activeProjectId, setActiveProjectId] = useState(null);
  var [validationError, setValidationError] = useState(null);
  var [questions, setQuestions] = useState(initialQuestions);
  var [rules, setRules] = useState(initialRules);
  var [teams, setTeams] = useState(initialTeams);
  var [isHydrated, setIsHydrated] = useState(false);
  var persistTimeoutRef = useRef(null);
  useEffect(() => {
    var savedState = loadPersistedState();
    if (!savedState) {
      setIsHydrated(true);
      return;
    }
    var fallbackQuestions = Array.isArray(savedState.questions) ? savedState.questions : questions;
    var fallbackRules = Array.isArray(savedState.rules) ? savedState.rules : rules;
    var fallbackQuestionsLength = resolveFallbackQuestionsLength(savedState, fallbackQuestions.length);
    if (savedState.mode) {
      setMode(savedState.mode === 'admin' ? 'user' : savedState.mode);
    }
    if (savedState.screen) setScreen(savedState.screen);
    if (typeof savedState.currentQuestionIndex === 'number' && savedState.currentQuestionIndex >= 0) {
      setCurrentQuestionIndex(savedState.currentQuestionIndex);
    }
    if (savedState.answers && typeof savedState.answers === 'object') setAnswers(savedState.answers);
    if (typeof savedState.analysis !== 'undefined') setAnalysis(savedState.analysis);
    if (Array.isArray(savedState.projects)) {
      var normalized = normalizeProjectsCollection(savedState.projects, fallbackQuestionsLength);
      if (normalized && normalized.length > 0) {
        setProjects(normalized);
      } else {
        setProjects([createDemoProject({
          questions: fallbackQuestions,
          rules: fallbackRules
        })]);
      }
    } else if (Array.isArray(savedState.submittedProjects)) {
      var _normalized = normalizeProjectsCollection(savedState.submittedProjects, fallbackQuestionsLength);
      if (_normalized && _normalized.length > 0) {
        setProjects(_normalized);
      } else {
        setProjects([createDemoProject({
          questions: fallbackQuestions,
          rules: fallbackRules
        })]);
      }
    }
    if (typeof savedState.activeProjectId === 'string') setActiveProjectId(savedState.activeProjectId);
    if (Array.isArray(savedState.questions)) setQuestions(savedState.questions);
    if (Array.isArray(savedState.rules)) setRules(savedState.rules);
    if (Array.isArray(savedState.teams)) setTeams(savedState.teams);
    setIsHydrated(true);
  }, []);
  var buildPersistPayload = useCallback(() => ({
    mode,
    screen,
    currentQuestionIndex,
    answers,
    analysis,
    questions,
    rules,
    teams,
    projects,
    activeProjectId
  }), [mode, screen, currentQuestionIndex, answers, analysis, questions, rules, teams, projects, activeProjectId]);
  var exportProjectFile = useCallback(function (projectEntry) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (!projectEntry || typeof window === 'undefined') {
      return;
    }
    var status = options.status === 'submitted' ? 'submitted' : 'draft';
    var {
      document: targetDocument
    } = window;
    if (!targetDocument || typeof Blob === 'undefined') {
      return;
    }
    var now = new Date();
    var buildSafeFileName = rawName => {
      if (typeof rawName !== 'string' || rawName.trim().length === 0) {
        return null;
      }
      var trimmed = rawName.trim();
      try {
        return trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      } catch (error) {
        return trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }
    };
    var safeName = buildSafeFileName(projectEntry.projectName) || 'projet-compliance';
    var timestamp = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0'), String(now.getHours()).padStart(2, '0'), String(now.getMinutes()).padStart(2, '0'), String(now.getSeconds()).padStart(2, '0')].join('');
    var fileName = "".concat(safeName, "-").concat(status, "-").concat(timestamp, ".json");
    var questionnaireSummary = {
      questionIds: questions.map(question => question.id),
      total: questions.length
    };
    var projectPayload = {
      id: projectEntry.id,
      name: projectEntry.projectName,
      projectName: projectEntry.projectName,
      status,
      answers: projectEntry.answers || {},
      analysis: projectEntry.analysis || null,
      totalQuestions: projectEntry.totalQuestions,
      lastQuestionIndex: projectEntry.lastQuestionIndex,
      lastUpdated: projectEntry.lastUpdated,
      questionnaire: questionnaireSummary
    };
    if (status === 'submitted') {
      projectPayload.submittedAt = projectEntry.submittedAt || now.toISOString();
    }
    var exportPayload = {
      version: APP_VERSION,
      exportedAt: now.toISOString(),
      project: projectPayload
    };
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      return;
    }
    var blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json'
    });
    var objectUrl = URL.createObjectURL(blob);
    var anchor = targetDocument.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.rel = 'noopener';
    anchor.style.display = 'none';
    targetDocument.body.appendChild(anchor);
    anchor.click();
    targetDocument.body.removeChild(anchor);
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 0);
  }, [questions]);
  useEffect(() => {
    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
        persistTimeoutRef.current = null;
      }
    };
  }, []);
  useEffect(() => {
    if (!isHydrated) return undefined;
    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }
    persistTimeoutRef.current = setTimeout(() => {
      persistState(buildPersistPayload());
      persistTimeoutRef.current = null;
    }, 200);
    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
        persistTimeoutRef.current = null;
      }
    };
  }, [buildPersistPayload, isHydrated]);
  var activeQuestions = useMemo(() => questions.filter(q => shouldShowQuestion(q, answers)), [questions, answers]);
  var unansweredMandatoryQuestions = useMemo(() => activeQuestions.filter(question => question.required && !isAnswerProvided(answers[question.id])), [activeQuestions, answers]);
  var pendingMandatoryQuestions = useMemo(() => unansweredMandatoryQuestions.map(question => ({
    question,
    position: activeQuestions.findIndex(item => item.id === question.id) + 1
  })), [unansweredMandatoryQuestions, activeQuestions]);
  var missingShowcaseQuestions = useMemo(() => computeMissingShowcaseQuestions(activeQuestions, answers), [activeQuestions, answers]);
  var optionalShowcaseQuestions = useMemo(() => missingShowcaseQuestions.filter(item => {
    var _item$question;
    return !((_item$question = item.question) !== null && _item$question !== void 0 && _item$question.required);
  }), [missingShowcaseQuestions]);
  useEffect(() => {
    if (!isHydrated) return;
    if (activeQuestions.length === 0) return;
    if (currentQuestionIndex >= activeQuestions.length) {
      setCurrentQuestionIndex(activeQuestions.length - 1);
    }
  }, [activeQuestions.length, currentQuestionIndex, isHydrated]);
  useEffect(() => {
    if (!isHydrated) return;
    if (screen !== 'synthesis') return;
    if (unansweredMandatoryQuestions.length === 0) return;
    var firstMissingId = unansweredMandatoryQuestions[0].id;
    var targetIndex = activeQuestions.findIndex(question => question.id === firstMissingId);
    if (targetIndex >= 0) {
      setCurrentQuestionIndex(targetIndex);
    }
    setValidationError(null);
    setScreen('mandatory-summary');
  }, [screen, unansweredMandatoryQuestions, activeQuestions, isHydrated]);
  var handleAnswer = useCallback((questionId, answer) => {
    setAnswers(prevAnswers => {
      var nextAnswers = _objectSpread(_objectSpread({}, prevAnswers), {}, {
        [questionId]: answer
      });
      var questionsToRemove = questions.filter(q => !shouldShowQuestion(q, nextAnswers)).map(q => q.id);
      if (questionsToRemove.length === 0) {
        return nextAnswers;
      }
      var sanitizedAnswers = _objectSpread({}, nextAnswers);
      questionsToRemove.forEach(qId => {
        delete sanitizedAnswers[qId];
      });
      return sanitizedAnswers;
    });
    setValidationError(prev => {
      if (!prev) return null;
      return prev.questionId === questionId ? null : prev;
    });
  }, [questions]);
  var handleUpdateAnswers = useCallback(updates => {
    if (!updates || typeof updates !== 'object') {
      return;
    }
    var entries = Object.entries(updates);
    if (entries.length === 0) {
      return;
    }
    var sanitizedResult = null;
    setAnswers(prevAnswers => {
      var nextAnswers = _objectSpread({}, prevAnswers);
      entries.forEach(_ref => {
        var [questionId, value] = _ref;
        if (!questionId) {
          return;
        }
        if (Array.isArray(value)) {
          var filtered = value.map(item => typeof item === 'string' ? item.trim() : item).filter(item => {
            if (typeof item === 'string') {
              return item.length > 0;
            }
            return item !== null && item !== undefined;
          });
          if (filtered.length > 0) {
            nextAnswers[questionId] = filtered;
          } else {
            delete nextAnswers[questionId];
          }
          return;
        }
        if (value === null || value === undefined) {
          delete nextAnswers[questionId];
          return;
        }
        if (typeof value === 'string') {
          var trimmed = value.trim();
          if (trimmed.length > 0) {
            nextAnswers[questionId] = value;
          } else {
            delete nextAnswers[questionId];
          }
          return;
        }
        nextAnswers[questionId] = value;
      });
      var questionsToRemove = questions.filter(q => !shouldShowQuestion(q, nextAnswers)).map(q => q.id);
      if (questionsToRemove.length > 0) {
        questionsToRemove.forEach(qId => {
          delete nextAnswers[qId];
        });
      }
      sanitizedResult = nextAnswers;
      return nextAnswers;
    });
    if (sanitizedResult) {
      setAnalysis(analyzeAnswers(sanitizedResult, rules));
    }
    setValidationError(null);
  }, [questions, rules]);
  var resetProjectState = useCallback(() => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setAnalysis(null);
    setValidationError(null);
    setActiveProjectId(null);
  }, []);
  var handleCreateNewProject = useCallback(() => {
    resetProjectState();
    setScreen('questionnaire');
  }, [resetProjectState]);
  var handleNext = useCallback(() => {
    var _unansweredMandatoryQ;
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setValidationError(null);
      return;
    }
    var firstMissingId = (_unansweredMandatoryQ = unansweredMandatoryQuestions[0]) === null || _unansweredMandatoryQ === void 0 ? void 0 : _unansweredMandatoryQ.id;
    if (firstMissingId) {
      var targetIndex = activeQuestions.findIndex(question => question.id === firstMissingId);
      if (targetIndex >= 0) {
        setCurrentQuestionIndex(targetIndex);
      }
      setValidationError(null);
      setScreen('mandatory-summary');
      return;
    }
    var result = analyzeAnswers(answers, rules);
    setAnalysis(result);
    setValidationError(null);
    setScreen('synthesis');
  }, [activeQuestions, currentQuestionIndex, unansweredMandatoryQuestions, answers, rules]);
  var handleBack = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
    setValidationError(null);
  }, [currentQuestionIndex]);
  var resolveProjectContext = useCallback(projectId => {
    var _missingMandatory$;
    if (!projectId) {
      return null;
    }
    var project = projects.find(item => item.id === projectId);
    if (!project) {
      return null;
    }
    var projectAnswers = project.answers || {};
    var derivedQuestions = questions.filter(q => shouldShowQuestion(q, projectAnswers));
    var derivedAnalysis = project.analysis || (Object.keys(projectAnswers).length > 0 ? analyzeAnswers(projectAnswers, rules) : null);
    var missingMandatory = derivedQuestions.filter(question => question.required && !isAnswerProvided(projectAnswers[question.id]));
    var totalQuestions = derivedQuestions.length;
    var rawIndex = typeof project.lastQuestionIndex === 'number' ? project.lastQuestionIndex : 0;
    var sanitizedIndex = totalQuestions > 0 ? Math.min(Math.max(rawIndex, 0), totalQuestions - 1) : 0;
    var firstMissingId = (_missingMandatory$ = missingMandatory[0]) === null || _missingMandatory$ === void 0 ? void 0 : _missingMandatory$.id;
    var missingIndex = firstMissingId ? derivedQuestions.findIndex(question => question.id === firstMissingId) : -1;
    return {
      project,
      projectAnswers,
      derivedAnalysis,
      missingMandatory,
      derivedQuestions,
      sanitizedIndex,
      missingIndex
    };
  }, [projects, questions, rules, shouldShowQuestion, analyzeAnswers]);
  var handleOpenProject = useCallback(projectId => {
    var context = resolveProjectContext(projectId);
    if (!context) {
      return;
    }
    var {
      project,
      projectAnswers,
      derivedAnalysis,
      missingMandatory,
      sanitizedIndex,
      missingIndex
    } = context;
    setAnswers(projectAnswers);
    setAnalysis(derivedAnalysis);
    setValidationError(null);
    setActiveProjectId(project.id);
    if (project.status === 'draft') {
      var _nextIndex = missingIndex >= 0 ? missingIndex : sanitizedIndex;
      setCurrentQuestionIndex(_nextIndex);
      setScreen('questionnaire');
      return;
    }
    var nextIndex = missingIndex >= 0 ? missingIndex : 0;
    setCurrentQuestionIndex(nextIndex);
    if (missingMandatory.length > 0) {
      setScreen('mandatory-summary');
    } else {
      setScreen('synthesis');
    }
  }, [resolveProjectContext]);
  var handleOpenSynthesis = useCallback(projectId => {
    var context = resolveProjectContext(projectId);
    if (!context) {
      return;
    }
    var {
      project,
      projectAnswers,
      derivedAnalysis,
      missingMandatory,
      missingIndex
    } = context;
    setAnswers(projectAnswers);
    setAnalysis(derivedAnalysis);
    setValidationError(null);
    setActiveProjectId(project.id);
    var nextIndex = missingIndex >= 0 ? missingIndex : 0;
    setCurrentQuestionIndex(nextIndex);
    if (missingMandatory.length > 0) {
      setScreen('mandatory-summary');
    } else {
      setScreen('synthesis');
    }
  }, [resolveProjectContext]);
  var handleDuplicateProject = useCallback(projectId => {
    var context = resolveProjectContext(projectId);
    if (!context) {
      return;
    }
    var {
      project,
      projectAnswers,
      derivedAnalysis,
      sanitizedIndex
    } = context;
    var generatedId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? "project-".concat(crypto.randomUUID()) : "project-".concat(Date.now());
    var baseName = typeof project.projectName === 'string' ? project.projectName.trim() : '';
    var duplicateName = baseName.length > 0 ? "".concat(baseName, " (copie)") : undefined;
    var entry = handleSaveProject({
      id: generatedId,
      projectName: duplicateName,
      answers: projectAnswers,
      analysis: project.analysis || derivedAnalysis,
      status: 'draft',
      totalQuestions: project.totalQuestions,
      lastQuestionIndex: sanitizedIndex
    });
    if (entry) {
      setValidationError(null);
      setScreen('home');
    }
  }, [handleSaveProject, resolveProjectContext]);
  var handleDeleteProject = useCallback(projectId => {
    if (!projectId) {
      return;
    }
    setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
    setActiveProjectId(prev => prev === projectId ? null : prev);
  }, []);
  var handleOpenPresentation = useCallback(projectId => {
    var targetId = projectId || activeProjectId;
    if (!targetId) {
      return;
    }
    if (typeof window === 'undefined') {
      return;
    }
    persistState(buildPersistPayload());
    try {
      var url = new URL('./presentation.html', window.location.href);
      url.searchParams.set('projectId', targetId);
      window.location.assign(url.toString());
    } catch (error) {
      console.error('Impossible d\'ouvrir la page de présentation :', error);
    }
  }, [activeProjectId, buildPersistPayload]);
  var upsertProject = useCallback(entry => {
    return prevProjects => {
      if (!entry || !entry.id) {
        return prevProjects;
      }
      var filtered = prevProjects.filter(project => project.id !== entry.id);
      return [entry, ...filtered];
    };
  }, []);
  var handleSaveProject = useCallback(function () {
    var payload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var baseAnswers = payload.answers && typeof payload.answers === 'object' ? payload.answers : answers;
    var sanitizedAnswers = baseAnswers || {};
    var status = payload.status === 'submitted' ? 'submitted' : 'draft';
    var projectId = payload && typeof payload.id === 'string' && payload.id.trim().length > 0 ? payload.id.trim() : activeProjectId || "project-".concat(Date.now());
    var relevantQuestions = questions.filter(question => shouldShowQuestion(question, sanitizedAnswers));
    var computedTotalQuestions = payload.totalQuestions || (relevantQuestions.length > 0 ? relevantQuestions.length : activeQuestions.length);
    var totalQuestions = computedTotalQuestions > 0 ? computedTotalQuestions : activeQuestions.length;
    var answeredQuestionsCount = relevantQuestions.length > 0 ? relevantQuestions.filter(question => {
      var value = sanitizedAnswers[question.id];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      return value !== null && value !== undefined;
    }).length : Object.keys(sanitizedAnswers).length;
    var now = new Date().toISOString();
    var computedAnalysis = null;
    if (payload.analysis && typeof payload.analysis === 'object') {
      computedAnalysis = payload.analysis;
    } else if (Object.keys(sanitizedAnswers).length > 0) {
      computedAnalysis = analyzeAnswers(sanitizedAnswers, rules);
    }
    if (status === 'submitted' && !computedAnalysis) {
      return null;
    }
    var inferredName = extractProjectName(sanitizedAnswers, questions);
    var projectNameRaw = typeof payload.projectName === 'string' ? payload.projectName : inferredName;
    var sanitizedName = projectNameRaw && projectNameRaw.trim().length > 0 ? projectNameRaw.trim() : 'Projet sans nom';
    var lastQuestionIndex = typeof payload.lastQuestionIndex === 'number' ? payload.lastQuestionIndex : currentQuestionIndex;
    if (status === 'submitted' && totalQuestions > 0) {
      lastQuestionIndex = totalQuestions - 1;
    }
    var clampedLastIndex = totalQuestions > 0 ? Math.min(Math.max(lastQuestionIndex, 0), totalQuestions - 1) : 0;
    var entry = {
      id: projectId,
      projectName: sanitizedName,
      answers: sanitizedAnswers,
      analysis: computedAnalysis,
      status,
      lastUpdated: now,
      lastQuestionIndex: clampedLastIndex,
      totalQuestions,
      answeredQuestions: Math.min(answeredQuestionsCount, totalQuestions || answeredQuestionsCount)
    };
    if (status === 'submitted') {
      entry.submittedAt = now;
    }
    setProjects(upsertProject(entry));
    setActiveProjectId(projectId);
    if (computedAnalysis) {
      setAnalysis(computedAnalysis);
    }
    return entry;
  }, [activeProjectId, activeQuestions.length, answers, currentQuestionIndex, questions, rules, shouldShowQuestion, upsertProject]);
  var handleSubmitProject = useCallback(function () {
    var payload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var entry = handleSaveProject(_objectSpread(_objectSpread({}, payload), {}, {
      status: 'submitted'
    }));
    if (entry) {
      exportProjectFile(entry, {
        status: 'submitted'
      });
      setValidationError(null);
      setScreen('home');
    }
  }, [exportProjectFile, handleSaveProject]);
  var handleSaveDraft = useCallback(() => {
    var entry = handleSaveProject({
      status: 'draft',
      lastQuestionIndex: currentQuestionIndex
    });
    if (entry) {
      exportProjectFile(entry, {
        status: 'draft'
      });
      setValidationError(null);
      setScreen('home');
    }
  }, [currentQuestionIndex, exportProjectFile, handleSaveProject]);
  var handleImportProjectFile = useCallback(/*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(function* (file) {
      if (!file || typeof file.text !== 'function') {
        return;
      }
      try {
        var _projectSection$quest;
        var fileContent = yield file.text();
        var parsed = JSON.parse(fileContent);
        var projectSection = (() => {
          if (!parsed || typeof parsed !== 'object') {
            return null;
          }
          if (parsed.project && typeof parsed.project === 'object' && !Array.isArray(parsed.project)) {
            return parsed.project;
          }
          if (parsed.projectData && typeof parsed.projectData === 'object' && !Array.isArray(parsed.projectData)) {
            return parsed.projectData;
          }
          if (!Array.isArray(parsed)) {
            return parsed;
          }
          return null;
        })();
        if (!projectSection || typeof projectSection !== 'object' || Array.isArray(projectSection)) {
          throw new Error('INVALID_PROJECT_PAYLOAD');
        }
        var _answers = projectSection.answers && typeof projectSection.answers === 'object' && !Array.isArray(projectSection.answers) ? projectSection.answers : {};
        var analysisData = projectSection.analysis && typeof projectSection.analysis === 'object' && !Array.isArray(projectSection.analysis) ? projectSection.analysis : null;
        var questionnaireIds = Array.isArray((_projectSection$quest = projectSection.questionnaire) === null || _projectSection$quest === void 0 ? void 0 : _projectSection$quest.questionIds) ? projectSection.questionnaire.questionIds.filter(id => typeof id === 'string') : [];
        var inferredTotalQuestions = typeof projectSection.totalQuestions === 'number' && projectSection.totalQuestions > 0 ? projectSection.totalQuestions : questionnaireIds.length > 0 ? questionnaireIds.length : Object.keys(_answers).length;
        var totalQuestions = inferredTotalQuestions > 0 ? inferredTotalQuestions : Object.keys(_answers).length;
        var maxQuestionIndex = totalQuestions > 0 ? totalQuestions - 1 : 0;
        var importedLastIndex = typeof projectSection.lastQuestionIndex === 'number' ? Math.min(Math.max(projectSection.lastQuestionIndex, 0), maxQuestionIndex) : maxQuestionIndex;
        var importedName = (() => {
          var candidates = [projectSection.name, projectSection.projectName, parsed.projectName];
          for (var candidate of candidates) {
            if (typeof candidate === 'string' && candidate.trim().length > 0) {
              return candidate.trim();
            }
          }
          return '';
        })();
        var generatedId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? "project-".concat(crypto.randomUUID()) : "project-".concat(Date.now());
        var entry = handleSaveProject({
          id: generatedId,
          projectName: importedName,
          answers: _answers,
          analysis: analysisData,
          status: 'draft',
          totalQuestions,
          lastQuestionIndex: importedLastIndex
        });
        if (entry) {
          setMode('user');
          setScreen('home');
          setValidationError(null);
        }
      } catch (error) {
        console.error("Impossible d'importer le projet :", error);
        if (typeof window !== 'undefined' && typeof window.alert === 'function') {
          window.alert('Le fichier sélectionné ne correspond pas à un projet valide.');
        }
      }
    });
    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  }(), [handleSaveProject, setMode, setScreen, setValidationError]);
  var handleEnterBackOffice = useCallback(/*#__PURE__*/_asyncToGenerator(function* () {
    if (mode === 'admin') {
      return;
    }
    if (typeof window === 'undefined' || typeof window.prompt !== 'function') {
      return;
    }
    var password = window.prompt('Veuillez saisir le mot de passe pour accéder au back-office :');
    if (password === null) {
      return;
    }
    var {
      isValid,
      error
    } = yield verifyAdminPassword(password);
    if (isValid) {
      setMode('admin');
    } else if (error && typeof window.alert === 'function') {
      window.alert("La vérification du mot de passe n'est pas disponible dans ce navigateur.");
    } else if (typeof window.alert === 'function') {
      window.alert('Mot de passe incorrect.');
    }
  }), [mode, setMode, verifyAdminPassword]);
  var handleExitBackOffice = useCallback(() => {
    setMode('user');
    setScreen('home');
  }, [setMode, setScreen]);
  var handleBackToQuestionnaire = useCallback(() => {
    if (unansweredMandatoryQuestions.length > 0) {
      var firstMissingId = unansweredMandatoryQuestions[0].id;
      var targetIndex = activeQuestions.findIndex(question => question.id === firstMissingId);
      if (targetIndex >= 0) {
        setCurrentQuestionIndex(targetIndex);
      }
    } else if (activeQuestions.length > 0) {
      var lastIndex = activeQuestions.length - 1;
      setCurrentQuestionIndex(prevIndex => {
        if (prevIndex > lastIndex) {
          return lastIndex;
        }
        return prevIndex;
      });
    }
    setValidationError(null);
    setScreen('questionnaire');
  }, [activeQuestions, unansweredMandatoryQuestions]);
  var handleNavigateToQuestion = useCallback(questionId => {
    var targetIndex = activeQuestions.findIndex(question => question.id === questionId);
    if (targetIndex >= 0) {
      setCurrentQuestionIndex(targetIndex);
    }
    setValidationError(null);
    setScreen('questionnaire');
  }, [activeQuestions]);
  var handleProceedToSynthesis = useCallback(() => {
    if (unansweredMandatoryQuestions.length > 0) {
      setScreen('mandatory-summary');
      return;
    }
    var result = analyzeAnswers(answers, rules);
    setAnalysis(result);
    setValidationError(null);
    setScreen('synthesis');
  }, [answers, rules, unansweredMandatoryQuestions]);
  return /*#__PURE__*/React.createElement("div", {
    className: "app-shell"
  }, /*#__PURE__*/React.createElement("nav", {
    className: "app-header",
    "aria-label": "Navigation principale"
  }, /*#__PURE__*/React.createElement("div", {
    className: "app-header__inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "app-header__brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "app-header__mark"
  }, /*#__PURE__*/React.createElement(CheckCircle, {
    className: "w-6 h-6"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "app-header__title"
  }, "Compliance Advisor"), /*#__PURE__*/React.createElement("p", {
    className: "app-header__subtitle"
  }, "Outil d'aide \xE0 la d\xE9cision"))), /*#__PURE__*/React.createElement("div", {
    className: "app-header__actions",
    role: "group",
    "aria-label": "S\xE9lection du mode d'affichage"
  }, mode === 'user' && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setScreen('home'),
    className: "app-header__button".concat(screen === 'home' ? ' app-header__button--active' : ''),
    "aria-pressed": screen === 'home',
    "aria-label": "Retourner \xE0 l'accueil des projets"
  }, "Accueil projets"), mode === 'admin' && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleExitBackOffice,
    className: "app-header__button".concat(mode === 'user' ? ' app-header__button--active' : ''),
    "aria-pressed": mode === 'user',
    "aria-label": "Basculer vers le mode chef de projet"
  }, "Mode Chef de Projet"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleEnterBackOffice,
    className: "app-header__icon-button".concat(mode === 'admin' ? ' app-header__button--active' : ''),
    "aria-pressed": mode === 'admin',
    "aria-label": "Acc\xE9der au back-office",
    title: "Back-office"
  }, /*#__PURE__*/React.createElement(Settings, {
    className: "w-5 h-5"
  }))))), /*#__PURE__*/React.createElement("main", {
    id: "main-content",
    tabIndex: "-1",
    className: "app-main focus:outline-none hv-background"
  }, mode === 'user' ? screen === 'home' ? /*#__PURE__*/React.createElement(HomeScreen, {
    projects: projects,
    onStartNewProject: handleCreateNewProject,
    onOpenProject: handleOpenProject,
    onOpenSynthesis: handleOpenSynthesis,
    onDeleteProject: handleDeleteProject,
    onOpenPresentation: handleOpenPresentation,
    onDuplicateProject: handleDuplicateProject,
    onImportProject: handleImportProjectFile
  }) : screen === 'questionnaire' ? /*#__PURE__*/React.createElement(QuestionnaireScreen, {
    questions: activeQuestions,
    currentIndex: currentQuestionIndex,
    answers: answers,
    onAnswer: handleAnswer,
    onNext: handleNext,
    onBack: handleBack,
    allQuestions: questions,
    onSaveDraft: handleSaveDraft,
    validationError: validationError
  }) : screen === 'mandatory-summary' ? /*#__PURE__*/React.createElement(MandatoryQuestionsSummary, {
    pendingQuestions: pendingMandatoryQuestions,
    totalQuestions: activeQuestions.length,
    missingShowcaseQuestions: optionalShowcaseQuestions,
    onBackToQuestionnaire: handleBackToQuestionnaire,
    onNavigateToQuestion: handleNavigateToQuestion,
    onProceedToSynthesis: handleProceedToSynthesis
  }) : screen === 'synthesis' ? /*#__PURE__*/React.createElement(SynthesisReport, {
    answers: answers,
    analysis: analysis,
    teams: teams,
    questions: activeQuestions,
    onBack: handleBackToQuestionnaire,
    onUpdateAnswers: handleUpdateAnswers,
    onSubmitProject: handleSubmitProject,
    isExistingProject: Boolean(activeProjectId),
    onOpenPresentation: () => handleOpenPresentation(activeProjectId)
  }) : null : /*#__PURE__*/React.createElement(BackOffice, {
    questions: questions,
    setQuestions: setQuestions,
    rules: rules,
    setRules: setRules,
    teams: teams,
    setTeams: setTeams
  })), /*#__PURE__*/React.createElement("footer", {
    className: "app-footer",
    "aria-label": "Pied de page"
  }, /*#__PURE__*/React.createElement("p", {
    className: "app-footer__text"
  }, "Compliance Advisor \xB7 Version ", APP_VERSION)));
};
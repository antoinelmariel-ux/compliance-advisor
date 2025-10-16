import React, { useCallback, useEffect, useMemo, useRef, useState } from './react.js';
import { QuestionnaireScreen } from './components/QuestionnaireScreen.jsx';
import { SynthesisReport } from './components/SynthesisReport.jsx';
import { HomeScreen } from './components/HomeScreen.jsx';
import { BackOffice } from './components/BackOffice.jsx';
import { CheckCircle, Settings } from './components/icons.js';
import { MandatoryQuestionsSummary } from './components/MandatoryQuestionsSummary.jsx';
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

const APP_VERSION = 'v1.0.61';

const normalizeProjectEntry = (project = {}, fallbackQuestionsLength = initialQuestions.length) => {
  const answers = typeof project.answers === 'object' && project.answers !== null ? project.answers : {};
  const computedTotalQuestions =
    typeof project.totalQuestions === 'number' && project.totalQuestions > 0
      ? project.totalQuestions
      : fallbackQuestionsLength > 0
        ? fallbackQuestionsLength
        : Object.keys(answers).length;

  const answeredQuestionsCount =
    typeof project.answeredQuestions === 'number'
      ? project.answeredQuestions
      : Object.keys(answers).length;

  let lastQuestionIndex =
    typeof project.lastQuestionIndex === 'number'
      ? project.lastQuestionIndex
      : computedTotalQuestions > 0
        ? computedTotalQuestions - 1
        : 0;

  if (computedTotalQuestions > 0) {
    lastQuestionIndex = Math.min(Math.max(lastQuestionIndex, 0), computedTotalQuestions - 1);
  }

  const lastUpdated = project.lastUpdated || project.submittedAt || null;
  const submittedAt = project.submittedAt || project.lastUpdated || null;

  return {
    status: 'submitted',
    ...project,
    status: project.status || 'submitted',
    lastUpdated,
    submittedAt,
    totalQuestions: computedTotalQuestions,
    answeredQuestions: Math.min(answeredQuestionsCount, computedTotalQuestions || answeredQuestionsCount),
    lastQuestionIndex
  };
};

const normalizeProjectsCollection = (projects, fallbackQuestionsLength = initialQuestions.length) => {
  if (!Array.isArray(projects)) {
    return null;
  }

  return projects.map(project => normalizeProjectEntry(project, fallbackQuestionsLength));
};

const resolveFallbackQuestionsLength = (savedState, currentQuestionsLength = initialQuestions.length) => {
  if (savedState && Array.isArray(savedState.questions) && savedState.questions.length > 0) {
    return savedState.questions.length;
  }

  return currentQuestionsLength;
};

const buildInitialProjectsState = () => {
  const savedState = loadPersistedState();

  if (!savedState) {
    return [createDemoProject()];
  }

  const fallbackQuestions = Array.isArray(savedState.questions) ? savedState.questions : initialQuestions;
  const fallbackRules = Array.isArray(savedState.rules) ? savedState.rules : initialRules;
  const fallbackQuestionsLength = resolveFallbackQuestionsLength(savedState, fallbackQuestions.length);

  const normalizedProjects = normalizeProjectsCollection(savedState.projects, fallbackQuestionsLength)
    || normalizeProjectsCollection(savedState.submittedProjects, fallbackQuestionsLength);

  if (normalizedProjects && normalizedProjects.length > 0) {
    return normalizedProjects;
  }

  return [createDemoProject({ questions: fallbackQuestions, rules: fallbackRules })];
};

export const App = () => {
  const [mode, setMode] = useState('user');
  const [screen, setScreen] = useState('home');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [projects, setProjects] = useState(buildInitialProjectsState);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [questions, setQuestions] = useState(initialQuestions);
  const [rules, setRules] = useState(initialRules);
  const [teams, setTeams] = useState(initialTeams);
  const [isHydrated, setIsHydrated] = useState(false);
  const persistTimeoutRef = useRef(null);

  useEffect(() => {
    const savedState = loadPersistedState();
    if (!savedState) {
      setIsHydrated(true);
      return;
    }

    const fallbackQuestions = Array.isArray(savedState.questions) ? savedState.questions : questions;
    const fallbackRules = Array.isArray(savedState.rules) ? savedState.rules : rules;
    const fallbackQuestionsLength = resolveFallbackQuestionsLength(savedState, fallbackQuestions.length);

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
      const normalized = normalizeProjectsCollection(savedState.projects, fallbackQuestionsLength);
      if (normalized && normalized.length > 0) {
        setProjects(normalized);
      } else {
        setProjects([createDemoProject({ questions: fallbackQuestions, rules: fallbackRules })]);
      }
    } else if (Array.isArray(savedState.submittedProjects)) {
      const normalized = normalizeProjectsCollection(savedState.submittedProjects, fallbackQuestionsLength);
      if (normalized && normalized.length > 0) {
        setProjects(normalized);
      } else {
        setProjects([createDemoProject({ questions: fallbackQuestions, rules: fallbackRules })]);
      }
    }
    if (typeof savedState.activeProjectId === 'string') setActiveProjectId(savedState.activeProjectId);
    if (Array.isArray(savedState.questions)) setQuestions(savedState.questions);
    if (Array.isArray(savedState.rules)) setRules(savedState.rules);
    if (Array.isArray(savedState.teams)) setTeams(savedState.teams);

    setIsHydrated(true);
  }, []);

  const buildPersistPayload = useCallback(() => ({
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
  }), [
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
  ]);

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

  const activeQuestions = useMemo(
    () => questions.filter(q => shouldShowQuestion(q, answers)),
    [questions, answers]
  );

  const unansweredMandatoryQuestions = useMemo(
    () =>
      activeQuestions.filter(question => question.required && !isAnswerProvided(answers[question.id])),
    [activeQuestions, answers]
  );

  const pendingMandatoryQuestions = useMemo(
    () =>
      unansweredMandatoryQuestions.map(question => ({
        question,
        position: activeQuestions.findIndex(item => item.id === question.id) + 1
      })),
    [unansweredMandatoryQuestions, activeQuestions]
  );

  const missingShowcaseQuestions = useMemo(
    () => computeMissingShowcaseQuestions(activeQuestions, answers),
    [activeQuestions, answers]
  );

  const optionalShowcaseQuestions = useMemo(
    () => missingShowcaseQuestions.filter(item => !item.question?.required),
    [missingShowcaseQuestions]
  );

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

    const firstMissingId = unansweredMandatoryQuestions[0].id;
    const targetIndex = activeQuestions.findIndex(question => question.id === firstMissingId);
    if (targetIndex >= 0) {
      setCurrentQuestionIndex(targetIndex);
    }
    setValidationError(null);
    setScreen('mandatory-summary');
  }, [
    screen,
    unansweredMandatoryQuestions,
    activeQuestions,
    isHydrated
  ]);

  const handleAnswer = useCallback((questionId, answer) => {
    setAnswers(prevAnswers => {
      const nextAnswers = { ...prevAnswers, [questionId]: answer };

      const questionsToRemove = questions
        .filter(q => !shouldShowQuestion(q, nextAnswers))
        .map(q => q.id);

      if (questionsToRemove.length === 0) {
        return nextAnswers;
      }

      const sanitizedAnswers = { ...nextAnswers };
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

  const handleUpdateAnswers = useCallback((updates) => {
    if (!updates || typeof updates !== 'object') {
      return;
    }

    const entries = Object.entries(updates);
    if (entries.length === 0) {
      return;
    }

    let sanitizedResult = null;

    setAnswers(prevAnswers => {
      const nextAnswers = { ...prevAnswers };

      entries.forEach(([questionId, value]) => {
        if (!questionId) {
          return;
        }

        if (Array.isArray(value)) {
          const filtered = value
            .map(item => (typeof item === 'string' ? item.trim() : item))
            .filter(item => {
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
          const trimmed = value.trim();
          if (trimmed.length > 0) {
            nextAnswers[questionId] = value;
          } else {
            delete nextAnswers[questionId];
          }
          return;
        }

        nextAnswers[questionId] = value;
      });

      const questionsToRemove = questions
        .filter(q => !shouldShowQuestion(q, nextAnswers))
        .map(q => q.id);

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

  const resetProjectState = useCallback(() => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setAnalysis(null);
    setValidationError(null);
    setActiveProjectId(null);
  }, []);

  const handleCreateNewProject = useCallback(() => {
    resetProjectState();
    setScreen('questionnaire');
  }, [resetProjectState]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setValidationError(null);
      return;
    }

    const firstMissingId = unansweredMandatoryQuestions[0]?.id;
    if (firstMissingId) {
      const targetIndex = activeQuestions.findIndex(question => question.id === firstMissingId);
      if (targetIndex >= 0) {
        setCurrentQuestionIndex(targetIndex);
      }
      setValidationError(null);
      setScreen('mandatory-summary');
      return;
    }

    const result = analyzeAnswers(answers, rules);
    setAnalysis(result);
    setValidationError(null);
    setScreen('synthesis');
  }, [
    activeQuestions,
    currentQuestionIndex,
    unansweredMandatoryQuestions,
    answers,
    rules
  ]);

  const handleBack = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
    setValidationError(null);
  }, [currentQuestionIndex]);

  const resolveProjectContext = useCallback((projectId) => {
    if (!projectId) {
      return null;
    }

    const project = projects.find(item => item.id === projectId);
    if (!project) {
      return null;
    }

    const projectAnswers = project.answers || {};
    const derivedQuestions = questions.filter(q => shouldShowQuestion(q, projectAnswers));
    const derivedAnalysis = project.analysis
      || (Object.keys(projectAnswers).length > 0 ? analyzeAnswers(projectAnswers, rules) : null);
    const missingMandatory = derivedQuestions.filter(question => question.required && !isAnswerProvided(projectAnswers[question.id]));
    const totalQuestions = derivedQuestions.length;
    const rawIndex = typeof project.lastQuestionIndex === 'number' ? project.lastQuestionIndex : 0;
    const sanitizedIndex = totalQuestions > 0 ? Math.min(Math.max(rawIndex, 0), totalQuestions - 1) : 0;
    const firstMissingId = missingMandatory[0]?.id;
    const missingIndex = firstMissingId
      ? derivedQuestions.findIndex(question => question.id === firstMissingId)
      : -1;

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

  const handleOpenProject = useCallback((projectId) => {
    const context = resolveProjectContext(projectId);
    if (!context) {
      return;
    }

    const {
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
      const nextIndex = missingIndex >= 0 ? missingIndex : sanitizedIndex;
      setCurrentQuestionIndex(nextIndex);
      setScreen('questionnaire');
      return;
    }

    const nextIndex = missingIndex >= 0 ? missingIndex : 0;
    setCurrentQuestionIndex(nextIndex);

    if (missingMandatory.length > 0) {
      setScreen('mandatory-summary');
    } else {
      setScreen('synthesis');
    }
  }, [resolveProjectContext]);

  const handleOpenSynthesis = useCallback((projectId) => {
    const context = resolveProjectContext(projectId);
    if (!context) {
      return;
    }

    const {
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

    const nextIndex = missingIndex >= 0 ? missingIndex : 0;
    setCurrentQuestionIndex(nextIndex);

    if (missingMandatory.length > 0) {
      setScreen('mandatory-summary');
    } else {
      setScreen('synthesis');
    }
  }, [resolveProjectContext]);

  const handleDuplicateProject = useCallback((projectId) => {
    const context = resolveProjectContext(projectId);
    if (!context) {
      return;
    }

    const {
      project,
      projectAnswers,
      derivedAnalysis,
      sanitizedIndex
    } = context;

    const generatedId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? `project-${crypto.randomUUID()}`
      : `project-${Date.now()}`;

    const baseName = typeof project.projectName === 'string' ? project.projectName.trim() : '';
    const duplicateName = baseName.length > 0 ? `${baseName} (copie)` : undefined;

    const entry = handleSaveProject({
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

  const handleDeleteProject = useCallback((projectId) => {
    if (!projectId) {
      return;
    }

    setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
    setActiveProjectId(prev => (prev === projectId ? null : prev));
  }, []);

  const handleOpenPresentation = useCallback((projectId) => {
    const targetId = projectId || activeProjectId;
    if (!targetId) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    persistState(buildPersistPayload());

    try {
      const url = new URL('./presentation.html', window.location.href);
      url.searchParams.set('projectId', targetId);
      window.location.assign(url.toString());
    } catch (error) {
      console.error('Impossible d\'ouvrir la page de présentation :', error);
    }
  }, [activeProjectId, buildPersistPayload]);

  const upsertProject = useCallback((entry) => {
    return prevProjects => {
      if (!entry || !entry.id) {
        return prevProjects;
      }

      const filtered = prevProjects.filter(project => project.id !== entry.id);
      return [entry, ...filtered];
    };
  }, []);

  const handleSaveProject = useCallback((payload = {}) => {
    const baseAnswers = payload.answers && typeof payload.answers === 'object' ? payload.answers : answers;
    const sanitizedAnswers = baseAnswers || {};
    const status = payload.status === 'submitted' ? 'submitted' : 'draft';
    const projectId = (payload && typeof payload.id === 'string' && payload.id.trim().length > 0)
      ? payload.id.trim()
      : activeProjectId || `project-${Date.now()}`;
    const relevantQuestions = questions.filter(question => shouldShowQuestion(question, sanitizedAnswers));
    const computedTotalQuestions = payload.totalQuestions
      || (relevantQuestions.length > 0 ? relevantQuestions.length : activeQuestions.length);
    const totalQuestions = computedTotalQuestions > 0 ? computedTotalQuestions : activeQuestions.length;
    const answeredQuestionsCount = relevantQuestions.length > 0
      ? relevantQuestions.filter(question => {
        const value = sanitizedAnswers[question.id];
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        if (typeof value === 'string') {
          return value.trim().length > 0;
        }
        return value !== null && value !== undefined;
      }).length
      : Object.keys(sanitizedAnswers).length;
    const now = new Date().toISOString();

    let computedAnalysis = null;
    if (payload.analysis && typeof payload.analysis === 'object') {
      computedAnalysis = payload.analysis;
    } else if (Object.keys(sanitizedAnswers).length > 0) {
      computedAnalysis = analyzeAnswers(sanitizedAnswers, rules);
    }

    if (status === 'submitted' && !computedAnalysis) {
      return null;
    }

    const inferredName = extractProjectName(sanitizedAnswers, questions);
    const projectNameRaw = typeof payload.projectName === 'string' ? payload.projectName : inferredName;
    const sanitizedName =
      projectNameRaw && projectNameRaw.trim().length > 0 ? projectNameRaw.trim() : 'Projet sans nom';

    let lastQuestionIndex =
      typeof payload.lastQuestionIndex === 'number' ? payload.lastQuestionIndex : currentQuestionIndex;
    if (status === 'submitted' && totalQuestions > 0) {
      lastQuestionIndex = totalQuestions - 1;
    }

    const clampedLastIndex = totalQuestions > 0
      ? Math.min(Math.max(lastQuestionIndex, 0), totalQuestions - 1)
      : 0;

    const entry = {
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

  const handleSubmitProject = useCallback((payload = {}) => {
    const entry = handleSaveProject({ ...payload, status: 'submitted' });
    if (entry) {
      setValidationError(null);
      setScreen('home');
    }
  }, [handleSaveProject]);

  const handleSaveDraft = useCallback(() => {
    const entry = handleSaveProject({ status: 'draft', lastQuestionIndex: currentQuestionIndex });
    if (entry) {
      setValidationError(null);
      setScreen('home');
    }
  }, [currentQuestionIndex, handleSaveProject]);

  const handleImportProjectFile = useCallback(async (file) => {
    if (!file || typeof file.text !== 'function') {
      return;
    }

    try {
      const fileContent = await file.text();
      const parsed = JSON.parse(fileContent);

      const projectSection = (() => {
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

      const answers = projectSection.answers && typeof projectSection.answers === 'object' && !Array.isArray(projectSection.answers)
        ? projectSection.answers
        : {};

      const analysisData = projectSection.analysis && typeof projectSection.analysis === 'object' && !Array.isArray(projectSection.analysis)
        ? projectSection.analysis
        : null;

      const questionnaireIds = Array.isArray(projectSection.questionnaire?.questionIds)
        ? projectSection.questionnaire.questionIds.filter(id => typeof id === 'string')
        : [];

      const inferredTotalQuestions = typeof projectSection.totalQuestions === 'number' && projectSection.totalQuestions > 0
        ? projectSection.totalQuestions
        : questionnaireIds.length > 0
          ? questionnaireIds.length
          : Object.keys(answers).length;

      const totalQuestions = inferredTotalQuestions > 0 ? inferredTotalQuestions : Object.keys(answers).length;
      const maxQuestionIndex = totalQuestions > 0 ? totalQuestions - 1 : 0;

      const importedLastIndex = typeof projectSection.lastQuestionIndex === 'number'
        ? Math.min(Math.max(projectSection.lastQuestionIndex, 0), maxQuestionIndex)
        : maxQuestionIndex;

      const importedName = (() => {
        if (typeof projectSection.name === 'string' && projectSection.name.trim().length > 0) {
          return projectSection.name.trim();
        }

        if (typeof parsed.projectName === 'string' && parsed.projectName.trim().length > 0) {
          return parsed.projectName.trim();
        }

        return '';
      })();

      const generatedId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `project-${crypto.randomUUID()}`
        : `project-${Date.now()}`;

      const entry = handleSaveProject({
        id: generatedId,
        projectName: importedName,
        answers,
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
  }, [handleSaveProject, setMode, setScreen, setValidationError]);

  const handleEnterBackOffice = useCallback(async () => {
    if (mode === 'admin') {
      return;
    }

    if (typeof window === 'undefined' || typeof window.prompt !== 'function') {
      return;
    }

    const password = window.prompt('Veuillez saisir le mot de passe pour accéder au back-office :');
    if (password === null) {
      return;
    }

    const { isValid, error } = await verifyAdminPassword(password);
    if (isValid) {
      setMode('admin');
    } else if (error && typeof window.alert === 'function') {
      window.alert("La vérification du mot de passe n'est pas disponible dans ce navigateur.");
    } else if (typeof window.alert === 'function') {
      window.alert('Mot de passe incorrect.');
    }
  }, [mode, setMode, verifyAdminPassword]);

  const handleExitBackOffice = useCallback(() => {
    setMode('user');
    setScreen('home');
  }, [setMode, setScreen]);

  const handleBackToQuestionnaire = useCallback(() => {
    if (unansweredMandatoryQuestions.length > 0) {
      const firstMissingId = unansweredMandatoryQuestions[0].id;
      const targetIndex = activeQuestions.findIndex(question => question.id === firstMissingId);
      if (targetIndex >= 0) {
        setCurrentQuestionIndex(targetIndex);
      }
    } else if (activeQuestions.length > 0) {
      const lastIndex = activeQuestions.length - 1;
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

  const handleNavigateToQuestion = useCallback((questionId) => {
    const targetIndex = activeQuestions.findIndex(question => question.id === questionId);
    if (targetIndex >= 0) {
      setCurrentQuestionIndex(targetIndex);
    }
    setValidationError(null);
    setScreen('questionnaire');
  }, [activeQuestions]);

  const handleProceedToSynthesis = useCallback(() => {
    if (unansweredMandatoryQuestions.length > 0) {
      setScreen('mandatory-summary');
      return;
    }

    const result = analyzeAnswers(answers, rules);
    setAnalysis(result);
    setValidationError(null);
    setScreen('synthesis');
  }, [answers, rules, unansweredMandatoryQuestions]);

  return (
    <div className="app-shell">
      <nav className="app-header" aria-label="Navigation principale">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <span className="app-header__mark">
              <CheckCircle className="w-6 h-6" />
            </span>
            <div>
              <h1 className="app-header__title">Compliance Advisor</h1>
              <p className="app-header__subtitle">Outil d'aide à la décision</p>
            </div>
          </div>

          <div
            className="app-header__actions"
            role="group"
            aria-label="Sélection du mode d'affichage"
          >
            {mode === 'user' && (
              <button
                type="button"
                onClick={() => setScreen('home')}
                className={`app-header__button${screen === 'home' ? ' app-header__button--active' : ''}`}
                aria-pressed={screen === 'home'}
                aria-label="Retourner à l'accueil des projets"
              >
                Accueil projets
              </button>
            )}
            {mode === 'admin' && (
              <button
                type="button"
                onClick={handleExitBackOffice}
                className={`app-header__button${mode === 'user' ? ' app-header__button--active' : ''}`}
                aria-pressed={mode === 'user'}
                aria-label="Basculer vers le mode chef de projet"
              >
                Mode Chef de Projet
              </button>
            )}
            <button
              type="button"
              onClick={handleEnterBackOffice}
              className={`app-header__icon-button${mode === 'admin' ? ' app-header__button--active' : ''}`}
              aria-pressed={mode === 'admin'}
              aria-label="Accéder au back-office"
              title="Back-office"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main id="main-content" tabIndex="-1" className="app-main focus:outline-none hv-background">
        {mode === 'user' ? (
          screen === 'home' ? (
            <HomeScreen
              projects={projects}
              onStartNewProject={handleCreateNewProject}
              onOpenProject={handleOpenProject}
              onOpenSynthesis={handleOpenSynthesis}
              onDeleteProject={handleDeleteProject}
              onOpenPresentation={handleOpenPresentation}
              onDuplicateProject={handleDuplicateProject}
              onImportProject={handleImportProjectFile}
            />
          ) : screen === 'questionnaire' ? (
            <QuestionnaireScreen
              questions={activeQuestions}
              currentIndex={currentQuestionIndex}
              answers={answers}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onBack={handleBack}
              allQuestions={questions}
              onSaveDraft={handleSaveDraft}
              validationError={validationError}
            />
          ) : screen === 'mandatory-summary' ? (
            <MandatoryQuestionsSummary
              pendingQuestions={pendingMandatoryQuestions}
              totalQuestions={activeQuestions.length}
              missingShowcaseQuestions={optionalShowcaseQuestions}
              onBackToQuestionnaire={handleBackToQuestionnaire}
              onNavigateToQuestion={handleNavigateToQuestion}
              onProceedToSynthesis={handleProceedToSynthesis}
            />
          ) : screen === 'synthesis' ? (
            <SynthesisReport
              answers={answers}
              analysis={analysis}
              teams={teams}
              questions={activeQuestions}
              onBack={handleBackToQuestionnaire}
              onUpdateAnswers={handleUpdateAnswers}
              onSubmitProject={handleSubmitProject}
              isExistingProject={Boolean(activeProjectId)}
              onOpenPresentation={() => handleOpenPresentation(activeProjectId)}
            />
          ) : null
        ) : (
          <BackOffice
            questions={questions}
            setQuestions={setQuestions}
            rules={rules}
            setRules={setRules}
            teams={teams}
            setTeams={setTeams}
          />
        )}
      </main>

      <footer className="app-footer" aria-label="Pied de page">
        <p className="app-footer__text">Compliance Advisor · Version {APP_VERSION}</p>
      </footer>
    </div>
  );
};



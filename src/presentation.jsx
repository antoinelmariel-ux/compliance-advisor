import React, { useMemo, useEffect, useCallback, useState, useRef } from './react.js';
import { ReactDOM } from './react.js';
import {
  ProjectShowcase,
  SHOWCASE_THEMES,
  getInitialShowcaseTheme
} from './components/ProjectShowcase.jsx';
import { loadPersistedState, persistState } from './utils/storage.js';
import { initialQuestions } from './data/questions.js';
import { initialRules } from './data/rules.js';
import { initialTeams } from './data/teams.js';
import { shouldShowQuestion } from './utils/questions.js';
import { analyzeAnswers } from './utils/rules.js';
import { extractProjectName } from './utils/projects.js';
import { createDemoProject } from './data/demoProject.js';

const buildPresentationContext = () => {
  if (typeof window === 'undefined') {
    return { status: 'error', message: "Cette vue de présentation nécessite un navigateur." };
  }

  const savedState = loadPersistedState();
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('projectId');

  const questions = Array.isArray(savedState?.questions) && savedState.questions.length > 0
    ? savedState.questions
    : initialQuestions;
  const rules = Array.isArray(savedState?.rules) && savedState.rules.length > 0
    ? savedState.rules
    : initialRules;
  const teams = Array.isArray(savedState?.teams) && savedState.teams.length > 0
    ? savedState.teams
    : initialTeams;

  let projects = null;
  if (Array.isArray(savedState?.projects) && savedState.projects.length > 0) {
    projects = savedState.projects;
  } else if (Array.isArray(savedState?.submittedProjects) && savedState.submittedProjects.length > 0) {
    projects = savedState.submittedProjects;
  }

  const findProjectById = (collection, id) => {
    if (!id || !Array.isArray(collection)) {
      return null;
    }
    return collection.find(project => project?.id === id) || null;
  };

  let project = findProjectById(projects, requestedId);

  if (!project && savedState?.activeProjectId) {
    project = findProjectById(projects, savedState.activeProjectId);
  }

  if (!project && Array.isArray(projects) && projects.length > 0) {
    project = projects[0];
  }

  let usedFallback = false;

  if (!project) {
    project = createDemoProject({ questions, rules });
    usedFallback = true;
  }

  const answers = project.answers || {};
  const visibleQuestions = Array.isArray(questions)
    ? questions.filter(question => shouldShowQuestion(question, answers))
    : [];
  const relevantQuestions = visibleQuestions.length > 0 ? visibleQuestions : questions;

  const analysis = project.analysis
    || (Object.keys(answers).length > 0 ? analyzeAnswers(answers, rules) : null);

  const relevantTeams = Array.isArray(teams)
    ? teams.filter(team => (analysis?.teams || []).includes(team.id))
    : [];
  const timelineDetails = analysis?.timeline?.details || [];
  const projectName = project.projectName || extractProjectName(answers, relevantQuestions) || 'Projet sans nom';
  const isDemoProject = Boolean(project.isDemo);
  const projectMeta = project.meta && typeof project.meta === 'object' ? project.meta : null;

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

const PresentationPage = () => {
  const context = useMemo(buildPresentationContext, []);

  const themeOptions = SHOWCASE_THEMES;
  const [selectedTheme, setSelectedTheme] = useState(() => getInitialShowcaseTheme(themeOptions));

  const computeDerived = useCallback((answersCandidate) => {
    if (context.status !== 'ready') {
      return {
        activeQuestions: Array.isArray(context.questions) ? context.questions : [],
        analysis: context.analysis || null,
        relevantTeams: context.relevantTeams || [],
        timelineDetails: context.timelineDetails || [],
        projectName: context.projectName || 'Projet sans nom'
      };
    }

    const allQuestions = Array.isArray(context.allQuestions) && context.allQuestions.length > 0
      ? context.allQuestions
      : Array.isArray(context.questions)
        ? context.questions
        : [];

    const candidate = answersCandidate && typeof answersCandidate === 'object' ? answersCandidate : {};
    const visibleQuestions = allQuestions.filter(question => shouldShowQuestion(question, candidate));
    const activeQuestions = visibleQuestions.length > 0 ? visibleQuestions : allQuestions;
    const hasAnswers = Object.keys(candidate).length > 0;

    const analysis = hasAnswers ? analyzeAnswers(candidate, context.rules) : null;

    const relevantTeams = Array.isArray(context.teams)
      ? context.teams.filter(team => (analysis?.teams || []).includes(team.id))
      : [];

    const timelineDetails = analysis?.timeline?.details || [];

    const projectName = extractProjectName(candidate, activeQuestions) || context.projectName;

    return {
      activeQuestions,
      analysis,
      relevantTeams,
      timelineDetails,
      projectName
    };
  }, [context]);

  const [answers, setAnswers] = useState(() => (context.status === 'ready' ? { ...(context.answers || {}) } : {}));
  const [derived, setDerived] = useState(() => computeDerived(context.status === 'ready' ? context.answers || {} : {}));
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editorState, setEditorState] = useState(null);
  const pendingEditRef = useRef(null);

  useEffect(() => {
    if (context.status !== 'ready') {
      return;
    }
    setDerived(computeDerived(answers));
  }, [answers, computeDerived, context.status]);

  const activeTheme = useMemo(
    () => themeOptions.find(theme => theme.id === selectedTheme) || themeOptions[0] || null,
    [themeOptions, selectedTheme]
  );

  const handleThemeSelection = useCallback((nextThemeId) => {
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
      document.title = `${derived.projectName} · Présentation`;
    }
  }, [context.status, derived.projectName]);

  const handleClose = useCallback(() => {
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

  const persistProjectUpdate = useCallback((updatedProject) => {
    const savedState = loadPersistedState();
    if (!savedState || !updatedProject?.id) {
      return;
    }

    const updateCollection = (collection) => {
      if (!Array.isArray(collection)) {
        return collection;
      }
      let changed = false;
      const nextCollection = collection.map((entry) => {
        if (!entry || entry.id !== updatedProject.id) {
          return entry;
        }
        changed = true;
        return { ...entry, ...updatedProject };
      });
      return changed ? nextCollection : collection;
    };

    const nextState = {
      ...savedState,
      projects: updateCollection(savedState.projects),
      submittedProjects: updateCollection(savedState.submittedProjects)
    };

    if (savedState.activeProjectId === updatedProject.id) {
      nextState.answers = updatedProject.answers;
      nextState.analysis = updatedProject.analysis;
    }

    persistState(nextState);
  }, []);

  const handleAnswerSave = useCallback((questionId, newValue) => {
    if (context.status !== 'ready') {
      setEditorState(null);
      return;
    }

    const baseAnswers = { ...(answers || {}) };
    let normalizedValue = newValue;

    if (Array.isArray(normalizedValue)) {
      normalizedValue = normalizedValue
        .map((item) => (typeof item === 'string' ? item.trim() : item))
        .filter((item) => {
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

    if (
      normalizedValue === null ||
      normalizedValue === undefined ||
      (typeof normalizedValue === 'string' && normalizedValue.length === 0) ||
      (Array.isArray(normalizedValue) && normalizedValue.length === 0)
    ) {
      delete baseAnswers[questionId];
    } else {
      baseAnswers[questionId] = normalizedValue;
    }

    setAnswers(baseAnswers);

    const nextDerived = computeDerived(baseAnswers);

    if (context.project) {
      const updatedProject = {
        ...context.project,
        answers: baseAnswers,
        analysis: nextDerived.analysis || context.analysis || null,
        timelineDetails: nextDerived.timelineDetails,
        projectName: nextDerived.projectName,
        lastUpdated: new Date().toISOString()
      };
      persistProjectUpdate(updatedProject);
    }

    setEditorState(null);
  }, [answers, computeDerived, context, persistProjectUpdate]);

  const handleRequestEdit = useCallback((questionId, info = {}) => {
    if (context.status !== 'ready') {
      return;
    }

    const infoQuestion = info?.question && info.question.id === questionId ? info.question : null;
    const allQuestions = Array.isArray(context.allQuestions) ? context.allQuestions : [];
    const question = infoQuestion || allQuestions.find((entry) => entry?.id === questionId);
    if (!question) {
      if (typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn(`[Presentation] Impossible d'éditer la question ${questionId} : introuvable.`);
      }
      return;
    }

    const currentValue = Object.prototype.hasOwnProperty.call(answers || {}, questionId)
      ? answers[questionId]
      : context.answers?.[questionId];

    const label = typeof info?.label === 'string' && info.label.trim().length > 0
      ? info.label.trim()
      : question.question;

    setEditorState({ question, label, value: currentValue });
  }, [context, answers]);

  const handleRequestEnableEditing = useCallback((questionId, info = {}) => {
    if (context.status !== 'ready') {
      return;
    }

    if (isEditingMode) {
      handleRequestEdit(questionId, info);
      return;
    }

    pendingEditRef.current = { questionId, info };
    setIsEditingMode(true);
  }, [context.status, handleRequestEdit, isEditingMode]);

  useEffect(() => {
    if (!isEditingMode) {
      return;
    }

    if (!pendingEditRef.current) {
      return;
    }

    const { questionId, info } = pendingEditRef.current;
    pendingEditRef.current = null;
    handleRequestEdit(questionId, info);
  }, [isEditingMode, handleRequestEdit]);

  const handleToggleEditing = useCallback(() => {
    setIsEditingMode((previous) => !previous);
    setEditorState(null);
    pendingEditRef.current = null;
  }, []);

  if (context.status !== 'ready') {
    return (
      <div className="presentation-layout">
        <div className="presentation-empty">
          <h2>Impossible d'afficher la présentation</h2>
          <p>{context.message || 'Aucune donnée de projet disponible.'}</p>
          <button type="button" className="presentation-button" onClick={handleClose}>
            Retourner à l'application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="presentation-layout">
      <header className="presentation-header">
        <div className="presentation-header-main">
          <h1 className="presentation-title">Présentation du projet</h1>
          <p className="presentation-subtitle">{derived.projectName}</p>
          {isEditingMode ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              Mode édition activé
            </span>
          ) : null}
          <div className="presentation-theme-switch" role="group" aria-label="Choisir un thème de vitrine">
            <div className="presentation-theme-summary">
              <span className="presentation-theme-label">Style de présentation</span>
              {activeTheme?.description ? (
                <p className="presentation-theme-description">{activeTheme.description}</p>
              ) : null}
            </div>
            <div className="presentation-theme-options">
              {themeOptions.map(theme => (
                <button
                  key={theme.id}
                  type="button"
                  className={`presentation-theme-option${theme.id === selectedTheme ? ' presentation-theme-option--active' : ''}`}
                  onClick={() => handleThemeSelection(theme.id)}
                  aria-pressed={theme.id === selectedTheme}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="presentation-actions">
          <button
            type="button"
            className={`presentation-button presentation-button--ghost${isEditingMode ? ' presentation-button--ghost-active' : ''}`}
            onClick={handleToggleEditing}
            aria-pressed={isEditingMode}
          >
            {isEditingMode ? 'Terminer l’édition' : 'Activer l’édition'}
          </button>
          <button type="button" className="presentation-button" onClick={handleClose}>
            Revenir à l'application
          </button>
        </div>
      </header>

      {context.usedFallback && context.requestedId && (
        <p className="presentation-banner">
          Aucun projet avec l'identifiant « {context.requestedId} » n'a été trouvé. La présentation affiche le projet de démonstration.
        </p>
      )}

      <main className="presentation-content">
        <ProjectShowcase
          projectName={derived.projectName}
          analysis={derived.analysis || context.analysis}
          relevantTeams={derived.relevantTeams.length > 0 ? derived.relevantTeams : context.relevantTeams}
          questions={derived.activeQuestions.length > 0 ? derived.activeQuestions : context.questions}
          answers={answers}
          timelineDetails={derived.timelineDetails.length > 0 ? derived.timelineDetails : context.timelineDetails}
          onClose={handleClose}
          renderInStandalone
          selectedTheme={selectedTheme}
          onThemeChange={handleThemeSelection}
          themeOptions={themeOptions}
          isDemoProject={context.isDemoProject}
          projectMeta={context.projectMeta}
          allowEditing={isEditingMode}
          onEditQuestion={handleRequestEdit}
          onRequestEnableEditing={handleRequestEnableEditing}
        />
      </main>

      {editorState ? (
        <ShowcaseAnswerEditor
          question={editorState.question}
          label={editorState.label}
          value={editorState.value}
          onCancel={() => setEditorState(null)}
          onSave={handleAnswerSave}
        />
      ) : null}
    </div>
  );
};

const normalizeMultiChoiceValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? item.trim() : item)).filter((item) => {
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

const getInitialDraftValue = (question, value) => {
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

const ShowcaseAnswerEditor = ({ question, label, value, onCancel, onSave }) => {
  const [draft, setDraft] = useState(() => getInitialDraftValue(question, value));
  const formRef = useRef(null);

  useEffect(() => {
    setDraft(getInitialDraftValue(question, value));
  }, [question, value]);

  useEffect(() => {
    const node = formRef.current;
    if (!node) {
      return;
    }

    const focusable = node.querySelector('input, textarea, select, button');
    if (focusable && typeof focusable.focus === 'function') {
      focusable.focus();
    }
  }, [question]);

  useEffect(() => {
    const handleEscape = (event) => {
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

  const handleSubmit = (event) => {
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

    onSave(question.id, draft ?? '');
  };

  const handleToggleOption = (option) => {
    setDraft((previous) => {
      const current = Array.isArray(previous) ? [...previous] : [];
      const index = current.indexOf(option);
      if (index >= 0) {
        current.splice(index, 1);
        return current;
      }
      current.push(option);
      return current;
    });
  };

  const guidance = question.guidance || {};
  const options = Array.isArray(question.options) ? question.options : [];

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-slate-900/60" aria-hidden="true" onClick={onCancel} />
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-2xl space-y-6 rounded-2xl bg-white p-6 shadow-2xl"
      >
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Édition vitrine</p>
          <h2 className="text-xl font-bold text-slate-900">{label || question.question}</h2>
        </header>
        {guidance.objective ? (
          <div className="rounded-lg border border-indigo-100 bg-indigo-50/80 p-3 text-sm text-indigo-700">
            {guidance.objective}
          </div>
        ) : null}
        {guidance.details ? (
          <p className="text-sm text-slate-600">{guidance.details}</p>
        ) : null}
        <div>
          {question.type === 'multi_choice' ? (
            <div className="space-y-3">
              {options.length === 0 ? (
                <p className="text-sm text-slate-500">Aucune option disponible pour cette question.</p>
              ) : null}
              {options.map((option) => {
                const checked = Array.isArray(draft) ? draft.includes(option) : false;
                return (
                  <label key={option} className="flex items-center gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
                      checked={checked}
                      onChange={() => handleToggleOption(option)}
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
          ) : question.type === 'long_text' ? (
            <textarea
              rows={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={typeof draft === 'string' ? draft : ''}
              onChange={(event) => setDraft(event.target.value)}
            />
          ) : (
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={typeof draft === 'string' ? draft : ''}
              onChange={(event) => setDraft(event.target.value)}
            />
          )}
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
            onClick={onCancel}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};

const rootElement = document.getElementById('presentation-root');

if (rootElement && ReactDOM) {
  if (typeof ReactDOM.createRoot === 'function') {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<PresentationPage />);
  } else if (typeof ReactDOM.render === 'function') {
    ReactDOM.render(<PresentationPage />, rootElement);
  } else {
    console.error('Aucune méthode de rendu ReactDOM disponible.');
  }
}

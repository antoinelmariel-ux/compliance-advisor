import React, { useMemo, useEffect, useCallback, useState } from './react.js';
import { ReactDOM } from './react.js';
import {
  ProjectShowcase,
  SHOWCASE_THEMES,
  getInitialShowcaseTheme
} from './components/ProjectShowcase.jsx';
import { loadPersistedState } from './utils/storage.js';
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
    timelineDetails,
    usedFallback,
    isDemoProject,
    projectMeta
  };
};

const PresentationPage = () => {
  const context = useMemo(buildPresentationContext, []);

  const themeOptions = SHOWCASE_THEMES;
  const [selectedTheme, setSelectedTheme] = useState(() => getInitialShowcaseTheme(themeOptions));

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
      document.title = `${context.projectName} · Présentation`;
    }
  }, [context]);

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
          <p className="presentation-subtitle">{context.projectName}</p>
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
          projectName={context.projectName}
          analysis={context.analysis}
          relevantTeams={context.relevantTeams}
          questions={context.questions}
          answers={context.answers}
          timelineDetails={context.timelineDetails}
          onClose={handleClose}
          renderInStandalone
          selectedTheme={selectedTheme}
          onThemeChange={handleThemeSelection}
          themeOptions={themeOptions}
          isDemoProject={context.isDemoProject}
          projectMeta={context.projectMeta}
        />
      </main>
    </div>
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
